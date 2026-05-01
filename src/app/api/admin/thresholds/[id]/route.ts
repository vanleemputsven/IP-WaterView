import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { updateThresholdValue } from "@/lib/services/threshold-service";
import { createLog } from "@/lib/services/log-service";
import { patchThresholdBodySchema } from "@/lib/validation/threshold";

const thresholdIdParamSchema = z.string().cuid();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const idParse = thresholdIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid threshold id" }, { status: 400 });
  }
  const id = idParse.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const bodyParse = patchThresholdBodySchema.safeParse(json);
  if (!bodyParse.success) {
    const msg = bodyParse.error.issues[0]?.message ?? "Invalid body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const before = await prisma.threshold.findUnique({
    where: { id },
    select: { key: true, value: true },
  });

  const result = await updateThresholdValue({
    id,
    value: bodyParse.data.value,
  });

  if (!result.ok) {
    if (result.error === "not_found") {
      return NextResponse.json({ error: "Threshold not found" }, { status: 404 });
    }
    const msg =
      result.message ??
      (result.error === "inconsistent_min_max"
        ? "Min must stay below max for this metric."
        : "Invalid value.");
    const status =
      result.error === "inconsistent_min_max"
        ? 409
        : result.error === "invalid_value"
          ? 422
          : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  await createLog({
    actorType: "user",
    actorId: profile.id,
    action: "threshold.updated",
    resource: "threshold",
    metadata: {
      thresholdId: result.id,
      key: result.key,
      previousValue: before ? Number(before.value) : null,
      value: result.value,
    },
  });

  return NextResponse.json({
    id: result.id,
    key: result.key,
    value: result.value,
  });
}

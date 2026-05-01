import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { changeProfileRole } from "@/lib/services/profile-role-service";
import { createLog } from "@/lib/services/log-service";

const profileIdParamSchema = z.string().cuid();

const patchBodySchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]),
  })
  .strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const idParse = profileIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
  }
  const profileId = idParse.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actorProfile = await getProfileByUserId(user.id);
  if (!actorProfile || !canAccessAdmin(actorProfile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const bodyParse = patchBodySchema.safeParse(json);
  if (!bodyParse.success) {
    const msg = bodyParse.error.issues[0]?.message ?? "Invalid body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const result = await changeProfileRole({
    profileId,
    nextRole: bodyParse.data.role,
  });

  if (!result.ok) {
    if (result.error === "profile_not_found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        error:
          "Cannot remove the last administrator. Promote another user before demoting this account.",
      },
      { status: 409 }
    );
  }

  await createLog({
    actorType: "user",
    actorId: actorProfile.id,
    action: "profile.role_updated",
    resource: "profile",
    metadata: {
      targetProfileId: profileId,
      role: result.profile.role,
    },
  });

  return NextResponse.json({
    id: result.profile.id,
    role: result.profile.role,
  });
}

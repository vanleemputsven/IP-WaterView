import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createLog } from "@/lib/services/log-service";
import { upsertDevicePoolDosingSettings } from "@/lib/services/device-pool-dosing-settings-service";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { poolDosingSettingsBodySchema } from "@/lib/validation/pool-dosing-settings";

const deviceIdParamSchema = z.string().cuid();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const idParse = deviceIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid device id" }, { status: 400 });
  }
  const deviceId = idParse.data;

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
  const parsed = poolDosingSettingsBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const saved = await upsertDevicePoolDosingSettings({
      deviceId,
      data: parsed.data,
    });

    await createLog({
      actorType: "user",
      actorId: profile.id,
      action: "device_pool_dosing.updated",
      resource: "device_pool_dosing_settings",
      metadata: {
        deviceId,
        volumeLiters: saved.volumeLiters,
      },
    });

    return NextResponse.json(saved);
  } catch (e) {
    if (
      e instanceof Error &&
      e.message === "device_not_found_or_forbidden"
    ) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Unable to save pool dosing settings." },
      { status: 500 },
    );
  }
}

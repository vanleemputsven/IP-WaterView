import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { hashApiKeyForStorage } from "@/lib/auth/device-auth";
import { generateDeviceApiKey } from "@/lib/devices/generate-device-api-key";
import { createLog } from "@/lib/services/log-service";

const deviceIdParamSchema = z.string().cuid();

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const idParse = deviceIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid device id" }, { status: 400 });
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

  const existing = await prisma.device.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const apiKey = generateDeviceApiKey();
  const apiKeyHash = hashApiKeyForStorage(apiKey);

  try {
    await prisma.device.update({
      where: { id },
      data: { apiKeyHash, updatedAt: new Date() },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update device key" },
      { status: 500 }
    );
  }

  await createLog({
    actorType: "user",
    actorId: profile.id,
    action: "device.api_key.rotated",
    resource: "device",
    metadata: { deviceId: id, name: existing.name },
  });

  return NextResponse.json({
    id: existing.id,
    name: existing.name,
    apiKey,
    message: "Save this API key securely. The previous key no longer works.",
  });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { hashApiKeyForStorage } from "@/lib/auth/device-auth";
import { randomBytes } from "crypto";
import { createLog } from "@/lib/services/log-service";

function generateApiKey(): string {
  return `wv_${randomBytes(24).toString("hex")}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "Pool Monitor";
  const seedMeasurements = body.seedMeasurements !== false;

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKeyForStorage(apiKey);

  const device = await prisma.device.create({
    data: {
      name: name || "Pool Monitor",
      apiKeyHash,
      profileId: profile.id,
      isActive: true,
    },
  });

  if (seedMeasurements) {
    const now = new Date();
    const measurements = [];
    for (let i = 168; i >= 0; i--) {
      const t = new Date(now);
      t.setHours(t.getHours() - i);
      measurements.push({
        deviceId: device.id,
        timestamp: t,
        temperatureCelsius: 24 + Math.sin(i / 12) * 2 + (Math.random() - 0.5) * 1,
        ph: 7.2 + Math.sin(i / 24) * 0.3 + (Math.random() - 0.5) * 0.2,
        chlorinePpm: 1.5 + Math.sin(i / 48) * 0.5 + (Math.random() - 0.5) * 0.3,
      });
    }
    await prisma.measurement.createMany({ data: measurements });
  }

  await createLog({
    actorType: "user",
    actorId: profile.id,
    action: "device.created",
    resource: "device",
    metadata: { deviceId: device.id, name: device.name },
  });

  return NextResponse.json(
    {
      id: device.id,
      name: device.name,
      apiKey,
      message:
        "Save the API key securely. It will not be shown again.",
    },
    { status: 201 }
  );
}

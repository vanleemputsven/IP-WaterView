import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { hashApiKeyForStorage } from "@/lib/auth/device-auth";
import { generateDeviceApiKey } from "@/lib/devices/generate-device-api-key";
import { createLog } from "@/lib/services/log-service";

const postDeviceBodySchema = z
  .object({
    name: z.string().max(120).optional(),
    seedMeasurements: z.boolean().optional(),
  })
  .strict();

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

  const raw = await request.json().catch(() => ({}));
  const parsed = postDeviceBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }

  const trimmedName =
    typeof parsed.data.name === "string" ? parsed.data.name.trim() : "";
  const name = trimmedName.length > 0 ? trimmedName : "Pool Monitor";
  /** Demo measurements are opt-in only (`seedMeasurements: true`). */
  const seedMeasurements = parsed.data.seedMeasurements === true;

  const apiKey = generateDeviceApiKey();
  const apiKeyHash = hashApiKeyForStorage(apiKey);

  let device: { id: string; name: string };

  try {
    device = await prisma.device.create({
      data: {
        name,
        apiKeyHash,
        profileId: profile.id,
        isActive: true,
      },
      select: { id: true, name: true },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "You already have a device with this name. Each device needs a unique name on your account.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }

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
    metadata: {
      deviceId: device.id,
      name: device.name,
      seedDemoMeasurements: seedMeasurements,
    },
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

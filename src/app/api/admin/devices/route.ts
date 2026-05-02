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
import {
  thresholdValueSchemaForKey,
  validateThresholdKeyValueSet,
} from "@/lib/validation/threshold";

const postDeviceBodySchema = z
  .object({
    name: z.string().max(120).optional(),
    seedMeasurements: z.boolean().optional(),
    initialThresholds: z
      .array(
        z.object({
          key: z.string().min(1).max(64),
          value: z.number().finite(),
        }),
      )
      .max(32)
      .optional(),
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
  const rawOverrides = parsed.data.initialThresholds ?? [];

  const defaultRows = await prisma.threshold.findMany({
    orderBy: { key: "asc" },
  });
  const defaultKeySet = new Set(defaultRows.map((r) => r.key));

  const overrideKeysSeen = new Set<string>();
  for (const row of rawOverrides) {
    if (overrideKeysSeen.has(row.key)) {
      return NextResponse.json(
        { error: `Duplicate threshold key in request: ${row.key}` },
        { status: 400 },
      );
    }
    overrideKeysSeen.add(row.key);
    if (!defaultKeySet.has(row.key)) {
      return NextResponse.json(
        { error: `Unknown threshold key: ${row.key}` },
        { status: 400 },
      );
    }
  }

  const overrideMap = new Map(rawOverrides.map((x) => [x.key, x.value]));

  let mergedThresholds: { key: string; value: number }[] = [];
  if (defaultRows.length > 0) {
    mergedThresholds = defaultRows.map((t) => ({
      key: t.key,
      value: overrideMap.has(t.key) ? overrideMap.get(t.key)! : Number(t.value),
    }));

    for (const row of mergedThresholds) {
      const schema = thresholdValueSchemaForKey(row.key);
      const pv = schema.safeParse(row.value);
      if (!pv.success) {
        const msg =
          pv.error.issues[0]?.message ?? `Invalid value for ${row.key}`;
        return NextResponse.json({ error: msg }, { status: 422 });
      }
    }

    const pairs = validateThresholdKeyValueSet(mergedThresholds);
    if (!pairs.ok) {
      return NextResponse.json({ error: pairs.message }, { status: 409 });
    }
  }
  const apiKey = generateDeviceApiKey();
  const apiKeyHash = hashApiKeyForStorage(apiKey);

  let device: { id: string; name: string };

  try {
    device = await prisma.$transaction(async (tx) => {
      const d = await tx.device.create({
        data: {
          name,
          apiKeyHash,
          profileId: profile.id,
          isActive: true,
        },
        select: { id: true, name: true },
      });
      const defaults = await tx.threshold.findMany({ orderBy: { key: "asc" } });
      if (defaults.length > 0) {
        await tx.deviceThreshold.createMany({
          data: mergedThresholds.map((m) => ({
            deviceId: d.id,
            key: m.key,
            value: m.value,
            unit: defaults.find((t) => t.key === m.key)?.unit ?? null,
          })),
        });
      }
      return d;
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
      initialThresholdOverrideCount: rawOverrides.length,
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

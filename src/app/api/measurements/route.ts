import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveDeviceFromRequest } from "@/lib/auth/device-auth";
import { measurementIngestSchema } from "@/lib/validation/measurement";
import { createMeasurement } from "@/lib/repositories/measurement-repository";
import { createLog } from "@/lib/services/log-service";

export async function POST(request: Request) {
  const device = await resolveDeviceFromRequest(request);
  if (!device) {
    await createLog({
      actorType: "device",
      action: "measurement.ingest.unauthorized",
      resource: "measurement",
      metadata: { reason: "invalid_or_missing_api_key" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = measurementIngestSchema.safeParse(body);
  if (!parsed.success) {
    await createLog({
      actorType: "device",
      actorId: device.deviceId,
      action: "measurement.ingest.validation_failed",
      resource: "measurement",
      metadata: { errors: parsed.error.flatten() },
    });
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

  try {
    await prisma.device.update({
      where: { id: device.deviceId },
      data: { lastSeenAt: new Date() },
    });

    const measurement = await createMeasurement({
      deviceId: device.deviceId,
      temperatureCelsius: data.temperatureCelsius,
      ph: data.ph,
      chlorinePpm: data.chlorinePpm,
      timestamp,
    });

    await createLog({
      actorType: "device",
      actorId: device.deviceId,
      action: "measurement.ingest.success",
      resource: "measurement",
      metadata: { measurementId: measurement.id },
    });

    return NextResponse.json(
      { id: measurement.id, timestamp: measurement.timestamp.toISOString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("[measurements] ingest error:", err);
    await createLog({
      actorType: "device",
      actorId: device.deviceId,
      action: "measurement.ingest.error",
      resource: "measurement",
      metadata: { error: "internal_error" },
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

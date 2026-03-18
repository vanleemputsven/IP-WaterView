import { prisma } from "@/lib/db/prisma";
import type { Decimal } from "@prisma/client/runtime/library";

export type CreateMeasurementInput = {
  deviceId: string;
  temperatureCelsius?: Decimal | number | null;
  ph?: Decimal | number | null;
  chlorinePpm?: Decimal | number | null;
  timestamp?: Date;
};

export async function createMeasurement(input: CreateMeasurementInput) {
  return prisma.measurement.create({
    data: {
      deviceId: input.deviceId,
      temperatureCelsius: input.temperatureCelsius ?? undefined,
      ph: input.ph ?? undefined,
      chlorinePpm: input.chlorinePpm ?? undefined,
      timestamp: input.timestamp ?? new Date(),
    },
  });
}

export async function getLatestMeasurements(deviceId: string, limit = 100) {
  return prisma.measurement.findMany({
    where: { deviceId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

export async function getMeasurementsInRange(
  deviceId: string,
  from: Date,
  to: Date
) {
  return prisma.measurement.findMany({
    where: {
      deviceId,
      timestamp: { gte: from, lte: to },
    },
    orderBy: { timestamp: "asc" },
  });
}

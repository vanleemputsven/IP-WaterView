import { prisma } from "@/lib/db/prisma";
import {
  thresholdValueSchemaForKey,
  validateThresholdMinMaxPairs,
  type ThresholdKeyValue,
} from "@/lib/validation/threshold";

export type UpdateThresholdResult =
  | { ok: true; id: string; key: string; value: number; deviceId?: string }
  | {
      ok: false;
      error: "not_found" | "invalid_value" | "inconsistent_min_max";
      message?: string;
    };

/** Copies platform `Threshold` rows into `DeviceThreshold` for one device (idempotent keys). */
export async function copyPlatformThresholdsToDevice(
  deviceId: string,
): Promise<number> {
  const defaults = await prisma.threshold.findMany();
  if (defaults.length === 0) return 0;
  const result = await prisma.deviceThreshold.createMany({
    data: defaults.map((t) => ({
      deviceId,
      key: t.key,
      value: t.value,
      unit: t.unit,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

/** Ensures a device has threshold rows (lazy migration / repair). */
export async function ensureDeviceThresholdsForDevice(
  deviceId: string,
): Promise<void> {
  const n = await prisma.deviceThreshold.count({ where: { deviceId } });
  if (n > 0) return;
  await copyPlatformThresholdsToDevice(deviceId);
}

export async function updateThresholdValue(params: {
  id: string;
  value: number;
}): Promise<UpdateThresholdResult> {
  const existing = await prisma.threshold.findUnique({
    where: { id: params.id },
    select: { id: true, key: true, value: true },
  });

  if (!existing) {
    return { ok: false, error: "not_found" };
  }

  const schema = thresholdValueSchemaForKey(existing.key);
  const parsed = schema.safeParse(params.value);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "Value is out of the allowed range.";
    return { ok: false, error: "invalid_value", message: msg };
  }

  const allRows = await prisma.threshold.findMany({
    select: { key: true, value: true },
  });

  const rowPayload: ThresholdKeyValue[] = allRows.map((r) => ({
    key: r.key,
    value: Number(r.value),
  }));

  const pairCheck = validateThresholdMinMaxPairs(rowPayload, {
    key: existing.key,
    value: parsed.data,
  });

  if (!pairCheck.ok) {
    return {
      ok: false,
      error: "inconsistent_min_max",
      message: pairCheck.message,
    };
  }

  await prisma.threshold.update({
    where: { id: params.id },
    data: { value: parsed.data },
  });

  return {
    ok: true,
    id: existing.id,
    key: existing.key,
    value: parsed.data,
  };
}

export async function updateDeviceThresholdValue(params: {
  id: string;
  value: number;
}): Promise<UpdateThresholdResult> {
  const existing = await prisma.deviceThreshold.findUnique({
    where: { id: params.id },
    select: { id: true, key: true, deviceId: true, value: true },
  });

  if (!existing) {
    return { ok: false, error: "not_found" };
  }

  const schema = thresholdValueSchemaForKey(existing.key);
  const parsed = schema.safeParse(params.value);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "Value is out of the allowed range.";
    return { ok: false, error: "invalid_value", message: msg };
  }

  const allRows = await prisma.deviceThreshold.findMany({
    where: { deviceId: existing.deviceId },
    select: { key: true, value: true },
  });

  const rowPayload: ThresholdKeyValue[] = allRows.map((r) => ({
    key: r.key,
    value: Number(r.value),
  }));

  const pairCheck = validateThresholdMinMaxPairs(rowPayload, {
    key: existing.key,
    value: parsed.data,
  });

  if (!pairCheck.ok) {
    return {
      ok: false,
      error: "inconsistent_min_max",
      message: pairCheck.message,
    };
  }

  await prisma.deviceThreshold.update({
    where: { id: params.id },
    data: { value: parsed.data },
  });

  return {
    ok: true,
    id: existing.id,
    key: existing.key,
    value: parsed.data,
    deviceId: existing.deviceId,
  };
}

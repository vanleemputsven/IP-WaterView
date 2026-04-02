import type { Measurement } from "@prisma/client";

/** Serializable measurement for Client Components (no Prisma Decimal). */
export type ClientMeasurement = {
  id: string;
  deviceId: string;
  timestamp: string;
  temperatureCelsius: number | null;
  ph: number | null;
  chlorinePpm: number | null;
  device?: { name: string };
  deviceName?: string;
};

function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && "toString" in value) {
    const n = parseFloat((value as { toString: () => string }).toString());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function mapMeasurementToClient(
  m: Measurement & { device?: { name: string }; deviceName?: string }
): ClientMeasurement {
  const row: ClientMeasurement = {
    id: m.id,
    deviceId: m.deviceId,
    timestamp: m.timestamp.toISOString(),
    temperatureCelsius: decimalToNumber(m.temperatureCelsius),
    ph: decimalToNumber(m.ph),
    chlorinePpm: decimalToNumber(m.chlorinePpm),
  };
  if (m.device) row.device = { name: m.device.name };
  if (m.deviceName !== undefined) row.deviceName = m.deviceName;
  return row;
}

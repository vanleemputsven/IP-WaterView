import type { DevicePoolDosingSettings } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { PoolDosingSettingsPayload } from "@/lib/validation/pool-dosing-settings";

/** Serializable dosing fields for UI / calculator (same shape as before profile-level storage). */
export type PoolDosingSettingsDTO = {
  volumeLiters: number;
  chlorineProductKind: DevicePoolDosingSettings["chlorineProductKind"];
  chlorineActivePercentOverride: number | null;
  phMinusKind: DevicePoolDosingSettings["phMinusKind"];
  phMinusConcentrationPercentOverride: number | null;
  phPlusKind: DevicePoolDosingSettings["phPlusKind"];
  phPlusPurityPercentOverride: number | null;
};

function rowToDto(row: DevicePoolDosingSettings): PoolDosingSettingsDTO {
  return {
    volumeLiters: Number(row.volumeLiters),
    chlorineProductKind: row.chlorineProductKind,
    chlorineActivePercentOverride:
      row.chlorineActivePercentOverride === null
        ? null
        : Number(row.chlorineActivePercentOverride),
    phMinusKind: row.phMinusKind,
    phMinusConcentrationPercentOverride:
      row.phMinusConcentrationPercentOverride === null
        ? null
        : Number(row.phMinusConcentrationPercentOverride),
    phPlusKind: row.phPlusKind,
    phPlusPurityPercentOverride:
      row.phPlusPurityPercentOverride === null
        ? null
        : Number(row.phPlusPurityPercentOverride),
  };
}

export async function getDevicePoolDosingSettings(
  deviceId: string,
): Promise<PoolDosingSettingsDTO | null> {
  const row = await prisma.devicePoolDosingSettings.findUnique({
    where: { deviceId },
  });
  return row ? rowToDto(row) : null;
}

/** Batch fetch keyed by device id (missing rows → null). */
export async function getPoolDosingSettingsForDevices(
  deviceIds: readonly string[],
): Promise<Record<string, PoolDosingSettingsDTO | null>> {
  const unique = [...new Set(deviceIds)].filter(Boolean);
  const out: Record<string, PoolDosingSettingsDTO | null> = {};
  for (const id of unique) {
    out[id] = null;
  }
  if (unique.length === 0) return out;

  const rows = await prisma.devicePoolDosingSettings.findMany({
    where: { deviceId: { in: unique } },
  });
  for (const row of rows) {
    out[row.deviceId] = rowToDto(row);
  }
  return out;
}

/**
 * Upserts pool dosing settings for a device. Caller must enforce authorization
 * (e.g. admin-only API): any existing device id is accepted.
 */
export async function upsertDevicePoolDosingSettings(params: {
  deviceId: string;
  data: PoolDosingSettingsPayload;
}): Promise<PoolDosingSettingsDTO> {
  const { deviceId, data } = params;

  const exists = await prisma.device.findFirst({
    where: { id: deviceId },
    select: { id: true },
  });
  if (!exists) {
    throw new Error("device_not_found_or_forbidden");
  }

  const chlorineOverride =
    data.chlorineProductKind === "CUSTOM"
      ? data.chlorineActivePercentOverride ?? null
      : null;

  const phMinusOverride =
    data.phMinusKind === "CUSTOM"
      ? data.phMinusConcentrationPercentOverride ?? null
      : null;

  const phPlusOverride =
    data.phPlusKind === "CUSTOM"
      ? data.phPlusPurityPercentOverride ?? null
      : null;

  const row = await prisma.devicePoolDosingSettings.upsert({
    where: { deviceId },
    create: {
      deviceId,
      volumeLiters: data.volumeLiters,
      chlorineProductKind: data.chlorineProductKind,
      chlorineActivePercentOverride: chlorineOverride,
      phMinusKind: data.phMinusKind,
      phMinusConcentrationPercentOverride: phMinusOverride,
      phPlusKind: data.phPlusKind,
      phPlusPurityPercentOverride: phPlusOverride,
    },
    update: {
      volumeLiters: data.volumeLiters,
      chlorineProductKind: data.chlorineProductKind,
      chlorineActivePercentOverride: chlorineOverride,
      phMinusKind: data.phMinusKind,
      phMinusConcentrationPercentOverride: phMinusOverride,
      phPlusKind: data.phPlusKind,
      phPlusPurityPercentOverride: phPlusOverride,
    },
  });

  return rowToDto(row);
}

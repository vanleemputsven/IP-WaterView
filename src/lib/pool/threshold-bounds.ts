/**
 * Pool metric bounds for dashboard display — aligned with platform defaults (see prisma/seed.ts)
 * and per-device overrides in `device_thresholds`.
 */

export type MetricBounds = { min: number; max: number };

/** Bounds used when a device has no threshold rows yet. */
export const DEFAULT_POOL_THRESHOLD_BOUNDS: Readonly<{
  temperature: MetricBounds;
  ph: MetricBounds;
  chlorine: MetricBounds;
}> = {
  temperature: { min: 22, max: 28 },
  ph: { min: 7.0, max: 7.6 },
  chlorine: { min: 1, max: 3 },
};

export type PoolThresholdBounds = {
  temperature: MetricBounds;
  ph: MetricBounds;
  chlorine: MetricBounds;
};

function decimalLikeToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object" && "toString" in value) {
    const n = parseFloat((value as { toString: () => string }).toString());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function readPair(
  map: Map<string, number>,
  minKey: string,
  maxKey: string,
  fallback: MetricBounds,
): MetricBounds {
  const lo = map.get(minKey);
  const hi = map.get(maxKey);
  if (lo === undefined || hi === undefined) return fallback;
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo >= hi) return fallback;
  return { min: lo, max: hi };
}

/** Builds resolved bounds for one device from its threshold rows (missing pairs → defaults). */
export function poolThresholdBoundsFromRows(
  rows: readonly { key: string; value: unknown }[],
): PoolThresholdBounds {
  const map = new Map<string, number>();
  for (const r of rows) {
    const n = decimalLikeToNumber(r.value);
    if (n !== null) map.set(r.key, n);
  }
  return {
    temperature: readPair(
      map,
      "temperature_min",
      "temperature_max",
      DEFAULT_POOL_THRESHOLD_BOUNDS.temperature,
    ),
    ph: readPair(map, "ph_min", "ph_max", DEFAULT_POOL_THRESHOLD_BOUNDS.ph),
    chlorine: readPair(
      map,
      "chlorine_min",
      "chlorine_max",
      DEFAULT_POOL_THRESHOLD_BOUNDS.chlorine,
    ),
  };
}

export type RangeStatus = "in_range" | "below" | "above" | "unknown";

export function classifyAgainstBounds(
  value: number | null,
  bounds: MetricBounds,
): RangeStatus {
  if (value === null || Number.isNaN(value)) return "unknown";
  if (value < bounds.min) return "below";
  if (value > bounds.max) return "above";
  return "in_range";
}

import { z } from "zod";

const finite = z.number().finite();

/** Allowed numeric range per known threshold key prefix. */
export function thresholdValueSchemaForKey(key: string) {
  if (key.startsWith("temperature_")) {
    return finite.min(0).max(45);
  }
  if (key.startsWith("ph_")) {
    return finite.min(6).max(9);
  }
  if (key.startsWith("chlorine_")) {
    return finite.min(0).max(10);
  }
  return finite.min(-1_000).max(1_000);
}

export const patchThresholdBodySchema = z
  .object({
    value: z.union([
      z.number().finite(),
      z
        .string()
        .trim()
        .min(1, "Value is required")
        .transform((s, ctx) => {
          const normalized = s.replace(",", ".");
          const n = Number(normalized);
          if (!Number.isFinite(n)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Value must be a number",
            });
            return z.NEVER;
          }
          return n;
        }),
    ]),
  })
  .strict();

export type ThresholdKeyValue = { key: string; value: number };

const ORDERED_PAIRS: readonly [string, string][] = [
  ["temperature_min", "temperature_max"],
  ["ph_min", "ph_max"],
  ["chlorine_min", "chlorine_max"],
];

/**
 * Ensures min &lt; max for known paired thresholds after applying a pending change.
 */
export function validateThresholdMinMaxPairs(
  rows: readonly ThresholdKeyValue[],
  pending: { key: string; value: number },
): { ok: true } | { ok: false; message: string } {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  map.set(pending.key, pending.value);

  for (const [minKey, maxKey] of ORDERED_PAIRS) {
    const lo = map.get(minKey);
    const hi = map.get(maxKey);
    if (lo === undefined || hi === undefined) continue;
    if (lo >= hi) {
      let message = `${minKey} must be less than ${maxKey}.`;
      if (minKey.startsWith("temperature_")) {
        message = "Temperature min must be less than max.";
      } else if (minKey.startsWith("ph_")) {
        message = "pH min must be less than max.";
      } else if (minKey.startsWith("chlorine_")) {
        message = "Chlorine min must be less than max.";
      }
      return { ok: false, message };
    }
  }

  return { ok: true };
}

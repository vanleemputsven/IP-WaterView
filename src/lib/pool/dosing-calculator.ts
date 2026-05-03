import type {
  ChlorineProductKind,
  PhMinusKind,
  PhPlusKind,
} from "@prisma/client";
import type { MetricBounds } from "@/lib/pool/threshold-bounds";

/** Conservative single-step caps — large swings should be staged and re-tested. */
export const MAX_SINGLE_STEP_CHLORINE_PPM = 5;
export const MAX_SINGLE_STEP_PH = 0.35;

/** Assumed density for sodium hypochlorite solutions when converting g → ml for pouring. */
export const LIQUID_HYPOCHLORITE_DENSITY_G_PER_ML = 1.15;

const REFERENCE_HCL_PERCENT = 31.45;

export type PoolDosingProductConfig = {
  volumeLiters: number;
  chlorineProductKind: ChlorineProductKind;
  chlorineActivePercentOverride: number | null;
  phMinusKind: PhMinusKind;
  phMinusConcentrationPercentOverride: number | null;
  phPlusKind: PhPlusKind;
  phPlusPurityPercentOverride: number | null;
};

export type ChlorineDoseHint =
  | {
      kind: "none";
      reason: "in_range" | "above_range" | "no_reading";
      detail?: string;
    }
  | {
      kind: "raise";
      measuredPpm: number;
      targetPpm: number;
      deltaPpm: number;
      productGrams: number;
      productMl: number | null;
      displayUnit: "ml" | "g";
    };

export type PhDoseHint =
  | {
      kind: "none";
      reason:
        | "in_range"
        | "no_reading"
        | "needs_raise_but_uncertain"
        | "needs_lower_but_uncertain";
      detail?: string;
    }
  | {
      kind: "raise_ph";
      measured: number;
      target: number;
      deltaPh: number;
      productGrams: number | null;
      productMl: number | null;
      displayUnit: "g" | "ml";
    }
  | {
      kind: "lower_ph";
      measured: number;
      target: number;
      deltaPh: number;
      productGrams: number | null;
      productMl: number | null;
      displayUnit: "g" | "ml";
    };

function midpoint(bounds: MetricBounds): number {
  return (bounds.min + bounds.max) / 2;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function presetAvailableChlorinePercent(
  kind: ChlorineProductKind,
): number | null {
  switch (kind) {
    case "SODIUM_HYPOCHLORITE_14":
      return 14;
    case "SODIUM_HYPOCHLORITE_125":
      return 12.5;
    case "CALCIUM_HYPOCHLORITE_65":
      return 65;
    case "TRICHLOR_90":
      return 90;
    case "DICHLOR_56":
      return 56;
    case "LITHIUM_HYPOCHLORITE_35":
      return 35;
    case "CUSTOM":
      return null;
    default:
      return null;
  }
}

export function isLiquidHypochloritePreset(kind: ChlorineProductKind): boolean {
  return (
    kind === "SODIUM_HYPOCHLORITE_14" || kind === "SODIUM_HYPOCHLORITE_125"
  );
}

/**
 * Mass of sanitizer product (g) to raise free chlorine by Δppm in volume V (liters),
 * given labeled available chlorine percent P (w/w).
 *
 * Derivation: need Δ mg/L × V L = Δ·V mg active chlorine.
 * Product contributes P/100 g active per g product ⇒
 * mass_product = (Δ·V / 1000) / (P/100) = (Δ·V) / (10·P).
 */
export function chlorineProductMassGrams(params: {
  deltaPpm: number;
  volumeLiters: number;
  availableChlorinePercent: number;
}): number {
  const { deltaPpm, volumeLiters, availableChlorinePercent } = params;
  if (
    deltaPpm <= 0 ||
    volumeLiters <= 0 ||
    availableChlorinePercent <= 0
  ) {
    return 0;
  }
  return (deltaPpm * volumeLiters) / (10 * availableChlorinePercent);
}

function resolveAvailableChlorinePercent(
  cfg: PoolDosingProductConfig,
): number | null {
  if (cfg.chlorineProductKind === "CUSTOM") {
    return cfg.chlorineActivePercentOverride;
  }
  return presetAvailableChlorinePercent(cfg.chlorineProductKind);
}

export function computeChlorineDoseHint(params: {
  cfg: PoolDosingProductConfig;
  measuredPpm: number | null;
  bounds: MetricBounds;
}): ChlorineDoseHint {
  const { cfg, measuredPpm, bounds } = params;

  if (measuredPpm === null) {
    return { kind: "none", reason: "no_reading" };
  }

  if (measuredPpm > bounds.max) {
    return {
      kind: "none",
      reason: "above_range",
      detail:
        "Free chlorine is above your upper limit. Allow it to drift down naturally before adding more sanitizer.",
    };
  }

  const target = midpoint(bounds);
  if (measuredPpm >= bounds.min && measuredPpm <= bounds.max) {
    return {
      kind: "none",
      reason: "in_range",
      detail: `Reading is within ${bounds.min.toFixed(2)}–${bounds.max.toFixed(2)} ppm.`,
    };
  }

  const rawDelta = target - measuredPpm;
  const deltaPpm = clamp(rawDelta, 0, MAX_SINGLE_STEP_CHLORINE_PPM);
  const available = resolveAvailableChlorinePercent(cfg);
  if (available === null || available <= 0) {
    return {
      kind: "none",
      reason: "no_reading",
      detail: "Configure sanitizer type and labeled available chlorine %.",
    };
  }

  const productGrams = chlorineProductMassGrams({
    deltaPpm,
    volumeLiters: cfg.volumeLiters,
    availableChlorinePercent: available,
  });

  const liquid = isLiquidHypochloritePreset(cfg.chlorineProductKind);

  const productMl = liquid
    ? productGrams / LIQUID_HYPOCHLORITE_DENSITY_G_PER_ML
    : null;

  return {
    kind: "raise",
    measuredPpm,
    targetPpm: target,
    deltaPpm,
    productGrams,
    productMl,
    displayUnit: liquid ? "ml" : "g",
  };
}

function acidMlPerLiterPerPhDrop(phMinusKind: PhMinusKind): number | null {
  switch (phMinusKind) {
    case "MURIATIC_31":
      return 0.053;
    case "SULFURIC_38":
      return 0.053 * (REFERENCE_HCL_PERCENT / 38) * 0.92;
    case "DRY_ACID_SODIUM_BISULFATE":
      return null;
    case "CUSTOM":
      return null;
    default:
      return null;
  }
}

function dryAcidGramsPerLiterPerPhDrop(): number {
  return 0.018;
}

function sodaAshGramsPerLiterPerPhDrop(): number {
  return 0.024;
}

function bicarbGramsPerLiterPerPhDrop(): number {
  return 0.034;
}

export function computePhDoseHint(params: {
  cfg: PoolDosingProductConfig;
  measuredPh: number | null;
  bounds: MetricBounds;
}): PhDoseHint {
  const { cfg, measuredPh, bounds } = params;

  if (measuredPh === null) {
    return { kind: "none", reason: "no_reading" };
  }

  const target = midpoint(bounds);

  if (measuredPh >= bounds.min && measuredPh <= bounds.max) {
    return {
      kind: "none",
      reason: "in_range",
      detail: `Reading is within ${bounds.min.toFixed(2)}–${bounds.max.toFixed(2)}.`,
    };
  }

  if (measuredPh < bounds.min) {
    const rawDelta = clamp(bounds.min - measuredPh, 0, MAX_SINGLE_STEP_PH);
    if (rawDelta <= 0) {
      return { kind: "none", reason: "in_range" };
    }

    switch (cfg.phPlusKind) {
      case "SODA_ASH": {
        const grams =
          sodaAshGramsPerLiterPerPhDrop() * cfg.volumeLiters * rawDelta;
        return {
          kind: "raise_ph",
          measured: measuredPh,
          target: bounds.min,
          deltaPh: rawDelta,
          productGrams: grams,
          productMl: null,
          displayUnit: "g",
        };
      }
      case "SODIUM_BICARBONATE": {
        const grams =
          bicarbGramsPerLiterPerPhDrop() * cfg.volumeLiters * rawDelta;
        return {
          kind: "raise_ph",
          measured: measuredPh,
          target: bounds.min,
          deltaPh: rawDelta,
          productGrams: grams,
          productMl: null,
          displayUnit: "g",
        };
      }
      case "CUSTOM": {
        const purity = cfg.phPlusPurityPercentOverride;
        if (purity === null || purity <= 0) {
          return {
            kind: "none",
            reason: "needs_raise_but_uncertain",
            detail: "Enter the labeled strength % for your pH increaser.",
          };
        }
        const baseline = sodaAshGramsPerLiterPerPhDrop();
        const grams =
          baseline * (100 / purity) * cfg.volumeLiters * rawDelta;
        return {
          kind: "raise_ph",
          measured: measuredPh,
          target: bounds.min,
          deltaPh: rawDelta,
          productGrams: grams,
          productMl: null,
          displayUnit: "g",
        };
      }
      default:
        return { kind: "none", reason: "no_reading" };
    }
  }

  const rawDelta = clamp(measuredPh - bounds.max, 0, MAX_SINGLE_STEP_PH);
  if (rawDelta <= 0) {
    return { kind: "none", reason: "in_range" };
  }

  switch (cfg.phMinusKind) {
    case "DRY_ACID_SODIUM_BISULFATE": {
      const grams =
        dryAcidGramsPerLiterPerPhDrop() * cfg.volumeLiters * rawDelta;
      return {
        kind: "lower_ph",
        measured: measuredPh,
        target: bounds.max,
        deltaPh: rawDelta,
        productGrams: grams,
        productMl: null,
        displayUnit: "g",
      };
    }
    case "MURIATIC_31":
    case "SULFURIC_38": {
      const base = acidMlPerLiterPerPhDrop(cfg.phMinusKind);
      if (base === null) {
        return {
          kind: "none",
          reason: "needs_lower_but_uncertain",
        };
      }
      const ml = base * cfg.volumeLiters * rawDelta;
      return {
        kind: "lower_ph",
        measured: measuredPh,
        target: bounds.max,
        deltaPh: rawDelta,
        productGrams: null,
        productMl: ml,
        displayUnit: "ml",
      };
    }
    case "CUSTOM": {
      const c = cfg.phMinusConcentrationPercentOverride;
      if (c === null || c <= 0) {
        return {
          kind: "none",
          reason: "needs_lower_but_uncertain",
          detail: "Enter the labeled acid strength % for your pH reducer.",
        };
      }
      const ml =
        0.053 * (REFERENCE_HCL_PERCENT / c) * cfg.volumeLiters * rawDelta;
      return {
        kind: "lower_ph",
        measured: measuredPh,
        target: bounds.max,
        deltaPh: rawDelta,
        productGrams: null,
        productMl: ml,
        displayUnit: "ml",
      };
    }
    default:
      return { kind: "none", reason: "needs_lower_but_uncertain" };
  }
}

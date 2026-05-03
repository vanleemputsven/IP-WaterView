import { z } from "zod";

export const chlorineProductKindSchema = z.enum([
  "SODIUM_HYPOCHLORITE_14",
  "SODIUM_HYPOCHLORITE_125",
  "CALCIUM_HYPOCHLORITE_65",
  "TRICHLOR_90",
  "DICHLOR_56",
  "LITHIUM_HYPOCHLORITE_35",
  "CUSTOM",
]);

export const phMinusKindSchema = z.enum([
  "MURIATIC_31",
  "DRY_ACID_SODIUM_BISULFATE",
  "SULFURIC_38",
  "CUSTOM",
]);

export const phPlusKindSchema = z.enum([
  "SODA_ASH",
  "SODIUM_BICARBONATE",
  "CUSTOM",
]);

const percentSchema = z.coerce
  .number()
  .positive()
  .max(100)
  .refine((n) => Number.isFinite(n), "Must be a finite number");

const volumeLitersSchema = z.coerce
  .number()
  .positive()
  .max(10_000_000)
  .refine((n) => Number.isFinite(n), "Must be a finite number");

export const poolDosingSettingsBodySchema = z
  .object({
    volumeLiters: volumeLitersSchema,
    chlorineProductKind: chlorineProductKindSchema,
    chlorineActivePercentOverride: percentSchema.nullable().optional(),
    phMinusKind: phMinusKindSchema,
    phMinusConcentrationPercentOverride: percentSchema.nullable().optional(),
    phPlusKind: phPlusKindSchema,
    phPlusPurityPercentOverride: percentSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.chlorineProductKind === "CUSTOM" &&
      (data.chlorineActivePercentOverride === undefined ||
        data.chlorineActivePercentOverride === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Available chlorine % is required when the sanitizer preset is Custom.",
        path: ["chlorineActivePercentOverride"],
      });
    }

    if (
      data.phMinusKind === "CUSTOM" &&
      (data.phMinusConcentrationPercentOverride === undefined ||
        data.phMinusConcentrationPercentOverride === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Acid strength % is required when the pH reducer preset is Custom.",
        path: ["phMinusConcentrationPercentOverride"],
      });
    }

    if (
      data.phPlusKind === "CUSTOM" &&
      (data.phPlusPurityPercentOverride === undefined ||
        data.phPlusPurityPercentOverride === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Active strength % is required when the pH increaser preset is Custom.",
        path: ["phPlusPurityPercentOverride"],
      });
    }
  });

export type PoolDosingSettingsPayload = z.infer<
  typeof poolDosingSettingsBodySchema
>;

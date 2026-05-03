-- Pool dosing settings (profile-scoped volume + product presets)

CREATE TYPE "ChlorineProductKind" AS ENUM (
  'SODIUM_HYPOCHLORITE_14',
  'SODIUM_HYPOCHLORITE_125',
  'CALCIUM_HYPOCHLORITE_65',
  'TRICHLOR_90',
  'DICHLOR_56',
  'LITHIUM_HYPOCHLORITE_35',
  'CUSTOM'
);

CREATE TYPE "PhMinusKind" AS ENUM (
  'MURIATIC_31',
  'DRY_ACID_SODIUM_BISULFATE',
  'SULFURIC_38',
  'CUSTOM'
);

CREATE TYPE "PhPlusKind" AS ENUM (
  'SODA_ASH',
  'SODIUM_BICARBONATE',
  'CUSTOM'
);

CREATE TABLE "pool_dosing_settings" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "volumeLiters" DECIMAL(14,2) NOT NULL,
    "chlorineProductKind" "ChlorineProductKind" NOT NULL DEFAULT 'SODIUM_HYPOCHLORITE_125',
    "chlorineActivePercentOverride" DECIMAL(8,4),
    "phMinusKind" "PhMinusKind" NOT NULL DEFAULT 'MURIATIC_31',
    "phMinusConcentrationPercentOverride" DECIMAL(8,4),
    "phPlusKind" "PhPlusKind" NOT NULL DEFAULT 'SODA_ASH',
    "phPlusPurityPercentOverride" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pool_dosing_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pool_dosing_settings_profileId_key" ON "pool_dosing_settings"("profileId");

ALTER TABLE "pool_dosing_settings" ADD CONSTRAINT "pool_dosing_settings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

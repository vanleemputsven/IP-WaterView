-- Per-device pool dosing (was profile-scoped pool_dosing_settings).

CREATE TABLE "device_pool_dosing_settings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "volumeLiters" DECIMAL(14,2) NOT NULL,
    "chlorineProductKind" "ChlorineProductKind" NOT NULL DEFAULT 'SODIUM_HYPOCHLORITE_125',
    "chlorineActivePercentOverride" DECIMAL(8,4),
    "phMinusKind" "PhMinusKind" NOT NULL DEFAULT 'MURIATIC_31',
    "phMinusConcentrationPercentOverride" DECIMAL(8,4),
    "phPlusKind" "PhPlusKind" NOT NULL DEFAULT 'SODA_ASH',
    "phPlusPurityPercentOverride" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_pool_dosing_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "device_pool_dosing_settings_deviceId_key" ON "device_pool_dosing_settings"("deviceId");

ALTER TABLE "device_pool_dosing_settings" ADD CONSTRAINT "device_pool_dosing_settings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "device_pool_dosing_settings" ("id", "deviceId", "volumeLiters", "chlorineProductKind", "chlorineActivePercentOverride", "phMinusKind", "phMinusConcentrationPercentOverride", "phPlusKind", "phPlusPurityPercentOverride", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text,
       d.id,
       pds."volumeLiters",
       pds."chlorineProductKind",
       pds."chlorineActivePercentOverride",
       pds."phMinusKind",
       pds."phMinusConcentrationPercentOverride",
       pds."phPlusKind",
       pds."phPlusPurityPercentOverride",
       pds."createdAt",
       pds."updatedAt"
FROM "devices" d
INNER JOIN "pool_dosing_settings" pds ON pds."profileId" = d."profileId";

DROP TABLE "pool_dosing_settings";

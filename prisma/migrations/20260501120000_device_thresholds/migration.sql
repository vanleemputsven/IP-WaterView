-- Per-device threshold limits (platform `thresholds` remains the template for new devices).

CREATE TABLE "device_thresholds" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "unit" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_thresholds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "device_thresholds_deviceId_key_key" ON "device_thresholds"("deviceId", "key");

CREATE INDEX "device_thresholds_deviceId_idx" ON "device_thresholds"("deviceId");

ALTER TABLE "device_thresholds" ADD CONSTRAINT "device_thresholds_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "device_thresholds" ("id", "deviceId", "key", "value", "unit", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || d.id || t.key),
       d.id,
       t.key,
       t.value,
       t.unit,
       CURRENT_TIMESTAMP
FROM "devices" d
CROSS JOIN "thresholds" t
WHERE NOT EXISTS (
    SELECT 1 FROM "device_thresholds" dt
    WHERE dt."deviceId" = d.id AND dt."key" = t.key
);

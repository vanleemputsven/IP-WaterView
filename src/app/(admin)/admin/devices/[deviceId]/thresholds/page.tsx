import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { AdminThresholdSettings } from "@/components/admin/admin-threshold-settings";
import { ensureDeviceThresholdsForDevice } from "@/lib/services/threshold-service";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  deviceId: z.string().cuid(),
});

export default async function DeviceThresholdsPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const raw = await params;
  const parsed = paramsSchema.safeParse(raw);
  if (!parsed.success) {
    notFound();
  }
  const { deviceId } = parsed.data;

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true, name: true },
  });

  if (!device) {
    notFound();
  }

  await ensureDeviceThresholdsForDevice(deviceId);

  const rows = await prisma.deviceThreshold.findMany({
    where: { deviceId },
    orderBy: { key: "asc" },
  });

  const thresholds = rows.map((t) => ({
    id: t.id,
    thresholdKey: t.key,
    unit: t.unit,
    initialValueStr: t.value.toString(),
    apiCollectionPath: "/api/admin/device-thresholds",
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          <Link
            href="/admin/devices"
            className="font-medium text-accent hover:text-accent-deep"
          >
            Devices
          </Link>
          <span aria-hidden className="mx-1.5 text-muted">
            /
          </span>
          <span className="text-fg-secondary">{device.name}</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">Sensor limits</h1>
        <p className="mt-1 text-sm text-muted">
          Thresholds for this device only. They do not affect other sensors.
          New devices inherit defaults from{" "}
          <Link
            href="/admin/settings"
            className="font-medium text-accent hover:text-accent-deep"
          >
            Settings
          </Link>
          .
        </p>
      </div>

      {thresholds.length > 0 ? (
        <AdminThresholdSettings thresholds={thresholds} />
      ) : (
        <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-muted">
          No platform defaults found — add thresholds via seed, then reload.
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { DeviceSetupWizard } from "@/components/admin/device-setup-wizard";

export const dynamic = "force-dynamic";

export default async function DeviceSetupPage() {
  const thresholds = await prisma.threshold.findMany({
    orderBy: { key: "asc" },
  });

  const template = thresholds.map((t) => ({
    key: t.key,
    unit: t.unit,
    valueStr: t.value.toString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/devices"
          className="text-sm font-medium text-accent hover:text-accent-deep"
        >
          ← Devices
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-fg">Extended setup</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Step through device details and per-sensor limits before registration — ideal when you
          already know your pool targets.
        </p>
      </div>

      <DeviceSetupWizard template={template} />
    </div>
  );
}

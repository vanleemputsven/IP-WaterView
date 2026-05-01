import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { AdminThresholdSettings } from "@/components/admin/admin-threshold-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const thresholds = await prisma.threshold.findMany({
    orderBy: { key: "asc" },
  });

  const serialized = thresholds.map((t) => ({
    id: t.id,
    thresholdKey: t.key,
    unit: t.unit,
    initialValueStr: t.value.toString(),
    apiCollectionPath: "/api/admin/thresholds",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Default metric limits copied to each{" "}
          <Link
            href="/admin/devices"
            className="font-medium text-accent hover:text-accent-deep"
          >
            newly registered device
          </Link>
          . Change limits per sensor under Devices → Limits.
        </p>
      </div>

      {serialized.length > 0 ? (
        <AdminThresholdSettings thresholds={serialized} />
      ) : (
        <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-muted">
          No thresholds configured. Run the seed script to add defaults.
        </div>
      )}
    </div>
  );
}

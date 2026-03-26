import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [deviceCount, measurementCount, logCount] = await Promise.all([
    prisma.device.count(),
    prisma.measurement.count(),
    prisma.systemLog.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">
          System status and quick stats
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <p className="text-sm font-medium text-muted">Devices</p>
          <p className="mt-1 text-2xl font-bold text-fg">{deviceCount}</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <p className="text-sm font-medium text-muted">Measurements</p>
          <p className="mt-1 text-2xl font-bold text-fg">
            {measurementCount}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <p className="text-sm font-medium text-muted">System logs</p>
          <p className="mt-1 text-2xl font-bold text-fg">{logCount}</p>
        </div>
      </div>
    </div>
  );
}

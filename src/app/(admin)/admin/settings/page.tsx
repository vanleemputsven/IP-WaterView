import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const thresholds = await prisma.threshold.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Thresholds and alerts configuration
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {thresholds.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border-subtle bg-surface p-6"
          >
            <p className="text-sm font-medium text-muted">{t.key}</p>
            <p className="mt-1 text-xl font-bold text-fg">
              {t.value.toString()} {t.unit ?? ""}
            </p>
          </div>
        ))}
      </div>
      {thresholds.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-muted">
          No thresholds configured. Run the seed script to add defaults.
        </div>
      )}
    </div>
  );
}

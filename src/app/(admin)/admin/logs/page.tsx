import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">System logs</h1>
        <p className="mt-1 text-sm text-muted">
          Audit and system event log
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Resource
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {log.createdAt.toISOString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {log.actorType}
                  {log.actorId ? `:${log.actorId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 text-sm text-fg-secondary">{log.action}</td>
                <td className="px-4 py-3 text-sm text-muted">{log.resource ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No logs yet.
          </div>
        )}
      </div>
    </div>
  );
}

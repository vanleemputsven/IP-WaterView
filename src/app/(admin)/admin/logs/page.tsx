import { prisma } from "@/lib/db/prisma";
import { AdminLogsFilterForm } from "@/components/admin/admin-logs-filter-form";
import { formatDateTimeForDisplay } from "@/lib/format/datetime";
import {
  buildSystemLogWhere,
  listDistinctSystemLogActions,
  listDistinctSystemLogResources,
} from "@/lib/repositories/system-log-repository";
import {
  fetchActorNameMapsForLogs,
  formatSystemLogActor,
} from "@/lib/services/system-log-display";
import { resolveAdminLogsFilters } from "@/lib/validation/admin-logs";

export const dynamic = "force-dynamic";

type AdminLogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLogsPage({ searchParams }: AdminLogsPageProps) {
  const raw = await searchParams;

  const [resources, actions] = await Promise.all([
    listDistinctSystemLogResources(),
    listDistinctSystemLogActions(),
  ]);

  const resourceSet = new Set(resources);
  const actionSet = new Set(actions);

  const filters = resolveAdminLogsFilters(raw, resourceSet, actionSet);

  const where = buildSystemLogWhere({
    actorType: filters.actor,
    resource: filters.resource,
    action: filters.action,
  });

  const logs = await prisma.systemLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actorNameMaps = await fetchActorNameMapsForLogs(logs);

  const emptyMessage =
    filters.actor !== undefined ||
    filters.resource !== undefined ||
    filters.action !== undefined
      ? "No logs match these filters."
      : "No logs yet.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">System logs</h1>
        <p className="mt-1 text-sm text-muted">
          Audit and system event log
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <AdminLogsFilterForm
          resources={resources}
          actions={actions}
          filters={filters}
        />
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
            {logs.map((log) => {
              const actor = formatSystemLogActor(log, actorNameMaps);
              return (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                    {formatDateTimeForDisplay(log.createdAt)}
                  </td>
                  <td
                    className="max-w-[14rem] truncate whitespace-nowrap px-4 py-3 text-sm text-fg-secondary"
                    title={actor.title}
                  >
                    {actor.text}
                  </td>
                  <td className="px-4 py-3 text-sm text-fg-secondary">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-muted">{log.resource ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";

export type AdminLogsFilterValues = {
  actor?: "user" | "device" | "system";
  resource?: string;
  action?: string;
};

type AdminLogsFilterFormProps = {
  resources: readonly string[];
  actions: readonly string[];
  filters: AdminLogsFilterValues;
};

const ACTOR_LABELS: Record<"user" | "device" | "system", string> = {
  user: "User",
  device: "Device",
  system: "System",
};

/** Compact inline selects; avoids full-width `.wv-input` for toolbar-style filters */
const filterSelectClass =
  "min-h-8 min-w-0 max-w-[11rem] shrink-0 rounded-md border border-border-subtle bg-surface px-2 py-1 text-sm text-fg-secondary shadow-none sm:max-w-[13rem]";

export function AdminLogsFilterForm({
  resources,
  actions,
  filters,
}: AdminLogsFilterFormProps) {
  const hasFilters = !!(filters.actor || filters.resource || filters.action);

  return (
    <div className="border-b border-border-subtle bg-surface-alt/25">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Filter logs</legend>
        <form
          method="GET"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <label
              htmlFor="logs-filter-actor"
              className="shrink-0 text-xs text-muted"
            >
              Actor
            </label>
            <select
              id="logs-filter-actor"
              name="actor"
              defaultValue={filters.actor ?? ""}
              className={filterSelectClass}
            >
              <option value="">Any</option>
              <option value="user">{ACTOR_LABELS.user}</option>
              <option value="device">{ACTOR_LABELS.device}</option>
              <option value="system">{ACTOR_LABELS.system}</option>
            </select>
          </div>

          <span className="hidden h-3 w-px bg-border-subtle sm:block" aria-hidden />

          <div className="flex min-w-0 items-center gap-2">
            <label
              htmlFor="logs-filter-resource"
              className="shrink-0 text-xs text-muted"
            >
              Resource
            </label>
            <select
              id="logs-filter-resource"
              name="resource"
              defaultValue={filters.resource ?? ""}
              className={filterSelectClass}
            >
              <option value="">Any</option>
              {resources.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden h-3 w-px bg-border-subtle sm:block" aria-hidden />

          <div className="flex min-w-0 flex-1 items-center gap-2 basis-[14rem] sm:basis-auto">
            <label
              htmlFor="logs-filter-action"
              className="shrink-0 text-xs text-muted"
            >
              Action
            </label>
            <select
              id="logs-filter-action"
              name="action"
              defaultValue={filters.action ?? ""}
              className={`${filterSelectClass} max-w-none flex-1 sm:max-w-md`}
            >
              <option value="">Any</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full shrink-0 items-center gap-3 sm:ml-auto sm:w-auto">
            <button type="submit" className="wv-btn-primary px-3 py-1.5 text-xs">
              Apply
            </button>
            {hasFilters ? (
              <Link
                href="/admin/logs"
                className="text-xs text-muted underline-offset-2 transition-colors hover:text-fg-secondary hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>
      </fieldset>
    </div>
  );
}

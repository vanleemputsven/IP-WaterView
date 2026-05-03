import Link from "next/link";

type DeviceOption = {
  id: string;
  name: string;
};

type DashboardDeviceFilterFormProps = {
  devices: readonly DeviceOption[];
  selectedDeviceId?: string;
  /** GET form target — defaults to `/dashboard`. */
  actionPath?: string;
  /** Accessible legend for the filter fieldset. */
  legendLabel?: string;
};

const filterSelectClass =
  "min-h-8 min-w-0 max-w-[14rem] shrink-0 rounded-md border border-border-subtle bg-surface px-2 py-1 text-sm text-fg-secondary shadow-none sm:max-w-[16rem]";

/**
 * GET form — same query key (`device`) and labels as `/dashboard/measurements` so bookmarks and deep links line up.
 */
export function DashboardDeviceFilterForm({
  devices,
  selectedDeviceId,
  actionPath = "/dashboard",
  legendLabel = "Filter dashboard by device",
}: DashboardDeviceFilterFormProps) {
  if (devices.length === 0) {
    return null;
  }

  const hasSelection = !!selectedDeviceId;

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-alt/25">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">{legendLabel}</legend>
        <form
          method="GET"
          action={actionPath}
          className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <label
              htmlFor="dashboard-filter-device"
              className="shrink-0 text-xs text-muted"
            >
              Device
            </label>
            <select
              id="dashboard-filter-device"
              name="device"
              defaultValue={selectedDeviceId ?? ""}
              className={filterSelectClass}
            >
              <option value="">Any</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full shrink-0 items-center gap-3 sm:ml-auto sm:w-auto">
            <button type="submit" className="wv-btn-primary px-3 py-1.5 text-xs">
              Apply
            </button>
            {hasSelection ? (
              <Link
                href={actionPath}
                className="text-xs text-muted underline-offset-2 transition-colors hover:text-fg-secondary hover:underline"
              >
                Clear filter
              </Link>
            ) : null}
          </div>
        </form>
      </fieldset>
    </div>
  );
}

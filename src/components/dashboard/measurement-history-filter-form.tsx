import Link from "next/link";
import {
  DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE,
  MEASUREMENT_HISTORY_PAGE_SIZE_OPTIONS,
  type MeasurementHistoryPageSize,
} from "@/lib/validation/measurement-history";

export type MeasurementHistoryFilterValues = {
  deviceId?: string;
  metric?: "temperature" | "ph" | "chlorine";
  pageSize: MeasurementHistoryPageSize;
};

type DeviceOption = {
  id: string;
  name: string;
};

type MeasurementHistoryFilterFormProps = {
  devices: readonly DeviceOption[];
  filters: MeasurementHistoryFilterValues;
};

const METRIC_LABELS: Record<"temperature" | "ph" | "chlorine", string> = {
  temperature: "Temperature",
  ph: "pH",
  chlorine: "Chlorine",
};

const filterSelectClass =
  "min-h-8 min-w-0 max-w-[11rem] shrink-0 rounded-md border border-border-subtle bg-surface px-2 py-1 text-sm text-fg-secondary shadow-none sm:max-w-[13rem]";

export function MeasurementHistoryFilterForm({
  devices,
  filters,
}: MeasurementHistoryFilterFormProps) {
  const hasFilters = !!(filters.deviceId || filters.metric);
  const hasNonDefaultPageSize =
    filters.pageSize !== DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE;

  return (
    <div className="border-b border-border-subtle bg-surface-alt/25">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Filter measurements</legend>
        <form
          method="GET"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <label
              htmlFor="history-filter-device"
              className="shrink-0 text-xs text-muted"
            >
              Device
            </label>
            <select
              id="history-filter-device"
              name="device"
              defaultValue={filters.deviceId ?? ""}
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

          <span className="hidden h-3 w-px bg-border-subtle sm:block" aria-hidden />

          <div className="flex min-w-0 flex-1 items-center gap-2 basis-[14rem] sm:basis-auto">
            <label
              htmlFor="history-filter-metric"
              className="shrink-0 text-xs text-muted"
            >
              Metric
            </label>
            <select
              id="history-filter-metric"
              name="metric"
              defaultValue={filters.metric ?? ""}
              className={`${filterSelectClass} max-w-none flex-1 sm:max-w-md`}
            >
              <option value="">Any</option>
              <option value="temperature">{METRIC_LABELS.temperature}</option>
              <option value="ph">{METRIC_LABELS.ph}</option>
              <option value="chlorine">{METRIC_LABELS.chlorine}</option>
            </select>
          </div>

          <span className="hidden h-3 w-px bg-border-subtle sm:block" aria-hidden />

          <div className="flex min-w-0 items-center gap-2">
            <label
              htmlFor="history-filter-page-size"
              className="shrink-0 text-xs text-muted"
            >
              Rows
            </label>
            <select
              id="history-filter-page-size"
              name="pageSize"
              defaultValue={String(filters.pageSize)}
              className={filterSelectClass}
            >
              {MEASUREMENT_HISTORY_PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={String(n)}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full shrink-0 items-center gap-3 sm:ml-auto sm:w-auto">
            <button type="submit" className="wv-btn-primary px-3 py-1.5 text-xs">
              Apply
            </button>
            {hasFilters || hasNonDefaultPageSize ? (
              <Link
                href="/dashboard/measurements"
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

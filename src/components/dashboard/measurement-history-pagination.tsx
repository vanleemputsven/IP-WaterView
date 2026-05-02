import Link from "next/link";
import {
  buildMeasurementHistoryHref,
  type MeasurementHistoryPageSize,
} from "@/lib/validation/measurement-history";

type MeasurementHistoryPaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: MeasurementHistoryPageSize;
  deviceId?: string;
  metric?: "temperature" | "ph" | "chlorine";
};

export function MeasurementHistoryPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  deviceId,
  metric,
}: MeasurementHistoryPaginationProps) {
  const base = { deviceId, metric, pageSize } as const;
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const linkClass =
    "rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg";
  const disabledClass =
    "pointer-events-none rounded-md border border-border-subtle/80 bg-surface-alt/40 px-2.5 py-1.5 text-xs text-muted opacity-60";

  return (
    <div className="flex flex-col gap-3 border-t border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-xs text-muted">
        {totalCount === 0
          ? "No results"
          : `Showing ${from.toLocaleString("nl-NL")}–${to.toLocaleString("nl-NL")} of ${totalCount.toLocaleString("nl-NL")}`}
      </p>
      <nav className="flex flex-wrap items-center gap-2" aria-label="Table pages">
        {page <= 1 ? (
          <span className={disabledClass}>Previous</span>
        ) : (
          <Link
            href={buildMeasurementHistoryHref({ ...base, page: prevPage })}
            className={linkClass}
          >
            Previous
          </Link>
        )}
        <span className="px-1 text-xs tabular-nums text-fg-secondary">
          Page {page} of {totalPages}
        </span>
        {page >= totalPages ? (
          <span className={disabledClass}>Next</span>
        ) : (
          <Link
            href={buildMeasurementHistoryHref({ ...base, page: nextPage })}
            className={linkClass}
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}

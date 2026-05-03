import {
  AdminPageHeaderSkeleton,
  AdminPageLoadingShell,
  AdminSkeletonBlock,
} from "@/components/admin/admin-page-skeleton";

/** Three strips matching `PoolStatusCards` metric tiles (label, value, target). */
function PoolMetricTilesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-border-subtle border-l-2 border-l-accent-bright bg-surface px-2 py-1.5 sm:px-2.5 sm:py-2"
        >
          <AdminSkeletonBlock className="h-2.5 w-24" />
          <div className="mt-2 flex items-baseline gap-1.5">
            <AdminSkeletonBlock className="h-7 w-14 sm:h-8 sm:w-16" />
            <AdminSkeletonBlock className="h-4 w-8" />
          </div>
          <div className="mt-2.5 border-t border-border-subtle/90 pt-2">
            <AdminSkeletonBlock className="h-2 w-12" />
            <AdminSkeletonBlock className="mt-1 h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors compact `MeasurementChart`: tinted control strip, stat row, chart frame. */
function MeasurementChartCompactSkeleton() {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-accent-bright/25 bg-gradient-to-br from-accent/[0.07] via-surface to-surface p-2 sm:p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <AdminSkeletonBlock className="h-2 w-10" />
          <AdminSkeletonBlock className="h-7 w-56 max-w-full rounded-lg" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-accent-bright/15 pt-2">
          <AdminSkeletonBlock className="h-2 w-9 sm:w-8" />
          <AdminSkeletonBlock className="h-7 w-48 max-w-full rounded-lg" />
        </div>
        <AdminSkeletonBlock className="mt-2 h-3 w-full max-w-xl border-t border-accent-bright/15 pt-2" />
      </div>
      <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5"
          >
            <AdminSkeletonBlock className="h-2.5 w-8" />
            <AdminSkeletonBlock className="mt-1 h-4 w-14" />
          </div>
        ))}
      </dl>
      <div className="rounded-md bg-surface p-1 ring-1 ring-accent-bright/25">
        <AdminSkeletonBlock className="h-[248px] w-full min-h-[200px] rounded-sm" />
      </div>
      <AdminSkeletonBlock className="h-3 w-40" />
    </div>
  );
}

/** Expanded chart card (taller plot, optional brush strip). */
function MeasurementChartExpandedSkeleton() {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-accent-bright/25 bg-gradient-to-br from-accent/[0.07] via-surface to-surface p-2 sm:p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <AdminSkeletonBlock className="h-2 w-10" />
          <AdminSkeletonBlock className="h-7 w-64 max-w-full rounded-lg" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-accent-bright/15 pt-2">
          <AdminSkeletonBlock className="h-2 w-9 sm:w-8" />
          <AdminSkeletonBlock className="h-7 w-52 max-w-full rounded-lg" />
        </div>
        <AdminSkeletonBlock className="mt-2 h-3 w-full max-w-2xl border-t border-accent-bright/15 pt-2" />
      </div>
      <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5"
          >
            <AdminSkeletonBlock className="h-2.5 w-8" />
            <AdminSkeletonBlock className="mt-1 h-4 w-16" />
          </div>
        ))}
      </dl>
      <div className="rounded-md bg-surface p-1 ring-1 ring-accent-bright/25">
        <AdminSkeletonBlock className="h-[352px] w-full min-h-[240px] rounded-sm" />
      </div>
      <AdminSkeletonBlock className="h-3 w-48" />
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <AdminPageLoadingShell className="space-y-6">
      <AdminPageHeaderSkeleton
        titleWidthClass="w-36"
        subtitleWidthClass="w-full max-w-xl"
      />

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <AdminSkeletonBlock className="h-4 w-28" />
        <AdminSkeletonBlock className="mt-1.5 h-4 w-full max-w-lg" />
        <div className="mt-3">
          <PoolMetricTilesSkeleton />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <AdminSkeletonBlock className="h-4 w-32" />
        <AdminSkeletonBlock className="mt-1.5 h-4 w-full max-w-md" />
        <div className="mt-3">
          <MeasurementChartCompactSkeleton />
        </div>
      </div>
    </AdminPageLoadingShell>
  );
}

const historyListGridCols =
  "minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.65fr) minmax(0, 0.5fr) minmax(0, 0.75fr)";

export function DashboardHistorySkeleton() {
  return (
    <AdminPageLoadingShell className="space-y-6">
      <AdminPageHeaderSkeleton
        titleWidthClass="w-56"
        subtitleWidthClass="w-full max-w-md"
      />

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <AdminSkeletonBlock className="h-4 w-20" />
        <AdminSkeletonBlock className="mt-1.5 h-4 w-full max-w-xl" />
        <div className="mt-3">
          <MeasurementChartExpandedSkeleton />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <div className="border-b border-border-subtle bg-surface-alt/25 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <AdminSkeletonBlock className="h-8 w-[9rem]" />
            <AdminSkeletonBlock className="h-8 min-w-[12rem] flex-1 sm:max-w-sm" />
            <AdminSkeletonBlock className="h-8 w-16 sm:ml-auto" />
          </div>
        </div>
        <div className="border-b border-border-subtle px-4 py-3">
          <div className="grid gap-3" style={{ gridTemplateColumns: historyListGridCols }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <AdminSkeletonBlock key={i} className="h-3 w-14" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-subtle px-4 py-3">
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, ri) => (
              <div
                key={ri}
                className="grid gap-3"
                style={{ gridTemplateColumns: historyListGridCols }}
              >
                {Array.from({ length: 5 }).map((__, ci) => (
                  <AdminSkeletonBlock key={ci} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageLoadingShell>
  );
}

export function AdminSkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-alt/80 ${className}`}
      aria-hidden
    />
  );
}

export function AdminPageLoadingShell({
  children,
  className = "space-y-8",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      {children}
    </div>
  );
}

/** Mimics admin pages that use a bordered table card (header strip + body rows). */
export function AdminTableCardSkeleton({
  columnCount,
  rowCount,
}: {
  columnCount: number;
  rowCount: number;
}) {
  const gridCols = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle px-4 py-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: gridCols }}>
          {Array.from({ length: columnCount }).map((_, i) => (
            <AdminSkeletonBlock key={i} className="h-3 w-14" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border-subtle px-4 py-3">
        <div className="space-y-3">
          {Array.from({ length: rowCount }).map((_, ri) => (
            <div
              key={ri}
              className="grid gap-3"
              style={{ gridTemplateColumns: gridCols }}
            >
              {Array.from({ length: columnCount }).map((__, ci) => (
                <AdminSkeletonBlock key={ci} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeaderSkeleton({
  titleWidthClass = "w-48",
  subtitleWidthClass = "w-96 max-w-full",
}: {
  titleWidthClass?: string;
  subtitleWidthClass?: string;
}) {
  return (
    <div>
      <AdminSkeletonBlock className={`h-8 ${titleWidthClass}`} />
      <AdminSkeletonBlock className={`mt-2 h-4 ${subtitleWidthClass}`} />
    </div>
  );
}

const thresholdGridCols = "repeat(3, minmax(0, 1fr))";

/** Matches `AdminThresholdSettings`: hint strip + threshold/value/status table. */
export function AdminThresholdSettingsCardSkeleton({
  rows = 6,
}: {
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="border-b border-border-subtle bg-surface-alt/30 px-4 py-2">
        <AdminSkeletonBlock className="h-3 w-72 max-w-full" />
      </div>
      <div className="overflow-x-auto">
        <div className="border-b border-border-subtle px-4 py-2.5">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: thresholdGridCols }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <AdminSkeletonBlock key={i} className="h-3 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border-subtle px-4 py-3">
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, ri) => (
              <div
                key={ri}
                className="grid gap-3"
                style={{ gridTemplateColumns: thresholdGridCols }}
              >
                {Array.from({ length: 3 }).map((__, ci) => (
                  <AdminSkeletonBlock key={ci} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

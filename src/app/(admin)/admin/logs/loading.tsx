import {
  AdminPageHeaderSkeleton,
  AdminPageLoadingShell,
  AdminSkeletonBlock,
} from "@/components/admin/admin-page-skeleton";

const logGridCols = "repeat(4, minmax(0, 1fr))";

export default function Loading() {
  return (
    <AdminPageLoadingShell>
      <div className="space-y-8">
        <AdminPageHeaderSkeleton
          titleWidthClass="w-40"
          subtitleWidthClass="w-72 max-w-full"
        />

        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle bg-surface-alt/25 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <AdminSkeletonBlock className="h-8 w-[9rem]" />
              <AdminSkeletonBlock className="h-8 w-[10rem]" />
              <AdminSkeletonBlock className="h-8 min-w-[12rem] flex-1 sm:max-w-sm" />
              <AdminSkeletonBlock className="h-8 w-16 sm:ml-auto" />
            </div>
          </div>
          <div className="border-b border-border-subtle px-4 py-3">
            <div className="grid gap-3" style={{ gridTemplateColumns: logGridCols }}>
              {Array.from({ length: 4 }).map((_, i) => (
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
                  style={{ gridTemplateColumns: logGridCols }}
                >
                  {Array.from({ length: 4 }).map((__, ci) => (
                    <AdminSkeletonBlock key={ci} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminPageLoadingShell>
  );
}

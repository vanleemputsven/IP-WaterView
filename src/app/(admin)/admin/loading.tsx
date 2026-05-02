import {
  AdminPageLoadingShell,
  AdminSkeletonBlock,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell>
      <div>
        <AdminSkeletonBlock className="h-8 w-56" />
        <AdminSkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <AdminSkeletonBlock className="h-4 w-20" />
              <AdminSkeletonBlock className="h-4 w-4 rounded-sm" />
            </div>
            <AdminSkeletonBlock className="mt-3 h-8 w-16" />
            <AdminSkeletonBlock className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between gap-4">
            <AdminSkeletonBlock className="h-6 w-40" />
            <AdminSkeletonBlock className="h-4 w-20" />
          </div>
          <div className="mt-3 rounded-xl border border-border-subtle bg-surface p-4">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-3">
                  <AdminSkeletonBlock className="h-4 w-full" />
                  <AdminSkeletonBlock className="h-4 w-full" />
                  <AdminSkeletonBlock className="h-4 w-full" />
                  <AdminSkeletonBlock className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div>
            <AdminSkeletonBlock className="h-6 w-32" />
            <div className="mt-3 space-y-3 rounded-xl border border-border-subtle bg-surface p-5">
              <AdminSkeletonBlock className="h-4 w-28" />
              <AdminSkeletonBlock className="h-4 w-44" />
              <div className="space-y-2 border-t border-border-subtle pt-3">
                <AdminSkeletonBlock className="h-4 w-full" />
                <AdminSkeletonBlock className="h-4 w-5/6" />
                <AdminSkeletonBlock className="h-4 w-4/6" />
              </div>
            </div>
          </div>

          <div>
            <AdminSkeletonBlock className="h-6 w-24" />
            <ul className="mt-3 space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-border-subtle bg-surface p-4 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <AdminSkeletonBlock className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <AdminSkeletonBlock className="h-4 w-32" />
                      <AdminSkeletonBlock className="h-4 w-full" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminPageLoadingShell>
  );
}

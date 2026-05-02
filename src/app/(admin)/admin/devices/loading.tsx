import {
  AdminPageHeaderSkeleton,
  AdminPageLoadingShell,
  AdminSkeletonBlock,
  AdminTableCardSkeleton,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell>
      <AdminPageHeaderSkeleton
        titleWidthClass="w-32"
        subtitleWidthClass="w-[26rem] max-w-full"
      />

      <div className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
        <AdminSkeletonBlock className="h-4 w-28" />
        <AdminSkeletonBlock className="mt-2 h-4 w-full max-w-md" />
        <div className="mt-4 grid gap-5 lg:grid-cols-2 lg:gap-x-10 lg:items-start">
          <div className="min-w-0 space-y-3">
            <AdminSkeletonBlock className="h-10 w-full max-w-md" />
            <AdminSkeletonBlock className="h-4 w-52" />
            <div className="flex flex-wrap justify-end gap-3">
              <AdminSkeletonBlock className="h-10 w-36" />
              <AdminSkeletonBlock className="h-10 w-32" />
            </div>
          </div>
          <AdminSkeletonBlock className="hidden min-h-[7rem] w-full lg:block" />
        </div>
      </div>

      <AdminTableCardSkeleton columnCount={6} rowCount={5} />
    </AdminPageLoadingShell>
  );
}

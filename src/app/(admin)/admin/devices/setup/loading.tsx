import {
  AdminPageLoadingShell,
  AdminSkeletonBlock,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell>
      <AdminSkeletonBlock className="h-4 w-24" />
      <AdminSkeletonBlock className="mt-3 h-8 w-56 max-w-full" />
      <AdminSkeletonBlock className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-8 rounded-xl border border-border-subtle bg-surface p-5">
        <div className="flex flex-wrap gap-2 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminSkeletonBlock key={i} className="h-8 w-36 rounded-full" />
          ))}
        </div>
        <AdminSkeletonBlock className="mt-4 h-10 w-full max-w-md" />
        <AdminSkeletonBlock className="mt-3 h-4 w-48" />
      </div>
    </AdminPageLoadingShell>
  );
}

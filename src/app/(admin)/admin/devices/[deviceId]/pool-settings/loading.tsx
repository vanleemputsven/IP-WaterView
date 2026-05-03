import {
  AdminPageLoadingShell,
  AdminSkeletonBlock,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell className="space-y-6">
      <div>
        <AdminSkeletonBlock className="h-4 w-48" />
        <AdminSkeletonBlock className="mt-2 h-8 w-64" />
        <AdminSkeletonBlock className="mt-2 h-4 w-full max-w-2xl" />
        <AdminSkeletonBlock className="mt-2 h-3 w-56" />
      </div>
      <AdminSkeletonBlock className="h-64 w-full rounded-2xl" />
    </AdminPageLoadingShell>
  );
}

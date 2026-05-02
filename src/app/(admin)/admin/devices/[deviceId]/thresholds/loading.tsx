import {
  AdminPageLoadingShell,
  AdminSkeletonBlock,
  AdminThresholdSettingsCardSkeleton,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell className="space-y-6">
      <div>
        <AdminSkeletonBlock className="h-4 w-48" />
        <AdminSkeletonBlock className="mt-2 h-8 w-56" />
        <AdminSkeletonBlock className="mt-2 h-4 w-full max-w-2xl" />
      </div>
      <AdminThresholdSettingsCardSkeleton rows={6} />
    </AdminPageLoadingShell>
  );
}

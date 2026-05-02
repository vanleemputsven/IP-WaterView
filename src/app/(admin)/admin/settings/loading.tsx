import {
  AdminPageHeaderSkeleton,
  AdminPageLoadingShell,
  AdminThresholdSettingsCardSkeleton,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell className="space-y-6">
      <AdminPageHeaderSkeleton
        titleWidthClass="w-36"
        subtitleWidthClass="w-full max-w-xl"
      />
      <AdminThresholdSettingsCardSkeleton rows={6} />
    </AdminPageLoadingShell>
  );
}

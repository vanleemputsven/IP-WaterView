import {
  AdminPageHeaderSkeleton,
  AdminPageLoadingShell,
  AdminTableCardSkeleton,
} from "@/components/admin/admin-page-skeleton";

export default function Loading() {
  return (
    <AdminPageLoadingShell>
      <AdminPageHeaderSkeleton
        titleWidthClass="w-24"
        subtitleWidthClass="w-full max-w-2xl"
      />
      <AdminTableCardSkeleton columnCount={4} rowCount={6} />
    </AdminPageLoadingShell>
  );
}

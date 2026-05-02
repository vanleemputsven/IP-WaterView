import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import Link from "next/link";
import { AquaSenseBrandLockup } from "@/components/brand/aqua-sense-brand-lockup";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { AdminSectionNav } from "@/components/layout/admin-section-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-10">
        <header className="border-b border-border-subtle bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="/admin"
              className="flex items-center"
              aria-label="AquaSense admin — previously known as Waterview"
            >
              <AquaSenseBrandLockup decorative />
            </Link>
            <DashboardNav isAdmin />
          </div>
        </header>
        <div className="border-b border-accent-deep bg-accent">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
            <AdminSectionNav />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

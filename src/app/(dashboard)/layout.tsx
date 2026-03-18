import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/services/profile-service";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { canAccessAdmin } from "@/lib/auth/rbac";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfile({
    userId: user.id,
    email: user.email ?? "",
  });

  const isAdmin = canAccessAdmin(profile.role);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              Waterview
            </span>
          </Link>
          <DashboardNav isAdmin={isAdmin} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

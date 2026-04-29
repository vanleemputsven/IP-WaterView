import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import Link from "next/link";
import { AquaSenseBrandLockup } from "@/components/brand/aqua-sense-brand-lockup";
import { Droplets, FileText, Settings, Cpu } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/dashboard");
  }

  const navClass = (path: string) => {
    return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-fg`;
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="flex flex-wrap items-center gap-x-2 gap-y-2"
            aria-label="AquaSense admin — previously known as Waterview"
          >
            <AquaSenseBrandLockup decorative />
            <span className="hidden text-sm font-medium text-muted sm:inline">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" className={navClass("/dashboard")}>
              <Droplets className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/logs" className={navClass("/admin/logs")}>
              <FileText className="h-4 w-4" />
              Logs
            </Link>
            <Link href="/admin/devices" className={navClass("/admin/devices")}>
              <Cpu className="h-4 w-4" />
              Devices
            </Link>
            <Link href="/admin/settings" className={navClass("/admin/settings")}>
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  Droplets,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavProps {
  isAdmin: boolean;
}

export function DashboardNav({ isAdmin }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navClass = (path: string, opts?: { exact?: boolean }) => {
    const base =
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
    const active = opts?.exact
      ? pathname === path
      : pathname.startsWith(path);
    const state = active
      ? "bg-surface-alt text-fg font-medium"
      : "text-muted hover:bg-surface-alt hover:text-fg";
    return `${base} ${state}`;
  };

  const inAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex max-w-full flex-col items-end gap-2">
      <nav
        className="flex max-w-full flex-wrap items-center justify-end gap-2"
        aria-label="Main"
      >
        <Link href="/dashboard" className={navClass("/dashboard")}>
          <Droplets className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/history"
          className={navClass("/dashboard/history")}
        >
          <History className="h-4 w-4 shrink-0" />
          History
        </Link>
        {isAdmin && (
          <Link href="/admin" className={navClass("/admin")}>
            <Shield className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-fg"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </nav>

      {isAdmin && inAdmin && (
        <nav
          className="flex max-w-full flex-wrap items-center justify-end gap-2 border-t border-border-subtle pt-2"
          aria-label="Admin sections"
        >
          <Link href="/admin" className={navClass("/admin", { exact: true })}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Overview
          </Link>
          <Link href="/admin/logs" className={navClass("/admin/logs")}>
            <FileText className="h-4 w-4 shrink-0" />
            Logs
          </Link>
          <Link href="/admin/devices" className={navClass("/admin/devices")}>
            <Cpu className="h-4 w-4 shrink-0" />
            Devices
          </Link>
          <Link href="/admin/settings" className={navClass("/admin/settings")}>
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        </nav>
      )}
    </div>
  );
}

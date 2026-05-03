"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Droplets,
  FlaskConical,
  LineChart,
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

  return (
    <div className="flex max-w-full flex-col items-end gap-2">
      <nav
        className="flex max-w-full flex-wrap items-center justify-end gap-2"
        aria-label="Main"
      >
        <Link href="/dashboard" className={navClass("/dashboard", { exact: true })}>
          <Droplets className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/measurements"
          className={navClass("/dashboard/measurements")}
        >
          <LineChart className="h-4 w-4 shrink-0" />
          Measurements
        </Link>
        <Link href="/dashboard/dosing" className={navClass("/dashboard/dosing")}>
          <FlaskConical className="h-4 w-4 shrink-0" />
          Dosing
        </Link>
        <Link
          href="/dashboard/settings"
          className={navClass("/dashboard/settings")}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
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
    </div>
  );
}

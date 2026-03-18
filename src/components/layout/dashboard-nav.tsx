"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, History, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  const navClass = (path: string) => {
    const base =
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
    const active = pathname.startsWith(path)
      ? "bg-surface-alt text-slate-900 font-medium"
      : "text-muted hover:bg-surface-alt hover:text-slate-900";
    return `${base} ${active}`;
  };

  return (
    <nav className="flex items-center gap-2">
      <Link href="/dashboard" className={navClass("/dashboard")}>
        <Droplets className="h-4 w-4" />
        Dashboard
      </Link>
      <Link href="/dashboard/history" className={navClass("/dashboard/history")}>
        <History className="h-4 w-4" />
        History
      </Link>
      {isAdmin && (
        <Link href="/admin" className={navClass("/admin")}>
          <Shield className="h-4 w-4" />
          Admin
        </Link>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-alt hover:text-slate-900"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  );
}

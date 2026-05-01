"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Cpu, FileText, LayoutDashboard, Settings } from "lucide-react";

type Section = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const SECTIONS: Section[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/logs", label: "Logs", icon: FileText },
  { href: "/admin/devices", label: "Devices", icon: Cpu },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="w-full min-w-0">
      <ul className="grid grid-cols-2 gap-0.5 rounded-lg bg-accent-deep/35 p-0.5 ring-1 ring-white/20 sm:grid-cols-4">
        {SECTIONS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className={
                  active
                    ? "flex w-full items-center justify-center gap-1.5 rounded-md bg-surface px-2 py-1.5 text-xs font-medium text-accent shadow-sm ring-1 ring-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-on-accent focus-visible:ring-offset-2 focus-visible:ring-offset-accent sm:justify-start sm:px-2.5 sm:text-sm"
                    : "flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-on-accent/90 transition-colors hover:bg-white/15 hover:text-on-accent focus-visible:ring-2 focus-visible:ring-on-accent focus-visible:ring-offset-2 focus-visible:ring-offset-accent sm:justify-start sm:px-2.5 sm:text-sm"
                }
              >
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${active ? "text-accent opacity-95" : "text-on-accent opacity-90"}`}
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

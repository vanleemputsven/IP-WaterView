import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <SiteFooter variant="minimal" />
    </div>
  );
}

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 py-12">
      {/* my-auto: center when content fits; when taller than viewport, margins collapse so content scrolls naturally */}
      <div className="my-auto flex w-full flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}

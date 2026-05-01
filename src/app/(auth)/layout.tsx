import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-12">
      {/* my-auto: center when content fits; when taller than viewport, margins collapse so content scrolls naturally */}
      <div className="my-auto w-full max-w-sm">{children}</div>
    </div>
  );
}

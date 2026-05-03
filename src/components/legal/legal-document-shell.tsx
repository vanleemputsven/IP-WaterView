import type { ReactNode } from "react";
import Link from "next/link";

const backLinkClass =
  "inline-flex rounded-sm text-sm font-medium text-muted underline decoration-transparent underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-border-subtle focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/**
 * Shared layout for standalone legal routes: full canvas page like the rest of the app — no modal/card chrome.
 */
export function LegalDocumentShell({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className={backLinkClass}>
          ← Home
        </Link>

        <header className="mt-8 border-b border-border-subtle pb-8">
          <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        </header>

        <div className="mt-8 max-w-xl">
          {children ?? (
            <p className="text-sm leading-relaxed text-muted">Out of scope for now.</p>
          )}
        </div>
      </div>
    </div>
  );
}

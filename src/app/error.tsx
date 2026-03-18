"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-alt"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

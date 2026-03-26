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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="wv-panel max-w-md text-center">
        <h2 className="text-lg font-semibold text-fg">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button type="button" onClick={reset} className="wv-btn-primary">
            Try again
          </button>
          <Link href="/" className="wv-btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

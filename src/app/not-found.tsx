import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-semibold text-slate-900">404</h2>
      <p className="mt-2 text-muted">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
      >
        Go home
      </Link>
    </div>
  );
}

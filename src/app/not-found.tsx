import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="wv-panel max-w-md text-center">
        <h2 className="text-2xl font-semibold text-fg">404</h2>
        <p className="mt-2 text-muted">Page not found</p>
        <Link href="/" className="mt-6 wv-btn-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}

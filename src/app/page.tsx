import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Waterview
        </h1>
        <p className="mt-2 text-muted">
          IoT-based pool water monitoring platform
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-deep"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-alt"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

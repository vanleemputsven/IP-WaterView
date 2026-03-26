import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AquaSenseLogo } from "@/components/brand/aqua-sense-logo";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="wv-panel max-w-md text-center">
        <div className="flex justify-center">
          <AquaSenseLogo className="h-12 w-auto sm:h-14" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Pool monitoring
        </h1>
        <p className="mt-2 text-muted">
          IoT-based pool water monitoring — clear readings, calm interface.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/login" className="wv-btn-primary">
            Sign in
          </Link>
          <Link href="/signup" className="wv-btn-secondary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

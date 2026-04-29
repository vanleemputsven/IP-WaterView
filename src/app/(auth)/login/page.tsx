import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import {
  AquaSenseBrandLockup,
  BRAND_LOCKUP_AUTH_LOGO_CLASS,
} from "@/components/brand/aqua-sense-brand-lockup";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="wv-panel max-w-sm space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <AquaSenseBrandLockup
              layout="stacked"
              logoClassName={BRAND_LOCKUP_AUTH_LOGO_CLASS}
            />
          </div>
          <h1 className="text-2xl font-bold text-fg">Sign in</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

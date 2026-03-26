import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";
import { AquaSenseLogo } from "@/components/brand/aqua-sense-logo";

export default async function SignupPage() {
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
            <AquaSenseLogo className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-fg">Sign up</h1>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

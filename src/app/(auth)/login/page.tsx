import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import {
  AquaSenseBrandLockup,
  BRAND_LOCKUP_AUTH_LOGO_CLASS,
} from "@/components/brand/aqua-sense-brand-lockup";

const loginSearchParamsSchema = z.object({
  error: z.string().optional(),
  email: z.string().optional(),
});

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const q = loginSearchParamsSchema.safeParse({
    error: typeof raw.error === "string" ? raw.error : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
  });
  const queryError = q.success ? q.data.error : undefined;
  const rawEmail = q.success ? q.data.email : undefined;
  const prefillEmail =
    rawEmail !== undefined ? z.string().trim().email().safeParse(rawEmail) : null;
  const loginEmailHint = prefillEmail?.success ? prefillEmail.data : null;

  return (
    <div className="wv-panel space-y-6">
      <div className="space-y-4">
        <div className="flex justify-center">
          <AquaSenseBrandLockup
            layout="stacked"
            logoClassName={BRAND_LOCKUP_AUTH_LOGO_CLASS}
          />
        </div>
        <h1 className="text-2xl font-bold text-fg">Sign in</h1>
      </div>
      <LoginForm queryError={queryError ?? null} initialEmail={loginEmailHint} />
    </div>
  );
}

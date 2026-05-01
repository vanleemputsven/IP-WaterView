"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

const KNOWN_LOGIN_ERRORS: Record<string, string> = {
  auth_callback_error:
    "We could not finish signing you in. Please try again, or use email and password.",
  signup_email_in_use:
    "Er bestaat al een account met dit e-mailadres. Log hieronder in.",
};

type LoginFormProps = {
  /** Known error codes from the query string (e.g. failed OAuth callback) */
  queryError?: string | null;
  /** Prefilled email (e.g. after duplicate sign-up redirect); must be validated server-side before passing */
  initialEmail?: string | null;
};

export function LoginForm({ queryError, initialEmail }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    queryError && KNOWN_LOGIN_ERRORS[queryError] ? KNOWN_LOGIN_ERRORS[queryError] : null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <GoogleOAuthButton nextPath="/dashboard" disabled={loading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wide text-muted">
            Or with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-fg-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="wv-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-fg-secondary">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="wv-input"
          />
        </div>
        <button type="submit" disabled={loading} className="wv-btn-primary-block">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-accent-bright hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { z } from "zod";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

const signupFormSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function isDuplicateSignupAuthError(error: AuthError): boolean {
  const raw = error.message.toLowerCase();
  return (
    raw.includes("already registered") ||
    raw.includes("already been registered") ||
    raw.includes("user already exists") ||
    raw.includes("email address is already registered")
  );
}

/** Duplicate email sign-ups often return a user with no identities (GoTrue privacy behaviour). */
function signupResponseIndicatesExistingEmail(data: {
  user: { identities?: unknown[] } | null;
  session: unknown | null;
}): boolean {
  if (data.session) return false;
  if (!data.user) return true;
  const identities = data.user.identities ?? [];
  return identities.length === 0;
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const parsed = signupFormSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const first = parsed.error.flatten();
      const fieldErr =
        first.fieldErrors.confirmPassword?.[0] ??
        first.fieldErrors.email?.[0] ??
        first.fieldErrors.password?.[0];
      setError(fieldErr ?? first.formErrors[0] ?? "Please check your details and try again.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    setLoading(false);
    if (err) {
      if (isDuplicateSignupAuthError(err)) {
        const qs = new URLSearchParams({
          error: "signup_email_in_use",
          email: parsed.data.email,
        });
        router.replace(`/login?${qs.toString()}`);
        router.refresh();
        return;
      }
      setError(err.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    if (signupResponseIndicatesExistingEmail(data)) {
      const qs = new URLSearchParams({
        error: "signup_email_in_use",
        email: parsed.data.email,
      });
      router.replace(`/login?${qs.toString()}`);
      router.refresh();
      return;
    }

    setInfoMessage(
      "We sent a confirmation link to your email. Open it to finish signing up, then sign in."
    );
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
        {infoMessage && (
          <div
            className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
            role="status"
          >
            {infoMessage}
          </div>
        )}
        {error && (
          <div
            className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-fg-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
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
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="wv-input"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1 text-xs text-muted">
            At least 6 characters.
          </p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-fg-secondary">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="wv-input"
          />
        </div>
        <button type="submit" disabled={loading} className="wv-btn-primary-block">
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent-bright hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

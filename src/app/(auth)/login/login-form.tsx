"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
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
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateDeviceForm() {
  const [name, setName] = useState("Pool Monitor #1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    apiKey: string;
    deviceId: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/admin/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, seedMeasurements: true }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create device");
      return;
    }

    setResult(data);
    router.refresh();
  }

  if (result) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <p className="font-medium text-success">Device created</p>
        <p className="mt-2 text-sm text-muted">
          Save this API key — it will not be shown again.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-code-bg px-4 py-3 font-mono text-sm text-inverse-fg">
          {result.apiKey}
        </pre>
        <p className="mt-2 text-xs text-muted">
          Use: X-Device-Token: {result.apiKey.slice(0, 20)}...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fg-secondary">
          Device name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="wv-input max-w-xs"
        />
      </div>
      <button type="submit" disabled={loading} className="wv-btn-primary">
        {loading ? "Creating…" : "Create device (with demo data)"}
      </button>
    </form>
  );
}

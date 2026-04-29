"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoadingMode = "idle" | "plain" | "demo";

export function CreateDeviceForm() {
  const [name, setName] = useState("Pool Monitor #1");
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("idle");
  const [result, setResult] = useState<{
    apiKey: string;
    deviceId: string;
    name: string;
    withDemoData: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function createDevice(seedMeasurements: boolean) {
    setLoadingMode(seedMeasurements ? "demo" : "plain");
    setError(null);
    setResult(null);

    const res = await fetch("/api/admin/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, seedMeasurements }),
    });

    const data = await res.json().catch(() => ({}));
    setLoadingMode("idle");

    if (!res.ok) {
      setError(data.error ?? "Failed to create device");
      return;
    }

    setResult({
      apiKey: data.apiKey,
      deviceId: data.id,
      name: data.name,
      withDemoData: seedMeasurements,
    });
    router.refresh();
  }

  if (result) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <p className="font-medium text-success">Device created</p>
        <p className="mt-2 text-sm text-muted">
          Save this API key. It will not be shown again.
        </p>
        {result.withDemoData ? (
          <p className="mt-2 text-sm text-fg-secondary">
            Demo measurements (about one week of sample data) were added so you can explore charts
            immediately. Production devices usually use{" "}
            <span className="font-medium text-fg">Create device</span> without demo data.
          </p>
        ) : (
          <p className="mt-2 text-sm text-fg-secondary">
            No sample measurements were added — your dashboards will fill once the device sends real
            data.
          </p>
        )}
        <pre className="mt-3 overflow-x-auto rounded-lg bg-code-bg px-4 py-3 font-mono text-sm text-inverse-fg">
          {result.apiKey}
        </pre>
        <p className="mt-2 text-xs text-muted">
          Use: X-Device-Token: {result.apiKey.slice(0, 20)}...
        </p>
      </div>
    );
  }

  const loading = loadingMode !== "idle";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
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
          disabled={loading}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={loading || !name.trim()}
          onClick={() => void createDevice(false)}
          className="wv-btn-primary"
        >
          {loadingMode === "plain" ? "Creating…" : "Create device"}
        </button>
        <button
          type="button"
          disabled={loading || !name.trim()}
          onClick={() => void createDevice(true)}
          className="wv-btn-secondary"
        >
          {loadingMode === "demo" ? "Creating…" : "Create device with demo data"}
        </button>
      </div>
    </div>
  );
}

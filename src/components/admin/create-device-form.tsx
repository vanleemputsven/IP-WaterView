"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeviceCreatedApiKeyPanel } from "@/components/admin/device-created-api-key-panel";
import { fetchAdminDeviceNameAvailable } from "@/lib/client/admin-device-name-available";

export function CreateDeviceForm() {
  const [name, setName] = useState("Pool Monitor #1");
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    apiKey: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const nameFree = await fetchAdminDeviceNameAvailable(trimmed);
    if (!nameFree.ok) {
      setError(nameFree.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmed,
        seedMeasurements: includeDemoData,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create device");
      return;
    }

    setResult({
      apiKey: data.apiKey,
      name: data.name,
    });
    router.refresh();
  }

  if (result) {
    return (
      <div className="lg:col-span-2">
        <DeviceCreatedApiKeyPanel deviceName={result.name} apiKey={result.apiKey} />
      </div>
    );
  }

  return (
    <>
      <form className="min-w-0 space-y-3" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
        ) : null}

        <div className="min-w-0">
          <label
            htmlFor="device-create-name"
            className="block text-sm font-medium text-fg-secondary"
          >
            Device name
          </label>
          <input
            id="device-create-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="wv-input max-w-none"
            autoComplete="off"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <input
            id="device-create-demo-data"
            type="checkbox"
            checked={includeDemoData}
            onChange={(e) => setIncludeDemoData(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 shrink-0 rounded border-border-subtle text-accent focus:ring-accent-bright"
          />
          <label
            htmlFor="device-create-demo-data"
            className="cursor-pointer text-sm font-medium text-fg"
          >
            Include demo chart data
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-0.5">
          <Link href="/admin/devices/setup" className="wv-btn-secondary">
            Extended setup
          </Link>
          <button type="submit" disabled={loading || !name.trim()} className="wv-btn-primary">
            {loading ? "Creating…" : "Create device"}
          </button>
        </div>
      </form>

      <aside className="border-t border-border-subtle pt-4 text-sm leading-relaxed text-muted lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8">
        <p className="font-medium text-fg-secondary">After registering</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4 marker:text-muted">
          <li>
            Devices authenticate with header{" "}
            <code className="rounded bg-surface-alt px-1 py-0.5 font-mono text-xs text-fg-secondary">
              X-Device-Token
            </code>
            .
          </li>
          <li>
            Rename, rotate keys, and per-sensor limits stay available in the table below.
          </li>
        </ul>
      </aside>
    </>
  );
}

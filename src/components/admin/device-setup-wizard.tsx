"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatThresholdLabel,
  formatThresholdUnitSuffix,
} from "@/lib/format/threshold-label";
import {
  thresholdValueSchemaForKey,
  validateThresholdKeyValueSet,
} from "@/lib/validation/threshold";
import { fetchAdminDeviceNameAvailable } from "@/lib/client/admin-device-name-available";
import { DeviceCreatedApiKeyPanel } from "@/components/admin/device-created-api-key-panel";

export type SetupTemplateRow = {
  key: string;
  unit: string | null;
  valueStr: string;
};

function parseDraft(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (
    t === "" ||
    t === "-" ||
    t === "." ||
    t === "-." ||
    /^-?\d+\.$/.test(t)
  ) {
    return null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function validateDraftThresholds(
  template: SetupTemplateRow[],
  drafts: Record<string, string>,
): { ok: true; rows: { key: string; value: number }[] } | { ok: false; message: string } {
  const rows: { key: string; value: number }[] = [];
  for (const t of template) {
    const parsed = parseDraft(drafts[t.key] ?? "");
    if (parsed === null) {
      return {
        ok: false,
        message: `Enter a valid number for ${formatThresholdLabel(t.key)}.`,
      };
    }
    const pv = thresholdValueSchemaForKey(t.key).safeParse(parsed);
    if (!pv.success) {
      return {
        ok: false,
        message:
          pv.error.issues[0]?.message ??
          `Invalid value for ${formatThresholdLabel(t.key)}.`,
      };
    }
    rows.push({ key: t.key, value: pv.data });
  }
  const pairs = validateThresholdKeyValueSet(rows);
  if (!pairs.ok) {
    return { ok: false, message: pairs.message };
  }
  return { ok: true, rows };
}

type Phase = "basics" | "limits" | "done";

type Props = {
  template: SetupTemplateRow[];
};

export function DeviceSetupWizard({ template }: Props) {
  const router = useRouter();
  const hasLimitsStep = template.length > 0;

  const stepLabels = useMemo(
    () =>
      hasLimitsStep
        ? ["Device", "Sensor limits", "API key"]
        : ["Device", "API key"],
    [hasLimitsStep],
  );

  const [phase, setPhase] = useState<Phase>("basics");
  const [deviceName, setDeviceName] = useState("Pool Monitor #1");
  const [includeDemoData, setIncludeDemoData] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.map((t) => [t.key, t.valueStr.trim()])),
  );

  const [createdName, setCreatedName] = useState("");
  const [createdDeviceId, setCreatedDeviceId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStepIndex =
    phase === "basics" ? 0 : phase === "limits" ? 1 : stepLabels.length - 1;

  async function submitCreate(initialThresholds?: { key: string; value: number }[]) {
    const trimmed = deviceName.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    const nameFree = await fetchAdminDeviceNameAvailable(trimmed);
    if (!nameFree.ok) {
      setError(nameFree.message);
      setLoading(false);
      return;
    }

    const body: Record<string, unknown> = {
      name: trimmed,
      seedMeasurements: includeDemoData,
    };
    if (initialThresholds && initialThresholds.length > 0) {
      body.initialThresholds = initialThresholds;
    }

    const res = await fetch("/api/admin/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      apiKey?: string;
      name?: string;
      id?: string;
    };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create device");
      return;
    }

    if (!data.apiKey) {
      setError("Invalid response from server");
      return;
    }

    setCreatedName(data.name ?? trimmed);
    setCreatedDeviceId(typeof data.id === "string" ? data.id : null);
    setApiKey(data.apiKey);
    setPhase("done");
    router.refresh();
  }

  async function handleBasicsNext() {
    const trimmed = deviceName.trim();
    if (!trimmed) {
      setError("Enter a device name.");
      return;
    }
    setError(null);
    if (hasLimitsStep) {
      setLoading(true);
      const check = await fetchAdminDeviceNameAvailable(trimmed);
      setLoading(false);
      if (!check.ok) {
        setError(check.message);
        return;
      }
      setPhase("limits");
      return;
    }
    void submitCreate();
  }

  function handleLimitsCreate() {
    const check = validateDraftThresholds(template, drafts);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setError(null);
    void submitCreate(check.rows);
  }

  if (phase === "done" && apiKey) {
    return (
      <DeviceCreatedApiKeyPanel deviceName={createdName} apiKey={apiKey}>
        <Link href="/admin/devices" className="wv-btn-primary">
          Back to devices
        </Link>
        {createdDeviceId ? (
          <Link
            href={`/admin/devices/${encodeURIComponent(createdDeviceId)}/thresholds`}
            className="wv-btn-secondary"
          >
            Sensor limits
          </Link>
        ) : null}
      </DeviceCreatedApiKeyPanel>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
      <nav aria-label="Setup steps" className="flex flex-wrap gap-2 border-b border-border-subtle pb-4">
        {stepLabels.map((label, i) => {
          const active = i === activeStepIndex;
          const past = i < activeStepIndex;
          return (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? "bg-accent text-on-accent"
                  : past
                    ? "bg-surface-alt text-fg-secondary"
                    : "text-muted"
              }`}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-6">
        {error ? (
          <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {phase === "basics" ? (
          <div className="space-y-4">
            <div className="min-w-0">
              <label
                htmlFor="wizard-device-name"
                className="block text-sm font-medium text-fg-secondary"
              >
                Device name
              </label>
              <input
                id="wizard-device-name"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="wv-input max-w-md"
                autoComplete="off"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <input
                id="wizard-demo-data"
                type="checkbox"
                checked={includeDemoData}
                onChange={(e) => setIncludeDemoData(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 shrink-0 rounded border-border-subtle text-accent focus:ring-accent-bright"
              />
              <label
                htmlFor="wizard-demo-data"
                className="cursor-pointer text-sm font-medium text-fg"
              >
                Include demo chart data
              </label>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                disabled={loading || !deviceName.trim()}
                onClick={() => void handleBasicsNext()}
                className="wv-btn-primary"
              >
                {loading
                  ? hasLimitsStep
                    ? "Checking…"
                    : "Creating…"
                  : hasLimitsStep
                    ? "Continue"
                    : "Create device"}
              </button>
              <Link href="/admin/devices" className="wv-btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        ) : null}

        {phase === "limits" && hasLimitsStep ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Adjust limits for this sensor before registration. Values match your{" "}
              <Link
                href="/admin/settings"
                className="font-medium text-accent hover:text-accent-deep"
              >
                Settings
              </Link>{" "}
              template unless you change them here.
            </p>

            <div className="overflow-hidden rounded-xl border border-border-subtle">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-subtle">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                        Threshold
                      </th>
                      <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {template.map((t) => {
                      const unitSuffix = formatThresholdUnitSuffix(t.unit);
                      const inputId = `wizard-th-${t.key}`;
                      return (
                        <tr key={t.key}>
                          <td className="px-4 py-2 align-middle">
                            <label
                              htmlFor={inputId}
                              className="text-sm font-medium text-fg-secondary"
                            >
                              {formatThresholdLabel(t.key)}
                            </label>
                          </td>
                          <td className="px-4 py-2 align-middle">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                id={inputId}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                value={drafts[t.key] ?? ""}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [t.key]: e.target.value,
                                  }))
                                }
                                disabled={loading}
                                className="block h-9 w-[7.25rem] rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm text-fg tabular-nums transition-colors placeholder:text-muted/60 disabled:opacity-60"
                              />
                              {unitSuffix ? (
                                <span className="text-xs text-muted tabular-nums">{unitSuffix}</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setError(null);
                  setPhase("basics");
                }}
                className="wv-btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleLimitsCreate()}
                className="wv-btn-primary"
              >
                {loading ? "Creating…" : "Create device"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

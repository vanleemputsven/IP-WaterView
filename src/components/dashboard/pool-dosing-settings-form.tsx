"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ChlorineProductKind,
  PhMinusKind,
  PhPlusKind,
} from "@prisma/client";
import type { PoolDosingSettingsDTO } from "@/lib/services/device-pool-dosing-settings-service";
import {
  chlorineProductKindSchema,
  phMinusKindSchema,
  phPlusKindSchema,
  poolDosingSettingsBodySchema,
  type PoolDosingSettingsPayload,
} from "@/lib/validation/pool-dosing-settings";

type Props = {
  deviceId: string;
  initial: PoolDosingSettingsDTO | null;
  /** Absolute API path for PATCH (e.g. `/api/admin/devices/<device id>/pool-dosing`). */
  patchHref: string;
};

const CHLORINE_LABELS: Record<ChlorineProductKind, string> = {
  SODIUM_HYPOCHLORITE_14: "Liquid hypochlorite ~14%",
  SODIUM_HYPOCHLORITE_125: "Liquid hypochlorite ~12.5%",
  CALCIUM_HYPOCHLORITE_65: "Calcium hypochlorite ~65%",
  TRICHLOR_90: "Trichlor ~90%",
  DICHLOR_56: "Dichlor ~56%",
  LITHIUM_HYPOCHLORITE_35: "Lithium hypochlorite ~35%",
  CUSTOM: "Custom (label %)",
};

const PH_MINUS_LABELS: Record<PhMinusKind, string> = {
  MURIATIC_31: "Muriatic acid ~31%",
  DRY_ACID_SODIUM_BISULFATE: "Dry acid",
  SULFURIC_38: "Sulfuric acid ~38%",
  CUSTOM: "Custom acid (label %)",
};

const PH_PLUS_LABELS: Record<PhPlusKind, string> = {
  SODA_ASH: "Soda ash",
  SODIUM_BICARBONATE: "Bicarbonate",
  CUSTOM: "Custom base (label %)",
};

function payloadFromDto(dto: PoolDosingSettingsDTO): PoolDosingSettingsPayload {
  return {
    volumeLiters: dto.volumeLiters,
    chlorineProductKind: dto.chlorineProductKind,
    chlorineActivePercentOverride: dto.chlorineActivePercentOverride,
    phMinusKind: dto.phMinusKind,
    phMinusConcentrationPercentOverride:
      dto.phMinusConcentrationPercentOverride,
    phPlusKind: dto.phPlusKind,
    phPlusPurityPercentOverride: dto.phPlusPurityPercentOverride,
  };
}

export function PoolDosingSettingsForm({ deviceId, initial, patchHref }: Props) {
  const router = useRouter();
  const defaults = useMemo<PoolDosingSettingsPayload>(
    () =>
      initial
        ? payloadFromDto(initial)
        : {
            volumeLiters: 45_000,
            chlorineProductKind: "SODIUM_HYPOCHLORITE_125",
            chlorineActivePercentOverride: null,
            phMinusKind: "MURIATIC_31",
            phMinusConcentrationPercentOverride: null,
            phPlusKind: "SODA_ASH",
            phPlusPurityPercentOverride: null,
          },
    [initial],
  );

  const [volumeInput, setVolumeInput] = useState(
    initial ? String(initial.volumeLiters) : "",
  );
  const [chlorineKind, setChlorineKind] = useState(defaults.chlorineProductKind);
  const [chlorinePct, setChlorinePct] = useState(
    defaults.chlorineActivePercentOverride !== null
      ? String(defaults.chlorineActivePercentOverride)
      : "",
  );
  const [phMinusKindState, setPhMinusKindState] =
    useState<PhMinusKind>(defaults.phMinusKind);
  const [phMinusPct, setPhMinusPct] = useState(
    defaults.phMinusConcentrationPercentOverride !== null
      ? String(defaults.phMinusConcentrationPercentOverride)
      : "",
  );
  const [phPlusKindState, setPhPlusKindState] =
    useState<PhPlusKind>(defaults.phPlusKind);
  const [phPlusPct, setPhPlusPct] = useState(
    defaults.phPlusPurityPercentOverride !== null
      ? String(defaults.phPlusPurityPercentOverride)
      : "",
  );

  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "saved" }
  >({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });

    const volumeParsed = Number(volumeInput.trim());
    const chlorineOverrideParsed =
      chlorinePct.trim() === "" ? null : Number(chlorinePct.trim());
    const phMinusParsed =
      phMinusPct.trim() === "" ? null : Number(phMinusPct.trim());
    const phPlusParsed =
      phPlusPct.trim() === "" ? null : Number(phPlusPct.trim());

    const body = {
      volumeLiters: volumeParsed,
      chlorineProductKind: chlorineKind,
      chlorineActivePercentOverride:
        chlorineKind === "CUSTOM" ? chlorineOverrideParsed : null,
      phMinusKind: phMinusKindState,
      phMinusConcentrationPercentOverride:
        phMinusKindState === "CUSTOM" ? phMinusParsed : null,
      phPlusKind: phPlusKindState,
      phPlusPurityPercentOverride:
        phPlusKindState === "CUSTOM" ? phPlusParsed : null,
    };

    const validated = poolDosingSettingsBodySchema.safeParse(body);
    if (!validated.success) {
      const msg =
        validated.error.issues[0]?.message ?? "Check the highlighted fields.";
      setStatus({ kind: "error", message: msg });
      return;
    }

    const res = await fetch(patchHref, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validated.data),
    });

    if (!res.ok) {
      let message = "Could not save settings.";
      try {
        const j = (await res.json()) as { error?: string };
        if (j.error) message = j.error;
      } catch {
        /* ignore */
      }
      setStatus({ kind: "error", message });
      return;
    }

    setStatus({ kind: "saved" });
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-fg-secondary shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const labelClass = "block text-xs font-medium text-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
        aria-hidden
      />

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <label htmlFor="pool-volume" className={labelClass}>
            Pool volume (liters)
          </label>
          <input
            id="pool-volume"
            name="volumeLiters"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            value={volumeInput}
            onChange={(ev) => setVolumeInput(ev.target.value)}
            className={inputClass}
            placeholder="e.g. 48000"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div>
            <label htmlFor="chlorine-kind" className={labelClass}>
              Sanitizer
            </label>
            <select
              id="chlorine-kind"
              value={chlorineKind}
              onChange={(ev) => {
                const v = chlorineProductKindSchema.safeParse(ev.target.value);
                if (v.success) setChlorineKind(v.data);
              }}
              className={inputClass}
            >
              {(Object.keys(CHLORINE_LABELS) as ChlorineProductKind[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {CHLORINE_LABELS[k]}
                  </option>
                ),
              )}
            </select>
            {chlorineKind === "CUSTOM" ? (
              <div className="mt-3">
                <label htmlFor="chlorine-pct" className={labelClass}>
                  Available Cl (%)
                </label>
                <input
                  id="chlorine-pct"
                  type="text"
                  inputMode="decimal"
                  value={chlorinePct}
                  onChange={(ev) => setChlorinePct(ev.target.value)}
                  className={inputClass}
                  placeholder="%"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="ph-minus-kind" className={labelClass}>
              pH − (acid)
            </label>
            <select
              id="ph-minus-kind"
              value={phMinusKindState}
              onChange={(ev) => {
                const v = phMinusKindSchema.safeParse(ev.target.value);
                if (v.success) setPhMinusKindState(v.data);
              }}
              className={inputClass}
            >
              {(Object.keys(PH_MINUS_LABELS) as PhMinusKind[]).map((k) => (
                <option key={k} value={k}>
                  {PH_MINUS_LABELS[k]}
                </option>
              ))}
            </select>
            {phMinusKindState === "CUSTOM" ? (
              <div className="mt-3">
                <label htmlFor="ph-minus-pct" className={labelClass}>
                  Acid strength (%)
                </label>
                <input
                  id="ph-minus-pct"
                  type="text"
                  inputMode="decimal"
                  value={phMinusPct}
                  onChange={(ev) => setPhMinusPct(ev.target.value)}
                  className={inputClass}
                  placeholder="%"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="ph-plus-kind" className={labelClass}>
              pH + (base)
            </label>
            <select
              id="ph-plus-kind"
              value={phPlusKindState}
              onChange={(ev) => {
                const v = phPlusKindSchema.safeParse(ev.target.value);
                if (v.success) setPhPlusKindState(v.data);
              }}
              className={inputClass}
            >
              {(Object.keys(PH_PLUS_LABELS) as PhPlusKind[]).map((k) => (
                <option key={k} value={k}>
                  {PH_PLUS_LABELS[k]}
                </option>
              ))}
            </select>
            {phPlusKindState === "CUSTOM" ? (
              <div className="mt-3">
                <label htmlFor="ph-plus-pct" className={labelClass}>
                  Active (%)
                </label>
                <input
                  id="ph-plus-pct"
                  type="text"
                  inputMode="decimal"
                  value={phPlusPct}
                  onChange={(ev) => setPhPlusPct(ev.target.value)}
                  className={inputClass}
                  placeholder="%"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={status.kind === "saving"}
            className="wv-btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            {status.kind === "saving" ? "Saving…" : "Save settings"}
          </button>
          {status.kind === "error" ? (
            <p className="text-sm text-danger" role="alert">
              {status.message}
            </p>
          ) : null}
          {status.kind === "saved" ? (
            <p className="text-sm text-accent" role="status">
              Saved.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

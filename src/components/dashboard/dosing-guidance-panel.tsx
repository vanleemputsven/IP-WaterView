import Link from "next/link";
import { FlaskConical, SlidersHorizontal } from "lucide-react";
import { AutoFixDoseButton } from "@/components/dashboard/auto-fix-dose-button";
import type { ClientMeasurement } from "@/lib/mappers/measurement-client";
import type { PoolThresholdBounds } from "@/lib/pool/threshold-bounds";
import {
  computeChlorineDoseHint,
  computePhDoseHint,
  type PoolDosingProductConfig,
} from "@/lib/pool/dosing-calculator";
import type { PoolDosingSettingsDTO } from "@/lib/services/device-pool-dosing-settings-service";
import {
  deviceToolbarGroupClass,
  deviceToolbarLinkClass,
} from "@/lib/dashboard/device-toolbar-styles";

function formatPh(n: number | null): string {
  if (n === null) return "—";
  return n.toFixed(2);
}

function formatCl(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(2)} ppm`;
}

function formatTemp(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)} °C`;
}

function formatMassG(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 100) return `${Math.round(n)} g`;
  if (n >= 10) return `${n.toFixed(1)} g`;
  return `${n.toFixed(2)} g`;
}

function formatVolMl(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 100) return `${Math.round(n)} ml`;
  return `${n.toFixed(1)} ml`;
}

function DosingDeviceConfigureBar({
  deviceId,
  deviceName,
  isAdmin,
}: {
  deviceId: string;
  deviceName: string;
  isAdmin: boolean;
}) {
  const settingsHref = `/admin/devices/${encodeURIComponent(deviceId)}/pool-settings`;
  const limitsHref = `/admin/devices/${encodeURIComponent(deviceId)}/thresholds`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isAdmin ? (
        <div
          role="group"
          aria-label={`Configure ${deviceName}`}
          className={deviceToolbarGroupClass}
        >
          <Link
            href={limitsHref}
            className={deviceToolbarLinkClass}
            title="Sensor limits"
            aria-label={`Sensor limits for ${deviceName}`}
          >
            <SlidersHorizontal
              className="h-3.5 w-3.5 shrink-0 opacity-90 xl:h-4 xl:w-4"
              aria-hidden
            />
            <span className="xl:hidden" aria-hidden>
              Limits
            </span>
          </Link>
          <Link
            href={settingsHref}
            className={deviceToolbarLinkClass}
            title="Pool volume & products"
            aria-label={`Pool products and volume for ${deviceName}`}
          >
            <FlaskConical
              className="h-3.5 w-3.5 shrink-0 opacity-90 xl:h-4 xl:w-4"
              aria-hidden
            />
            <span className="xl:hidden" aria-hidden>
              Products
            </span>
          </Link>
        </div>
      ) : null}
      <AutoFixDoseButton deviceId={deviceId} deviceName={deviceName} />
    </div>
  );
}

type DosingGuidancePanelProps = {
  deviceId: string;
  deviceName: string;
  latest: ClientMeasurement | null;
  bounds: PoolThresholdBounds;
  dosingSettings: PoolDosingSettingsDTO | null;
  isAdmin: boolean;
};

export function DosingGuidancePanel({
  deviceId,
  deviceName,
  latest,
  bounds,
  dosingSettings,
  isAdmin,
}: DosingGuidancePanelProps) {
  const anchor = `device-${deviceId}`;

  if (dosingSettings === null) {
    return (
      <section
        id={anchor}
        className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5"
        aria-label={`Dosing for ${deviceName}`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="truncate text-lg font-semibold tracking-tight text-fg">
            {deviceName}
          </h2>
          <div className="flex shrink-0 justify-start sm:justify-end">
            <DosingDeviceConfigureBar
              deviceId={deviceId}
              deviceName={deviceName}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-xl border border-border-subtle bg-surface-alt/20 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Measured
            </p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">pH</dt>
                <dd className="tabular-nums font-medium text-fg">
                  {formatPh(latest?.ph ?? null)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Chlorine</dt>
                <dd className="tabular-nums font-medium text-fg">
                  {formatCl(latest?.chlorinePpm ?? null)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Temp</dt>
                <dd className="tabular-nums text-fg-secondary">
                  {formatTemp(latest?.temperatureCelsius ?? null)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-alt/20 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Suggested dose
            </p>
            <p className="mt-2 text-sm text-muted">
              {isAdmin ? (
                <>
                  Use Products for volume &amp; chemistry; Limits tune sensor bands.
                  AutoFix will apply the suggested dose automatically when connected.
                </>
              ) : (
                <>
                  An administrator configures volume, chemistry, and sensor bands.
                  AutoFix will apply the suggested dose automatically when connected.
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const cfg: PoolDosingProductConfig = {
    volumeLiters: dosingSettings.volumeLiters,
    chlorineProductKind: dosingSettings.chlorineProductKind,
    chlorineActivePercentOverride: dosingSettings.chlorineActivePercentOverride,
    phMinusKind: dosingSettings.phMinusKind,
    phMinusConcentrationPercentOverride:
      dosingSettings.phMinusConcentrationPercentOverride,
    phPlusKind: dosingSettings.phPlusKind,
    phPlusPurityPercentOverride: dosingSettings.phPlusPurityPercentOverride,
  };

  const chlorineHint = computeChlorineDoseHint({
    cfg,
    measuredPpm: latest?.chlorinePpm ?? null,
    bounds: bounds.chlorine,
  });

  const phHint = computePhDoseHint({
    cfg,
    measuredPh: latest?.ph ?? null,
    bounds: bounds.ph,
  });

  let chlorineLine: string;
  if (chlorineHint.kind === "raise") {
    const amt =
      chlorineHint.displayUnit === "ml"
        ? formatVolMl(chlorineHint.productMl ?? 0)
        : formatMassG(chlorineHint.productGrams);
    chlorineLine = `${amt} · +~${chlorineHint.deltaPpm.toFixed(1)} ppm`;
  } else if (chlorineHint.reason === "in_range") {
    chlorineLine = "In range";
  } else if (chlorineHint.reason === "above_range") {
    chlorineLine = "High";
  } else {
    chlorineLine = "No reading";
  }

  let phLine: string;
  if (phHint.kind === "raise_ph") {
    const amt =
      phHint.displayUnit === "ml"
        ? formatVolMl(phHint.productMl ?? 0)
        : formatMassG(phHint.productGrams ?? 0);
    phLine = `${amt} · pH +~${phHint.deltaPh.toFixed(2)}`;
  } else if (phHint.kind === "lower_ph") {
    const amt =
      phHint.displayUnit === "ml"
        ? formatVolMl(phHint.productMl ?? 0)
        : formatMassG(phHint.productGrams ?? 0);
    phLine = `${amt} · pH −~${phHint.deltaPh.toFixed(2)}`;
  } else if (phHint.reason === "in_range") {
    phLine = "In range";
  } else if (
    phHint.reason === "needs_raise_but_uncertain" ||
    phHint.reason === "needs_lower_but_uncertain"
  ) {
    phLine = "Check settings";
  } else {
    phLine = "No reading";
  }

  return (
    <section
      id={anchor}
      className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5"
      aria-label={`Dosing for ${deviceName}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/35 to-transparent"
        aria-hidden
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="truncate text-lg font-semibold tracking-tight text-fg">
          {deviceName}
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
          <p className="text-xs tabular-nums text-muted sm:text-right">
            {dosingSettings.volumeLiters.toLocaleString("en-US")} L
          </p>
          <DosingDeviceConfigureBar
            deviceId={deviceId}
            deviceName={deviceName}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-xl border border-border-subtle bg-surface-alt/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Measured
          </p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">pH</dt>
              <dd className="tabular-nums font-medium text-fg">
                {formatPh(latest?.ph ?? null)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Chlorine</dt>
              <dd className="tabular-nums font-medium text-fg">
                {formatCl(latest?.chlorinePpm ?? null)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Temp</dt>
              <dd className="tabular-nums text-fg-secondary">
                {formatTemp(latest?.temperatureCelsius ?? null)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-alt/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Suggested dose
          </p>
          <dl className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Chlorine</dt>
              <dd className="text-right font-medium tabular-nums text-fg">{chlorineLine}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">pH</dt>
              <dd className="text-right font-medium tabular-nums text-fg">{phLine}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

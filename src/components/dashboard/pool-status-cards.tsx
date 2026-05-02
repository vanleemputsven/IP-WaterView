"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  FlaskConical,
  HelpCircle,
  Thermometer,
} from "lucide-react";
import type { ClientMeasurement } from "@/lib/mappers/measurement-client";
import {
  classifyAgainstBounds,
  poolThresholdBoundsFromRows,
  type MetricBounds,
  type PoolThresholdBounds,
  type RangeStatus,
} from "@/lib/pool/threshold-bounds";

interface PoolStatusCardsProps {
  measurements: Array<ClientMeasurement>;
  thresholdsByDeviceId?: Record<string, PoolThresholdBounds>;
}

function boundsForDevice(
  deviceId: string,
  map: Record<string, PoolThresholdBounds> | undefined,
): PoolThresholdBounds {
  return map?.[deviceId] ?? poolThresholdBoundsFromRows([]);
}

/** Card ring tint reflects limit status (accent when OK, danger when out of band). */
function statusAccentRing(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "ring-accent-bright/35";
    case "below":
    case "above":
      return "ring-danger/30";
    default:
      return "ring-border-subtle";
  }
}

function statusPhrase(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "Within limits";
    case "below":
      return "Below limits";
    case "above":
      return "Above limits";
    default:
      return "No reading";
  }
}

function formatReadingAge(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr} h ago`;
  const days = Math.floor(hr / 24);
  return `${days} d ago`;
}

function statusBadgeClasses(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "border-success/25 bg-success/10 text-success";
    case "below":
      return "border-warning/30 bg-warning/12 text-warning";
    case "above":
      return "border-danger/25 bg-danger/12 text-danger";
    default:
      return "border-border-subtle bg-surface-alt text-muted";
  }
}

function StatusGlyph({ status }: { status: RangeStatus }) {
  const cls = "h-2.5 w-2.5 shrink-0";
  switch (status) {
    case "in_range":
      return <CheckCircle2 className={`${cls} text-success`} aria-hidden />;
    case "below":
    case "above":
      return <AlertTriangle className={`${cls} text-current`} aria-hidden />;
    default:
      return <HelpCircle className={`${cls} text-muted`} aria-hidden />;
  }
}

function computeGaugePercent(value: number, bounds: MetricBounds): number {
  const { min, max } = bounds;
  const span = max - min;
  const pad = span > 0 ? Math.max(span * 0.45, span * 0.01) : 2;
  const low = min - pad;
  const high = max + pad;
  const denom = high - low;
  if (denom <= 0) return 50;
  const t = ((value - low) / denom) * 100;
  return Math.min(100, Math.max(0, t));
}

function zoneBandPercents(bounds: MetricBounds): { start: number; end: number } {
  const { min, max } = bounds;
  const span = max - min;
  const pad = span > 0 ? Math.max(span * 0.45, span * 0.01) : 2;
  const low = min - pad;
  const high = max + pad;
  const denom = high - low;
  if (denom <= 0) return { start: 35, end: 65 };
  const start = ((min - low) / denom) * 100;
  const end = ((max - low) / denom) * 100;
  return {
    start: Math.min(100, Math.max(0, start)),
    end: Math.min(100, Math.max(0, end)),
  };
}

function RangeGauge({
  value,
  bounds,
  metricStatus,
}: {
  value: number | null;
  bounds: MetricBounds;
  metricStatus: RangeStatus;
}) {
  const { min, max } = bounds;

  if (value === null || metricStatus === "unknown") {
    return (
      <div
        className="mt-2"
        aria-hidden
      >
        <div className="flex justify-between text-[9px] font-medium tabular-nums text-muted">
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-surface-alt ring-1 ring-border-subtle/80">
          <div className="absolute inset-x-3 inset-y-0 rounded-full bg-gradient-to-r from-transparent via-border-subtle/90 to-transparent motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  const pct = computeGaugePercent(value, bounds);
  const band = zoneBandPercents(bounds);
  const markerClass =
    metricStatus === "in_range"
      ? "border-accent-bright bg-surface shadow-[0_1px_3px_rgb(15_23_42/0.1)]"
      : "border-danger bg-surface shadow-[0_1px_3px_rgb(220_38_38/0.18)] motion-safe:animate-pulse motion-reduce:animate-none";

  return (
    <div
      className="mt-2"
      aria-hidden
    >
      <div className="flex justify-between text-[9px] font-medium tabular-nums text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <div className="relative mt-1 h-1.5 rounded-full bg-surface-alt ring-1 ring-border-subtle/80">
        <div
          className="pointer-events-none absolute inset-y-0 rounded-full bg-gradient-to-b from-accent-bright/28 to-accent/18 opacity-90"
          style={{
            left: `${band.start}%`,
            width: `${Math.max(band.end - band.start, 2)}%`,
          }}
        />
        <div
          className={`pointer-events-none absolute top-1/2 z-[1] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${markerClass}`}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricTile({
  title,
  icon,
  valuePrimary,
  valueUnit,
  metricStatus,
  ariaLabel,
  valueNumeric,
  bounds,
}: {
  title: string;
  icon: ReactNode;
  valuePrimary: string;
  valueUnit: string | null;
  metricStatus: RangeStatus;
  ariaLabel: string;
  valueNumeric: number | null;
  bounds: MetricBounds;
}) {
  const hasReading = valueUnit !== null;

  return (
    <article
      className={`relative overflow-hidden rounded-lg border border-border-subtle bg-gradient-to-b from-surface to-surface-alt/30 p-3 shadow-[0_1px_2px_rgb(15_23_42/0.05)] ring-1 ${statusAccentRing(metricStatus)}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/35 to-transparent" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-accent">
              {title}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex max-w-[min(100%,11rem)] shrink-0 items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-semibold leading-tight ${statusBadgeClasses(metricStatus)}`}
        >
          <StatusGlyph status={metricStatus} />
          <span className="truncate">{statusPhrase(metricStatus)}</span>
        </span>
      </div>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-0 tabular-nums leading-none">
        <span className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {valuePrimary}
        </span>
        {hasReading ? (
          <span className="text-xs font-medium text-fg-secondary sm:text-sm">
            {valueUnit}
          </span>
        ) : null}
      </p>

      <RangeGauge
        value={valueNumeric}
        bounds={bounds}
        metricStatus={metricStatus}
      />
    </article>
  );
}

export function PoolStatusCards({
  measurements,
  thresholdsByDeviceId,
}: PoolStatusCardsProps) {
  const latest =
    measurements.length > 0
      ? [...measurements].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0]
      : null;

  if (!latest) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle bg-surface-alt/40 px-4 py-8 text-center">
        <p className="text-sm text-muted">
          No measurements yet. Connect a device to get started.
        </p>
      </div>
    );
  }

  const bounds = boundsForDevice(latest.deviceId, thresholdsByDeviceId);

  const tempStatus = classifyAgainstBounds(
    latest.temperatureCelsius,
    bounds.temperature,
  );
  const phStatus = classifyAgainstBounds(latest.ph, bounds.ph);
  const clStatus = classifyAgainstBounds(latest.chlorinePpm, bounds.chlorine);

  const tempMain =
    latest.temperatureCelsius === null
      ? "—"
      : latest.temperatureCelsius.toFixed(1);
  const phMain = latest.ph === null ? "—" : latest.ph.toFixed(2);
  const clMain =
    latest.chlorinePpm === null ? "—" : latest.chlorinePpm.toFixed(2);

  const tempPrimary = tempMain;
  const tempUnit = latest.temperatureCelsius === null ? null : "°C";
  const phPrimary = phMain;
  const phUnit = latest.ph === null ? null : "pH";
  const clPrimary = clMain;
  const clUnit = latest.chlorinePpm === null ? null : "ppm";

  const age = formatReadingAge(latest.timestamp);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <MetricTile
          title="Temperature"
          icon={<Thermometer className="h-4 w-4 shrink-0" aria-hidden />}
          valuePrimary={tempPrimary}
          valueUnit={tempUnit}
          metricStatus={tempStatus}
          ariaLabel={`Temperature ${tempMain}, ${statusPhrase(tempStatus)}, target ${bounds.temperature.min} to ${bounds.temperature.max} celsius`}
          valueNumeric={latest.temperatureCelsius}
          bounds={bounds.temperature}
        />
        <MetricTile
          title="pH"
          icon={<FlaskConical className="h-4 w-4 shrink-0" aria-hidden />}
          valuePrimary={phPrimary}
          valueUnit={phUnit}
          metricStatus={phStatus}
          ariaLabel={`pH ${phMain}, ${statusPhrase(phStatus)}, target ${bounds.ph.min} to ${bounds.ph.max}`}
          valueNumeric={latest.ph}
          bounds={bounds.ph}
        />
        <MetricTile
          title="Chlorine"
          icon={<Droplets className="h-4 w-4 shrink-0" aria-hidden />}
          valuePrimary={clPrimary}
          valueUnit={clUnit}
          metricStatus={clStatus}
          ariaLabel={`Chlorine ${clMain} ppm, ${statusPhrase(clStatus)}, target ${bounds.chlorine.min} to ${bounds.chlorine.max}`}
          valueNumeric={latest.chlorinePpm}
          bounds={bounds.chlorine}
        />
      </div>
      {age ? (
        <p className="mt-2 text-right text-[10px] font-normal tabular-nums tracking-wide text-muted/65">
          <time dateTime={latest.timestamp}>Last updated {age}</time>
        </p>
      ) : null}
    </div>
  );
}

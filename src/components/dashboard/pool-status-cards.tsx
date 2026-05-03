"use client";

import type { ReactNode } from "react";
import {
  Angry,
  Droplets,
  FlaskConical,
  Frown,
  Meh,
  Smile,
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

/** Matches dashboard stat pills (`MeasurementChart`): left accent stripe encodes limit status. */
function statusLeadingBorder(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "border-l-accent-bright";
    case "below":
      return "border-l-warning";
    case "above":
      return "border-l-danger";
    default:
      return "border-l-border-subtle";
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

const statusFaceSvgClass = "h-8 w-8 shrink-0 text-accent";
const STATUS_FACE_STROKE = 1.5;

/** Crisp SVG “faces” scale cleanly; avoids OS emoji fonts that tend to tiny or inconsistent glyphs. */
function StatusFaceIcon({ status }: { status: RangeStatus }) {
  const title = statusPhrase(status);
  const wrap = "inline-flex shrink-0";

  switch (status) {
    case "in_range":
      return (
        <span className={wrap} aria-hidden title={title}>
          <Smile className={statusFaceSvgClass} strokeWidth={STATUS_FACE_STROKE} focusable={false} />
        </span>
      );
    case "below":
      return (
        <span className={wrap} aria-hidden title={title}>
          <Frown className={statusFaceSvgClass} strokeWidth={STATUS_FACE_STROKE} focusable={false} />
        </span>
      );
    case "above":
      return (
        <span className={wrap} aria-hidden title={title}>
          <Angry className={statusFaceSvgClass} strokeWidth={STATUS_FACE_STROKE} focusable={false} />
        </span>
      );
    default:
      return (
        <span className={wrap} aria-hidden title={title}>
          <Meh className={statusFaceSvgClass} strokeWidth={STATUS_FACE_STROKE} focusable={false} />
        </span>
      );
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
        <div className="flex justify-between text-[10px] font-medium tabular-nums text-muted">
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
      ? "border-2 border-surface bg-accent-bright shadow-[0_1px_4px_rgb(13_148_136/0.45)]"
      : "border-2 border-surface bg-danger shadow-[0_1px_4px_rgb(220_38_38/0.35)] motion-safe:animate-pulse motion-reduce:animate-none";

  return (
    <div
      className="mt-2"
      aria-hidden
    >
      <div className="flex justify-between text-[10px] font-medium tabular-nums text-muted">
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
      className={`rounded-md border border-border-subtle border-l-2 bg-surface px-2 py-1.5 sm:px-2.5 sm:py-2 ${statusLeadingBorder(metricStatus)}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-accent [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
              {title}
            </p>
          </div>
        </div>
        <div className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1.5">
          <StatusFaceIcon status={metricStatus} />
          <span className="min-w-0 truncate text-[11px] font-medium leading-tight tracking-wide text-muted">
            {statusPhrase(metricStatus)}
          </span>
        </div>
      </div>

      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1 gap-y-0 tabular-nums leading-tight">
        <span className="text-lg font-semibold tracking-tight text-fg sm:text-xl">
          {valuePrimary}
        </span>
        {hasReading ? (
          <span className="text-sm font-semibold text-fg-secondary">
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
      <div className="rounded-lg border border-dashed border-accent-bright/25 bg-accent/[0.04] px-3 py-8 text-center text-sm text-muted">
        <p>No measurements yet. Connect a device to get started.</p>
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
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
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
        <p className="mt-2 text-right text-xs tabular-nums text-muted">
          <time dateTime={latest.timestamp}>Last updated {age}</time>
        </p>
      ) : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Droplets, FlaskConical, Thermometer } from "lucide-react";
import type { ClientMeasurement } from "@/lib/mappers/measurement-client";
import {
  classifyAgainstBounds,
  poolThresholdBoundsFromRows,
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

/** Left accent aligned with measurement chart stat strips; danger when out of band. */
function statusBorderLeft(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "border-l-accent-bright";
    case "below":
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

function MetricTile({
  title,
  icon,
  valuePrimary,
  valueUnit,
  targetRangeText,
  metricStatus,
  ariaLabel,
}: {
  title: string;
  icon: ReactNode;
  valuePrimary: string;
  valueUnit: string | null;
  targetRangeText: string;
  metricStatus: RangeStatus;
  ariaLabel: string;
}) {
  const hasReading = valueUnit !== null;

  return (
    <div
      className={`rounded-md border border-border-subtle border-l-2 bg-surface px-3 py-2.5 ${statusBorderLeft(metricStatus)}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
        <span className="text-accent" aria-hidden>
          {icon}
        </span>
        <span>{title}</span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0 tabular-nums leading-none">
        <span className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {valuePrimary}
        </span>
        {hasReading ? (
          <span className="text-sm font-medium text-fg-secondary sm:text-base">
            {valueUnit}
          </span>
        ) : null}
      </p>
      <div className="mt-2.5 border-t border-border-subtle/90 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          Target
        </p>
        <p className="mt-0.5 text-xs tabular-nums leading-snug text-fg-secondary sm:text-sm">
          {targetRangeText}
        </p>
      </div>
    </div>
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
      <div className="rounded-lg border border-dashed border-border-subtle bg-surface-alt/40 px-4 py-10 text-center text-sm text-muted">
        No measurements yet. Connect a device to get started.
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
  const tempUnit =
    latest.temperatureCelsius === null ? null : "°C";
  const phPrimary = phMain;
  const phUnit = latest.ph === null ? null : "pH";
  const clPrimary = clMain;
  const clUnit = latest.chlorinePpm === null ? null : "ppm";

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
      <MetricTile
        title="Temperature"
        icon={<Thermometer className="h-3 w-3 shrink-0" aria-hidden />}
        valuePrimary={tempPrimary}
        valueUnit={tempUnit}
        targetRangeText={`${bounds.temperature.min}–${bounds.temperature.max} °C`}
        metricStatus={tempStatus}
        ariaLabel={`Temperature ${tempMain}, ${statusPhrase(tempStatus)}, target ${bounds.temperature.min} to ${bounds.temperature.max} celsius`}
      />
      <MetricTile
        title="pH"
        icon={<FlaskConical className="h-3 w-3 shrink-0" aria-hidden />}
        valuePrimary={phPrimary}
        valueUnit={phUnit}
        targetRangeText={`${bounds.ph.min.toFixed(1)}–${bounds.ph.max.toFixed(1)}`}
        metricStatus={phStatus}
        ariaLabel={`pH ${phMain}, ${statusPhrase(phStatus)}, target ${bounds.ph.min} to ${bounds.ph.max}`}
      />
      <MetricTile
        title="Chlorine"
        icon={<Droplets className="h-3 w-3 shrink-0" aria-hidden />}
        valuePrimary={clPrimary}
        valueUnit={clUnit}
        targetRangeText={`${bounds.chlorine.min}–${bounds.chlorine.max} ppm`}
        metricStatus={clStatus}
        ariaLabel={`Chlorine ${clMain} ppm, ${statusPhrase(clStatus)}, target ${bounds.chlorine.min} to ${bounds.chlorine.max}`}
      />
    </div>
  );
}

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

/** Left accent only — cards stay the same white surface as elsewhere. */
function statusBorder(status: RangeStatus): string {
  switch (status) {
    case "in_range":
      return "border-l-success";
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
  valueMain,
  valueSuffix,
  metricStatus,
  targetLine,
  ariaLabel,
}: {
  title: string;
  icon: ReactNode;
  valueMain: string;
  valueSuffix?: string;
  metricStatus: RangeStatus;
  targetLine: string;
  ariaLabel: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border-subtle border-l-[3px] bg-surface p-5 shadow-card ${statusBorder(metricStatus)}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted">{title}</p>
        <span className="text-accent" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-fg">
        {valueMain}
        {valueSuffix ? (
          <span className="text-lg font-semibold text-fg-secondary">
            {" "}
            {valueSuffix}
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-muted">{targetLine}</p>
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

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricTile
        title="Temperature"
        icon={<Thermometer className="h-4 w-4 shrink-0" aria-hidden />}
        valueMain={tempMain}
        valueSuffix={latest.temperatureCelsius !== null ? "°C" : undefined}
        metricStatus={tempStatus}
        targetLine={`Target ${bounds.temperature.min}–${bounds.temperature.max} °C`}
        ariaLabel={`Temperature ${tempMain}, ${statusPhrase(tempStatus)}, target ${bounds.temperature.min} to ${bounds.temperature.max} celsius`}
      />
      <MetricTile
        title="pH"
        icon={<FlaskConical className="h-4 w-4 shrink-0" aria-hidden />}
        valueMain={phMain}
        metricStatus={phStatus}
        targetLine={`Target ${bounds.ph.min.toFixed(1)}–${bounds.ph.max.toFixed(1)}`}
        ariaLabel={`pH ${phMain}, ${statusPhrase(phStatus)}, target ${bounds.ph.min} to ${bounds.ph.max}`}
      />
      <MetricTile
        title="Chlorine"
        icon={<Droplets className="h-4 w-4 shrink-0" aria-hidden />}
        valueMain={clMain}
        valueSuffix={latest.chlorinePpm !== null ? "ppm" : undefined}
        metricStatus={clStatus}
        targetLine={`Target ${bounds.chlorine.min}–${bounds.chlorine.max} ppm`}
        ariaLabel={`Chlorine ${clMain} ppm, ${statusPhrase(clStatus)}, target ${bounds.chlorine.min} to ${bounds.chlorine.max}`}
      />
    </div>
  );
}

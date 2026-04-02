"use client";

import type { ClientMeasurement } from "@/lib/mappers/measurement-client";

interface PoolStatusCardsProps {
  measurements: Array<ClientMeasurement>;
}

function formatValue(value: number | null): string {
  if (value === null) return "-";
  return String(value);
}

export function PoolStatusCards({ measurements }: PoolStatusCardsProps) {
  const latest = measurements.length > 0
    ? [...measurements].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]
    : null;
  if (!latest) {
    return (
      <div className="wv-card p-6">
        <p className="text-muted">No measurements yet. Connect a device to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="wv-card p-6">
        <p className="text-sm font-medium text-muted">Temperature</p>
        <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
          {formatValue(latest.temperatureCelsius)} °C
        </p>
      </div>
      <div className="wv-card p-6">
        <p className="text-sm font-medium text-muted">pH</p>
        <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
          {formatValue(latest.ph)}
        </p>
      </div>
      <div className="wv-card p-6">
        <p className="text-sm font-medium text-muted">Chlorine</p>
        <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
          {formatValue(latest.chlorinePpm)} ppm
        </p>
      </div>
    </div>
  );
}

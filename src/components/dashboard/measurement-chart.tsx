"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Measurement } from "@prisma/client";

interface MeasurementChartProps {
  measurements: Array<Measurement & { device?: { name: string } }>;
}

function formatDecimal(d: unknown): number {
  if (d === null || d === undefined) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "object" && "toString" in d) {
    return parseFloat((d as { toString: () => string }).toString()) || 0;
  }
  return 0;
}

export function MeasurementChart({ measurements }: MeasurementChartProps) {
  const data = [...measurements]
    .reverse()
    .map((m) => ({
      time: new Date(m.timestamp).toLocaleString(),
      temperature: formatDecimal(m.temperatureCelsius),
      ph: formatDecimal(m.ph),
      chlorine: formatDecimal(m.chlorinePpm),
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center text-muted">
        No measurement data to display.
      </div>
    );
  }

  return (
    <div className="h-80 rounded-xl border border-border-subtle bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ph"
            name="pH"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="chlorine"
            name="Chlorine (ppm)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

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
import type { ClientMeasurement } from "@/lib/mappers/measurement-client";

interface MeasurementChartProps {
  measurements: ClientMeasurement[];
}

function formatMetric(value: number | null): number {
  return value === null ? 0 : value;
}

export function MeasurementChart({ measurements }: MeasurementChartProps) {
  const data = [...measurements]
    .reverse()
    .map((m) => ({
      time: new Date(m.timestamp).toLocaleString(),
      temperature: formatMetric(m.temperatureCelsius),
      ph: formatMetric(m.ph),
      chlorine: formatMetric(m.chlorinePpm),
    }));

  if (data.length === 0) {
    return (
      <div className="wv-card p-12 text-center text-muted">
        No measurement data to display.
      </div>
    );
  }

  return (
    <div className="wv-card h-80 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted))" />
          <YAxis tick={{ fontSize: 11 }} stroke="rgb(var(--color-muted))" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="var(--chart-temperature)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ph"
            name="pH"
            stroke="var(--chart-ph)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="chlorine"
            name="Chlorine (ppm)"
            stroke="var(--chart-chlorine)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";
import type { ClientMeasurement } from "@/lib/mappers/measurement-client";
import {
  formatChartAxisTick,
  formatDateTimeForDisplay,
} from "@/lib/format/datetime";

const ClientMeasurementSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  timestamp: z.string(),
  temperatureCelsius: z.number().nullable(),
  ph: z.number().nullable(),
  chlorinePpm: z.number().nullable(),
  device: z.object({ name: z.string() }).optional(),
  deviceName: z.string().optional(),
});

const MeasurementsSchema = z.array(ClientMeasurementSchema);

const EMPTY_MEASUREMENTS: ClientMeasurement[] = [];

type MetricId = "temperature" | "ph" | "chlorine";
type RangeId = "24h" | "7d" | "30d" | "all";

const RANGE_MS: Record<Exclude<RangeId, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/** Typical residential pool guidance — visual hint only, not professional advice. */
const TARGET_PH = { min: 7.2, max: 7.6 };
const TARGET_CHLORINE_PPM = { min: 1, max: 3 };

const MULTI_LINE_STROKES = [
  "var(--chart-brand-accent)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
  "var(--chart-ph)",
  "var(--chart-chlorine)",
  "var(--chart-series-4)",
] as const;

const METRIC_STROKE: Record<MetricId, string> = {
  temperature: "var(--chart-brand-accent)",
  ph: "var(--chart-brand-accent)",
  chlorine: "var(--chart-brand-accent)",
};

const SEGMENT_GROUP =
  "inline-flex rounded-lg border border-border-subtle bg-surface-alt/50 p-0.5 text-xs font-medium shadow-sm";

function segmentBtn(active: boolean): string {
  const base =
    "rounded-md px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
  return active
    ? `${base} bg-accent text-on-accent shadow-sm`
    : `${base} text-muted hover:bg-surface hover:text-fg-secondary`;
}

interface MeasurementChartProps {
  measurements: ClientMeasurement[];
  variant?: "compact" | "expanded";
}

function deviceLabel(m: ClientMeasurement): string {
  return (
    m.device?.name ??
    m.deviceName ??
    `Device ${m.deviceId.slice(0, 8)}`
  );
}

function metricValue(m: ClientMeasurement, metric: MetricId): number | null {
  switch (metric) {
    case "temperature":
      return m.temperatureCelsius;
    case "ph":
      return m.ph;
    case "chlorine":
      return m.chlorinePpm;
    default:
      return null;
  }
}

function formatMetricValue(metric: MetricId, v: number): string {
  switch (metric) {
    case "temperature":
      return `${v.toFixed(1)} °C`;
    case "ph":
      return v.toFixed(2);
    case "chlorine":
      return `${v.toFixed(2)} ppm`;
    default:
      return String(v);
  }
}

function metricAxisLabel(metric: MetricId): string {
  switch (metric) {
    case "temperature":
      return "°C";
    case "ph":
      return "pH";
    case "chlorine":
      return "ppm";
    default:
      return "";
  }
}

function filterByRange(
  items: ClientMeasurement[],
  range: RangeId,
): ClientMeasurement[] {
  if (range === "all") return items;
  const cutoff = Date.now() - RANGE_MS[range];
  return items.filter(
    (m) => new Date(m.timestamp).getTime() >= cutoff,
  );
}

type ChartRow = {
  time: number;
  [deviceSeriesKey: string]: number | undefined | string;
};

function buildChartRows(
  items: ClientMeasurement[],
  metric: MetricId,
): { rows: ChartRow[]; series: Array<{ deviceId: string; label: string }> } {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const seriesMap = new Map<string, string>();
  for (const m of sorted) {
    if (!seriesMap.has(m.deviceId)) {
      seriesMap.set(m.deviceId, deviceLabel(m));
    }
  }
  const series = [...seriesMap.entries()].map(([deviceId, label]) => ({
    deviceId,
    label,
  }));

  const timeBuckets = new Map<number, ChartRow>();
  for (const m of sorted) {
    const v = metricValue(m, metric);
    if (v === null || Number.isNaN(v)) continue;
    const t = new Date(m.timestamp).getTime();
    const key = `d_${m.deviceId}`;
    const row =
      timeBuckets.get(t) ??
      ({
        time: t,
      } as ChartRow);
    row[key] = v;
    timeBuckets.set(t, row);
  }

  const rows = [...timeBuckets.values()].sort((a, b) => a.time - b.time);
  return { rows, series };
}

function collectNumericValues(
  rows: ChartRow[],
  seriesKeys: string[],
): number[] {
  const out: number[] = [];
  for (const row of rows) {
    for (const key of seriesKeys) {
      const v = row[key];
      if (typeof v === "number" && Number.isFinite(v)) out.push(v);
    }
  }
  return out;
}

function yPadding(metric: MetricId, values: number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max || 1) * 0.05 || 0.5;
  const pad = Math.max(span * 0.12, metric === "ph" ? 0.05 : span * 0.02);
  let low = min - pad;
  let high = max + pad;
  if (metric === "ph") {
    low = Math.min(low, TARGET_PH.min - 0.15);
    high = Math.max(high, TARGET_PH.max + 0.15);
  }
  if (metric === "chlorine") {
    low = Math.max(0, Math.min(low, TARGET_CHLORINE_PPM.min - 0.25));
    high = Math.max(high, TARGET_CHLORINE_PPM.max + 0.5);
  }
  return [low, high];
}

type TooltipRow = {
  value?: unknown;
  name?: unknown;
  dataKey?: unknown;
  color?: string;
  payload?: { time?: number };
};

function ChartTooltipBody({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  label?: unknown;
  payload?: TooltipRow[];
  metric: MetricId;
}) {
  if (!active || payload == null || payload.length === 0) return null;
  const t =
    typeof label === "number"
      ? label
      : typeof payload[0]?.payload?.time === "number"
        ? payload[0].payload.time
        : NaN;
  const when =
    Number.isFinite(t) && typeof t === "number"
      ? formatDateTimeForDisplay(new Date(t))
      : "—";

  return (
    <div className="rounded-lg border border-accent-bright/25 bg-surface px-2.5 py-2 text-xs shadow-lg ring-1 ring-accent/10">
      <p className="font-medium text-accent">{when}</p>
      <ul className="mt-1.5 space-y-0.5">
        {payload.map((item) => {
          const v = item.value;
          const name = item.name ?? item.dataKey;
          if (typeof v !== "number" || Number.isNaN(v)) return null;
          return (
            <li
              key={String(item.dataKey)}
              className="flex items-center justify-between gap-4 tabular-nums text-fg-secondary"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? "#64748b" }}
                  aria-hidden
                />
                <span>{String(name)}</span>
              </span>
              <span className="font-medium text-fg">
                {formatMetricValue(metric, v)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MeasurementChart({
  measurements,
  variant = "compact",
}: MeasurementChartProps) {
  const parseResult = useMemo(() => {
    const result = MeasurementsSchema.safeParse(measurements);
    if (!result.success) {
      return { ok: false as const, data: EMPTY_MEASUREMENTS };
    }
    return { ok: true as const, data: result.data };
  }, [measurements]);

  const safeMeasurements = parseResult.data;

  const [metric, setMetric] = useState<MetricId>("temperature");
  const [range, setRange] = useState<RangeId>(
    variant === "expanded" ? "7d" : "24h",
  );
  const [deviceId, setDeviceId] = useState<string>("all");

  const filtered = useMemo(
    () => filterByRange(safeMeasurements, range),
    [safeMeasurements, range],
  );

  const deviceOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of filtered) {
      if (!map.has(m.deviceId)) map.set(m.deviceId, deviceLabel(m));
    }
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "nl"),
    );
  }, [filtered]);

  const scoped = useMemo(() => {
    if (deviceId === "all") return filtered;
    return filtered.filter((m) => m.deviceId === deviceId);
  }, [filtered, deviceId]);

  const { rows: rawRows, series } = useMemo(
    () => buildChartRows(scoped, metric),
    [scoped, metric],
  );

  const activeSeries = useMemo(() => {
    if (deviceId === "all") return series;
    return series.filter((s) => s.deviceId === deviceId);
  }, [series, deviceId]);

  const seriesKeys = useMemo(
    () => activeSeries.map((s) => `d_${s.deviceId}`),
    [activeSeries],
  );

  const chartRows = rawRows;

  const spanMs = useMemo(() => {
    if (chartRows.length < 2) return 0;
    return chartRows[chartRows.length - 1]!.time - chartRows[0]!.time;
  }, [chartRows]);

  const values = useMemo(
    () => collectNumericValues(chartRows, seriesKeys),
    [chartRows, seriesKeys],
  );

  const [yLow, yHigh] = useMemo(
    () => yPadding(metric, values),
    [metric, values],
  );

  const stats = useMemo(() => {
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sortedScoped = [...scoped].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    let latest: number | null = null;
    for (const m of sortedScoped) {
      const v = metricValue(m, metric);
      if (v !== null && Number.isFinite(v)) {
        latest = v;
        break;
      }
    }
    return { min, max, avg, latest };
  }, [values, scoped, metric]);

  const metricHint = useMemo(() => {
    switch (metric) {
      case "ph":
        return `Typical target band ~${TARGET_PH.min}–${TARGET_PH.max} (shaded).`;
      case "chlorine":
        return `Typical free chlorine ~${TARGET_CHLORINE_PPM.min}–${TARGET_CHLORINE_PPM.max} ppm (shaded). Guidance varies by pool type.`;
      default:
        return "Swim comfort depends on heater and preference — values are shown as measured.";
    }
  }, [metric]);

  const chartHeight = variant === "expanded" ? 352 : 248;
  const showBrush = variant === "expanded" && chartRows.length > 24;

  if (!parseResult.ok) {
    return (
      <div className="rounded-lg border border-dashed border-accent-bright/25 bg-accent/[0.04] px-3 py-8 text-center text-sm text-muted">
        Could not load chart data (invalid measurement payload).
      </div>
    );
  }

  if (safeMeasurements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-accent-bright/25 bg-accent/[0.04] px-3 py-8 text-center text-sm text-muted">
        No measurement data to display.
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="space-y-2">
        <div
          className={SEGMENT_GROUP}
          role="group"
          aria-label="Metric"
        >
          {(
            [
              ["temperature", "Temperature"],
              ["ph", "pH"],
              ["chlorine", "Chlorine"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={segmentBtn(metric === id)}
              onClick={() => setMetric(id)}
              aria-pressed={metric === id}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface-alt/50 px-3 py-8 text-center text-sm text-muted">
          No samples in this time window. Choose a wider range or check device activity.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-accent-bright/25 bg-gradient-to-br from-accent/[0.07] via-surface to-surface p-2 sm:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-accent">
              Metric
            </span>
            <div
              className={SEGMENT_GROUP}
              role="group"
              aria-label="Metric"
            >
              {(
                [
                  ["temperature", "Temperature"],
                  ["ph", "pH"],
                  ["chlorine", "Chlorine"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={segmentBtn(metric === id)}
                  onClick={() => setMetric(id)}
                  aria-pressed={metric === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-accent sm:w-11">
              Range
            </span>
            <div
              className={SEGMENT_GROUP}
              role="group"
              aria-label="Time range"
            >
              {(
                [
                  ["24h", "24 h"],
                  ["7d", "7 d"],
                  ["30d", "30 d"],
                  ["all", "All"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={segmentBtn(range === id)}
                  onClick={() => setRange(id)}
                  aria-pressed={range === id}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {deviceOptions.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
              <label
                htmlFor="measurement-chart-device"
                className="text-[10px] font-semibold uppercase tracking-wider text-accent"
              >
                Device
              </label>
              <select
                id="measurement-chart-device"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="max-w-[12rem] rounded-lg border border-accent-bright/30 bg-surface px-2 py-1 text-xs text-fg shadow-sm transition-colors focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-bright/35"
              >
                <option value="all">All devices</option>
                {deviceOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <p className="mt-2 border-t border-accent-bright/15 pt-2 text-[11px] leading-snug text-muted">
          {metricHint}
        </p>
      </div>

      {stats ? (
        <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
          <div className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-accent">
              Min
            </dt>
            <dd className="tabular-nums text-sm font-semibold leading-tight text-fg">
              {formatMetricValue(metric, stats.min)}
            </dd>
          </div>
          <div className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-accent">
              Max
            </dt>
            <dd className="tabular-nums text-sm font-semibold leading-tight text-fg">
              {formatMetricValue(metric, stats.max)}
            </dd>
          </div>
          <div className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-accent">
              Avg
            </dt>
            <dd className="tabular-nums text-sm font-semibold leading-tight text-fg">
              {formatMetricValue(metric, stats.avg)}
            </dd>
          </div>
          <div className="rounded-md border border-border-subtle border-l-2 border-accent-bright bg-surface px-2 py-1.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-accent">
              Latest
            </dt>
            <dd className="tabular-nums text-sm font-semibold leading-tight text-fg">
              {stats.latest !== null
                ? formatMetricValue(metric, stats.latest)
                : "—"}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="rounded-md bg-surface p-1 ring-1 ring-accent-bright/25">
        {chartRows.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center px-3 py-8 text-center text-sm text-muted">
            No numeric readings for this metric in the current filters.
          </div>
        ) : (
          <div
            style={{ height: chartHeight }}
            className="w-full min-h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartRows}
                margin={{
                  top: 6,
                  right: 6,
                  left: 2,
                  bottom: showBrush ? 44 : 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(var(--color-accent-bright) / 0.12)"
                />
                <XAxis
                  type="number"
                  dataKey="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v: number) =>
                    formatChartAxisTick(v, { spanMs })
                  }
                  tick={{ fontSize: 10 }}
                  stroke="rgb(var(--color-muted))"
                  minTickGap={24}
                />
                <YAxis
                  domain={[yLow, yHigh]}
                  tick={{ fontSize: 10 }}
                  stroke="rgb(var(--color-muted))"
                  width={40}
                  tickFormatter={(v: number) =>
                    metric === "temperature"
                      ? v.toFixed(1)
                      : v.toFixed(2)
                  }
                  label={{
                    value: metricAxisLabel(metric),
                    angle: -90,
                    position: "insideLeft",
                    offset: 6,
                    style: {
                      fill: "rgb(var(--color-accent-bright))",
                      fontSize: 10,
                      fontWeight: 600,
                    },
                  }}
                />
                {metric === "ph" ? (
                  <ReferenceArea
                    y1={TARGET_PH.min}
                    y2={TARGET_PH.max}
                    strokeOpacity={0}
                    fill="var(--chart-ph)"
                    fillOpacity={0.12}
                  />
                ) : null}
                {metric === "chlorine" ? (
                  <ReferenceArea
                    y1={TARGET_CHLORINE_PPM.min}
                    y2={TARGET_CHLORINE_PPM.max}
                    strokeOpacity={0}
                    fill="var(--chart-chlorine)"
                    fillOpacity={0.12}
                  />
                ) : null}
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartTooltipBody
                      active={tooltipProps.active}
                      payload={
                        tooltipProps.payload as TooltipRow[] | undefined
                      }
                      label={tooltipProps.label}
                      metric={metric}
                    />
                  )}
                  cursor={{
                    stroke: "rgb(var(--color-accent-bright))",
                    strokeDasharray: "4 4",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 0,
                    lineHeight: "14px",
                  }}
                />
                {activeSeries.map((s, i) => (
                  <Line
                    key={s.deviceId}
                    type="monotone"
                    dataKey={`d_${s.deviceId}`}
                    name={s.label}
                    stroke={
                      activeSeries.length === 1
                        ? METRIC_STROKE[metric]
                        : MULTI_LINE_STROKES[i % MULTI_LINE_STROKES.length]
                    }
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
                {showBrush ? (
                  <Brush
                    dataKey="time"
                    height={18}
                    stroke="rgb(var(--color-accent-bright))"
                    travellerWidth={7}
                    tickFormatter={(v: number) =>
                      formatChartAxisTick(v, { spanMs })
                    }
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="text-[11px] leading-tight text-muted">
        {chartRows.length} points · {scoped.length} samples
        {variant === "expanded" && showBrush
          ? " · brush to zoom"
          : ""}
      </p>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { LineChart } from "lucide-react";

/** Demo values for the hero trend strip — matches the original marketing preview. */
const TREND_BAR_HEIGHTS = [
  40, 55, 48, 62, 58, 70, 66, 74, 68, 80, 76, 88,
] as const;

const METRICS = [
  {
    label: "Temperature",
    value: "28.2",
    unit: "°C",
    tone: "text-accent-bright",
  },
  { label: "pH", value: "7.34", unit: "", tone: "text-success" },
  {
    label: "Chlorine",
    value: "1.12",
    unit: "ppm",
    tone: "text-warning",
  },
] as const;

/** Panel + status transitions: calm ease-out, aligned with AquaSense motion defaults. */
const transitionPanel =
  "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0";

export function LandingHeroPreview() {
  const [tab, setTab] = useState<"live" | "trend">("trend");
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [trendAnimKey, setTrendAnimKey] = useState(0);

  const selectTab = useCallback((next: "live" | "trend") => {
    setTab(next);
    if (next === "trend") {
      setTrendAnimKey((k) => k + 1);
    }
  }, []);

  return (
    <div className="relative w-full max-w-md lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent-bright/20 via-transparent to-sky-400/10 blur-2xl"
        aria-hidden
      />
      <div className="relative w-full rounded-2xl border border-border-subtle bg-surface/95 p-6 shadow-card backdrop-blur-md">
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="tablist"
            aria-label="Preview view"
            className="inline-flex shrink-0 rounded-lg bg-surface-alt/90 p-1 ring-1 ring-border-subtle/80"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "live"}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out motion-reduce:transition-none ${
                tab === "live"
                  ? "bg-surface text-fg shadow-sm ring-1 ring-border-subtle/80"
                  : "text-muted hover:bg-surface/60 hover:text-fg"
              }`}
              onClick={() => selectTab("live")}
            >
              Live
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "trend"}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-300 ease-out motion-reduce:transition-none ${
                tab === "trend"
                  ? "bg-surface text-fg shadow-sm ring-1 ring-border-subtle/80"
                  : "text-muted hover:bg-surface/60 hover:text-fg"
              }`}
              onClick={() => selectTab("trend")}
            >
              Trend
            </button>
          </div>

          <div className="relative h-9 w-full min-w-0 sm:w-auto sm:min-w-[11rem]">
            <div
              className={`absolute inset-0 flex items-center justify-end ${transitionPanel} ${
                tab === "live"
                  ? "z-10 translate-y-0 opacity-100"
                  : "z-0 pointer-events-none translate-y-1 opacity-0"
              }`}
              aria-hidden={tab !== "live"}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Healthy
              </span>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-end text-right ${transitionPanel} ${
                tab === "trend"
                  ? "z-10 translate-y-0 opacity-100"
                  : "z-0 pointer-events-none -translate-y-1 opacity-0"
              }`}
              aria-hidden={tab !== "trend"}
            >
              <span className="text-xs font-medium text-muted">Demo (last 24h)</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid w-full min-w-0 grid-cols-1 grid-rows-1">
          <div
            className={`col-start-1 row-start-1 w-full min-w-0 self-start ${transitionPanel} ${
              tab === "live"
                ? "z-10 translate-y-0 opacity-100"
                : "z-0 pointer-events-none translate-y-2 opacity-0"
            }`}
            aria-hidden={tab !== "live"}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Live overview
              </p>
              <p className="mt-1 text-sm font-medium text-fg">Main pool</p>
              <p className="mt-2 text-xs text-muted">
                Tap a metric to highlight it. It is the same idea as focusing a
                measurement in the real app.
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {METRICS.map((m, i) => {
                const isSelected = selectedMetric === i;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMetric(i)}
                    className={`rounded-xl border bg-surface-alt/60 px-3 py-3 text-left transition-all duration-200 ease-out ${
                      isSelected
                        ? "border-accent-bright shadow-md ring-2 ring-accent-bright/30"
                        : "border-border-subtle hover:border-accent-bright/45 hover:shadow-sm"
                    }`}
                  >
                    <p className="text-xs font-medium text-muted">{m.label}</p>
                    <p className={`mt-1 text-xl font-bold tabular-nums ${m.tone}`}>
                      {m.value}
                      {m.unit && (
                        <span className="text-sm font-semibold text-muted">
                          {" "}
                          {m.unit}
                        </span>
                      )}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`col-start-1 row-start-1 flex w-full min-w-0 items-stretch self-stretch ${transitionPanel} ${
              tab === "trend"
                ? "z-10 translate-y-0 opacity-100"
                : "z-0 pointer-events-none -translate-y-2 opacity-0"
            }`}
            aria-hidden={tab !== "trend"}
          >
            <div className="flex w-full min-h-0 flex-1 flex-col justify-center">
              <div className="rounded-xl border border-dashed border-border-subtle bg-canvas/50 px-4 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-fg-secondary">
                  <LineChart
                    className="h-4 w-4 shrink-0 text-accent-bright"
                    aria-hidden
                  />
                  Trend preview (last 24h)
                </div>
                <div
                  key={trendAnimKey}
                  className="mt-4 flex h-28 items-end gap-1.5 sm:h-32"
                >
                  {TREND_BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="flex h-full min-h-0 flex-1 flex-col justify-end"
                    >
                      <div
                        className="w-full origin-bottom rounded-t-sm bg-gradient-to-t from-accent/30 to-accent-bright/50 motion-safe:animate-landing-bar-up motion-reduce:animate-none"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 45}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

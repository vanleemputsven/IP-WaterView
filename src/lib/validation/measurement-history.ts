import { z } from "zod";

const metricSchema = z.enum(["temperature", "ph", "chlorine"]);

export const MEASUREMENT_HISTORY_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export type MeasurementHistoryPageSize =
  (typeof MEASUREMENT_HISTORY_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE: MeasurementHistoryPageSize = 25;

const pageSchema = z.coerce.number().int().min(1).max(10_000);

const allowedPageSizeSchema = z.union([
  z.literal(25),
  z.literal(50),
  z.literal(100),
]);

function parsePageSizeParam(raw: string | undefined): MeasurementHistoryPageSize {
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE;
  }
  const parsed = allowedPageSizeSchema.safeParse(Number(raw.trim()));
  return parsed.success ? parsed.data : DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE;
}

const deviceFilterSchema = z.string().min(1).max(128);

/**
 * Parses the `device` search param against the user's allowlisted device ids.
 * Invalid or unknown values are ignored (same as measurement history).
 */
export function resolveDeviceQueryParam(
  raw: Record<string, string | string[] | undefined>,
  allowedDeviceIds: ReadonlySet<string>,
): string | undefined {
  const pick = (key: string): string | undefined =>
    typeof raw[key] === "string" ? raw[key] : undefined;

  const deviceRaw = pick("device")?.trim() ?? "";
  const deviceChecked =
    deviceRaw === "" ? undefined : deviceFilterSchema.safeParse(deviceRaw);
  const deviceCandidate =
    deviceChecked?.success === true ? deviceChecked.data : undefined;
  return deviceCandidate !== undefined && allowedDeviceIds.has(deviceCandidate)
    ? deviceCandidate
    : undefined;
}

/** Dashboard home URLs share the same `device` query key as `/dashboard/history`. */
export function buildDashboardHref(opts: { deviceId?: string }): string {
  if (!opts.deviceId) return "/dashboard";
  const p = new URLSearchParams();
  p.set("device", opts.deviceId);
  return `/dashboard?${p.toString()}`;
}

/**
 * Resolves validated measurement history query from URL search params.
 * Device ID must appear in the allowlist from the user's active devices.
 */
export function resolveMeasurementHistoryQuery(
  raw: Record<string, string | string[] | undefined>,
  allowedDeviceIds: ReadonlySet<string>,
): {
  deviceId?: string;
  metric?: "temperature" | "ph" | "chlorine";
  pageRequested: number;
  pageSize: MeasurementHistoryPageSize;
} {
  const pick = (key: string): string | undefined =>
    typeof raw[key] === "string" ? raw[key] : undefined;

  const deviceId = resolveDeviceQueryParam(raw, allowedDeviceIds);

  const metricRaw = pick("metric")?.trim() ?? "";
  const metricChecked =
    metricRaw === "" ? undefined : metricSchema.safeParse(metricRaw);
  const metric =
    metricChecked?.success === true ? metricChecked.data : undefined;

  const pageRaw = pick("page")?.trim() ?? "";
  const pageParsed =
    pageRaw === "" ? pageSchema.safeParse(1) : pageSchema.safeParse(pageRaw);
  const pageRequested = pageParsed.success ? pageParsed.data : 1;

  const pageSize = parsePageSizeParam(pick("pageSize"));

  return { deviceId, metric, pageRequested, pageSize };
}

/** Stable dashboard history URLs: omit default page size and page 1 for shorter query strings. */
export function buildMeasurementHistoryHref(opts: {
  deviceId?: string;
  metric?: "temperature" | "ph" | "chlorine";
  page: number;
  pageSize: MeasurementHistoryPageSize;
}): string {
  const p = new URLSearchParams();
  if (opts.deviceId) p.set("device", opts.deviceId);
  if (opts.metric) p.set("metric", opts.metric);
  if (opts.pageSize !== DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE) {
    p.set("pageSize", String(opts.pageSize));
  }
  if (opts.page > 1) p.set("page", String(opts.page));
  const q = p.toString();
  return q ? `/dashboard/history?${q}` : "/dashboard/history";
}

/**
 * Human-facing timestamps for app UI (dashboard, admin).
 * Stored values stay UTC in the DB; this converts for display only.
 * English (en-US) labels with Europe/Amsterdam timezone match dashboard copy and local pool ops time.
 */
const DISPLAY_LOCALE = "en-US";
const DISPLAY_TIME_ZONE = "Europe/Amsterdam";

const dateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  timeZone: DISPLAY_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTimeForDisplay(
  date: Date | null | undefined,
): string {
  if (date == null) return "-";
  if (Number.isNaN(date.getTime())) return "-";
  return dateTimeFormatter.format(date);
}

/** Compact axis labels for charts (en-US, Europe/Amsterdam). */
export function formatChartAxisTick(
  epochMs: number,
  opts: { spanMs: number },
): string {
  const d = new Date(epochMs);
  if (Number.isNaN(d.getTime())) return "";

  const showDate = opts.spanMs > 36 * 60 * 60 * 1000;

  if (showDate) {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      timeZone: DISPLAY_TIME_ZONE,
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

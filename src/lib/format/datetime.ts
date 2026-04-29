/**
 * Human-facing timestamps for admin UI.
 * Stored values stay UTC in the DB; this converts for display only.
 * Uses Dutch formatting and Europe/Amsterdam so SSR (e.g. Vercel) matches local pool ops expectations.
 */
const DISPLAY_LOCALE = "nl-NL";
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

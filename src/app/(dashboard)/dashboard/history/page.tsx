import { redirect } from "next/navigation";

type LegacyHistoryRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function searchParamsToQueryString(
  raw: Record<string, string | string[] | undefined>,
): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v);
    } else {
      q.append(key, value);
    }
  }
  return q.toString();
}

/** Old path — `/dashboard/measurements` is canonical; preserve filters in query string. */
export default async function LegacyHistoryRedirect({
  searchParams,
}: LegacyHistoryRedirectProps) {
  const raw = await searchParams;
  const qs = searchParamsToQueryString(raw);
  redirect(qs ? `/dashboard/measurements?${qs}` : "/dashboard/measurements");
}

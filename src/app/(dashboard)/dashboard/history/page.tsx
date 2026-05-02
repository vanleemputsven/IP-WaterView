import { createClient } from "@/lib/supabase/server";
import { MeasurementHistoryFilterForm } from "@/components/dashboard/measurement-history-filter-form";
import { MeasurementHistoryPagination } from "@/components/dashboard/measurement-history-pagination";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";
import { prisma } from "@/lib/db/prisma";
import { formatDateTimeForDisplay } from "@/lib/format/datetime";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import { buildMeasurementHistoryWhere } from "@/lib/repositories/measurement-repository";
import { getProfileByUserId } from "@/lib/services/profile-service";
import {
  buildMeasurementHistoryHref,
  resolveMeasurementHistoryQuery,
} from "@/lib/validation/measurement-history";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Hard cap for chart series — avoids loading an unbounded series on every request. */
const CHART_SAMPLE_LIMIT = 1000;

type HistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatTemp(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)} °C`;
}

function formatPh(n: number | null): string {
  if (n === null) return "—";
  return n.toFixed(2);
}

function formatChlorine(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(2)} ppm`;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const raw = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  if (!profile) return null;

  const devices = await prisma.device.findMany({
    where: { profileId: profile.id, isActive: true },
    orderBy: { name: "asc" },
  });

  const deviceIds = devices.map((d) => d.id);
  const allowedDeviceIds = new Set(deviceIds);
  const query = resolveMeasurementHistoryQuery(raw, allowedDeviceIds);

  const where = buildMeasurementHistoryWhere({
    deviceIds,
    deviceId: query.deviceId,
    metric: query.metric,
  });

  const [totalCount, measurementsRaw] = await Promise.all([
    prisma.measurement.count({ where }),
    prisma.measurement.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: CHART_SAMPLE_LIMIT,
      include: { device: true },
    }),
  ]);

  const totalPages =
    totalCount === 0 ? 1 : Math.ceil(totalCount / query.pageSize);
  const page = Math.min(
    query.pageRequested,
    Math.max(1, totalPages),
  );
  if (page !== query.pageRequested) {
    redirect(
      buildMeasurementHistoryHref({
        deviceId: query.deviceId,
        metric: query.metric,
        page,
        pageSize: query.pageSize,
      }),
    );
  }
  const skip = (page - 1) * query.pageSize;

  const listRowsRaw = await prisma.measurement.findMany({
    where,
    orderBy: { timestamp: "desc" },
    skip,
    take: query.pageSize,
    include: { device: true },
  });

  const measurements = measurementsRaw.map(mapMeasurementToClient);
  const listRows = listRowsRaw.map(mapMeasurementToClient);

  const emptyMessage =
    query.deviceId !== undefined || query.metric !== undefined
      ? "No measurements match these filters."
      : "No measurements yet.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Measurement history</h1>
        <p className="mt-0.5 max-w-3xl text-sm text-muted">
          Historical pool measurements over time
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-medium text-fg">Chart</h2>
        <p className="mt-0.5 max-w-3xl text-sm text-muted">
          Up to {CHART_SAMPLE_LIMIT.toLocaleString("nl-NL")} most recent samples
          for the current filters — enough to see trends without loading the full
          dataset. Use the table below for paged rows.
        </p>
        <div className="mt-3">
          <MeasurementChart measurements={measurements} variant="expanded" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <MeasurementHistoryFilterForm
          devices={devices}
          filters={{
            deviceId: query.deviceId,
            metric: query.metric,
            pageSize: query.pageSize,
          }}
        />
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Device
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Temp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                pH
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Chlorine
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {listRows.map((m) => (
              <tr key={m.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {formatDateTimeForDisplay(new Date(m.timestamp))}
                </td>
                <td
                  className="max-w-[14rem] truncate px-4 py-3 text-sm text-fg-secondary"
                  title={m.device?.name}
                >
                  {m.device?.name ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {formatTemp(m.temperatureCelsius)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {formatPh(m.ph)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">
                  {formatChlorine(m.chlorinePpm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listRows.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">{emptyMessage}</div>
        )}
        {totalCount > 0 ? (
          <MeasurementHistoryPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={query.pageSize}
            deviceId={query.deviceId}
            metric={query.metric}
          />
        ) : null}
      </div>
    </div>
  );
}

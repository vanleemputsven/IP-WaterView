import { DashboardDeviceFilterForm } from "@/components/dashboard/dashboard-device-filter-form";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";
import { PoolStatusCards } from "@/components/dashboard/pool-status-cards";
import { prisma } from "@/lib/db/prisma";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import { fetchPoolThresholdBoundsByDeviceIds } from "@/lib/services/threshold-service";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { createClient } from "@/lib/supabase/server";

import {
  buildMeasurementHistoryHref,
  DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE,
  resolveDeviceQueryParam,
} from "@/lib/validation/measurement-history";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function greetingName(email: string): string | null {
  const local = email.split("@")[0]?.trim();
  if (!local) return null;
  const segment = local.split(/[._+-]/)[0];
  if (!segment || segment.length > 48) return null;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const rawSearch = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  if (!profile) return null;

  const allDevices = await prisma.device.findMany({
    where: { profileId: profile.id, isActive: true },
    orderBy: { name: "asc" },
    include: {
      measurements: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  const allowedIds = new Set(allDevices.map((d) => d.id));
  const filteredDeviceId = resolveDeviceQueryParam(rawSearch, allowedIds);

  const devices =
    filteredDeviceId !== undefined
      ? allDevices.filter((d) => d.id === filteredDeviceId)
      : allDevices;

  const deviceIdsForMeasurements = devices.map((d) => d.id);

  const poolStatusDevices = devices.map((d) => ({
    deviceId: d.id,
    deviceName: d.name,
    latestMeasurement:
      d.measurements[0] !== undefined
        ? mapMeasurementToClient({ ...d.measurements[0], deviceName: d.name })
        : null,
  }));

  const recentMeasurementsRaw =
    deviceIdsForMeasurements.length === 0
      ? []
      : await prisma.measurement.findMany({
          where: { deviceId: { in: deviceIdsForMeasurements } },
          orderBy: { timestamp: "desc" },
          take: 750,
          include: { device: true },
        });
  const recentMeasurements = recentMeasurementsRaw.map(mapMeasurementToClient);

  const thresholdsByDeviceId =
    deviceIdsForMeasurements.length === 0
      ? {}
      : await fetchPoolThresholdBoundsByDeviceIds(deviceIdsForMeasurements);

  const welcomeName = greetingName(profile.email);

  const filterDevicesForSelect = allDevices.map(({ id, name }) => ({ id, name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Dashboard</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          {welcomeName ? (
            <>
              Welcome back,{" "}
              <span className="font-medium text-fg-secondary">{welcomeName}</span>.
              {" "}
            </>
          ) : null}
          Current measurements and recent trends from your pool monitor.
        </p>
        {filterDevicesForSelect.length > 1 ? (
          <div className="mt-4">
            <DashboardDeviceFilterForm
              devices={filterDevicesForSelect}
              selectedDeviceId={filteredDeviceId}
            />
          </div>
        ) : null}
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/35 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-fg">
              Pool status
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Latest readings compared to your device limits.
            </p>
          </div>
        </div>
        <div className="relative mt-4">
          <PoolStatusCards
            devices={poolStatusDevices}
            thresholdsByDeviceId={thresholdsByDeviceId}
          />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-fg">
              Recent measurements
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Recent samples for the current scope.{" "}
              <Link
                href={buildMeasurementHistoryHref({
                  deviceId: filteredDeviceId,
                  page: 1,
                  pageSize: DEFAULT_MEASUREMENT_HISTORY_PAGE_SIZE,
                })}
                className="text-accent underline-offset-2 hover:underline"
              >
                View all measurements
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="relative mt-3">
          <MeasurementChart measurements={recentMeasurements} variant="compact" />
        </div>
      </section>
    </div>
  );
}

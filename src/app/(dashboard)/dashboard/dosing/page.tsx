import { DashboardDeviceFilterForm } from "@/components/dashboard/dashboard-device-filter-form";
import { DosingGuidancePanel } from "@/components/dashboard/dosing-guidance-panel";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import {
  poolThresholdBoundsFromRows,
  type PoolThresholdBounds,
} from "@/lib/pool/threshold-bounds";
import {
  getPoolDosingSettingsForDevices,
  type PoolDosingSettingsDTO,
} from "@/lib/services/device-pool-dosing-settings-service";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { fetchPoolThresholdBoundsByDeviceIds } from "@/lib/services/threshold-service";
import { createClient } from "@/lib/supabase/server";
import { resolveDeviceQueryParam } from "@/lib/validation/measurement-history";

export const dynamic = "force-dynamic";

type DosingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DosingPage({ searchParams }: DosingPageProps) {
  const rawSearch = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const deviceIds = devices.map((d) => d.id);

  const [dosingByDeviceId, thresholdsByDeviceId] = await Promise.all([
    deviceIds.length === 0
      ? Promise.resolve({} as Record<string, PoolDosingSettingsDTO | null>)
      : getPoolDosingSettingsForDevices(deviceIds),
    deviceIds.length === 0
      ? Promise.resolve({} as Record<string, PoolThresholdBounds>)
      : fetchPoolThresholdBoundsByDeviceIds(deviceIds),
  ]);

  const filterDevicesForSelect = allDevices.map(({ id, name }) => ({ id, name }));
  const isAdmin = canAccessAdmin(profile.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Dosing</h1>
        {filterDevicesForSelect.length > 1 ? (
          <div className="mt-4">
            <DashboardDeviceFilterForm
              devices={filterDevicesForSelect}
              selectedDeviceId={filteredDeviceId}
              actionPath="/dashboard/dosing"
              legendLabel="Filter dosing view by device"
            />
          </div>
        ) : null}
      </div>

      {devices.length === 0 ? (
        <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-card">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
            aria-hidden
          />
          <p className="relative text-sm text-muted">
            No active devices yet.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {devices.map((d) => {
            const latestRaw = d.measurements[0];
            const latest =
              latestRaw !== undefined
                ? mapMeasurementToClient({ ...latestRaw, deviceName: d.name })
                : null;
            const bounds =
              thresholdsByDeviceId[d.id] ?? poolThresholdBoundsFromRows([]);

            return (
              <DosingGuidancePanel
                key={d.id}
                deviceId={d.id}
                deviceName={d.name}
                latest={latest}
                bounds={bounds}
                dosingSettings={dosingByDeviceId[d.id] ?? null}
                isAdmin={isAdmin}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { prisma } from "@/lib/db/prisma";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import { fetchPoolThresholdBoundsByDeviceIds } from "@/lib/services/threshold-service";
import { PoolStatusCards } from "@/components/dashboard/pool-status-cards";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";

export const dynamic = "force-dynamic";

function greetingName(email: string): string | null {
  const local = email.split("@")[0]?.trim();
  if (!local) return null;
  const segment = local.split(/[._+-]/)[0];
  if (!segment || segment.length > 48) return null;
  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  if (!profile) return null;

  const devices = await prisma.device.findMany({
    where: { profileId: profile.id, isActive: true },
    include: {
      measurements: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  const latestMeasurements = devices.flatMap((d) =>
    d.measurements.map((m) =>
      mapMeasurementToClient({ ...m, deviceName: d.name })
    )
  );

  const recentMeasurementsRaw = await prisma.measurement.findMany({
    where: { deviceId: { in: devices.map((d) => d.id) } },
    orderBy: { timestamp: "desc" },
    take: 750,
    include: { device: true },
  });
  const recentMeasurements = recentMeasurementsRaw.map(mapMeasurementToClient);

  const thresholdsByDeviceId = await fetchPoolThresholdBoundsByDeviceIds(
    devices.map((d) => d.id),
  );

  const welcomeName = greetingName(profile.email);

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
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-medium text-fg">Pool status</h2>
        <p className="mt-0.5 max-w-3xl text-sm text-muted">
          Latest readings compared to your device limits.
        </p>
        <div className="mt-3">
          <PoolStatusCards
            measurements={latestMeasurements}
            thresholdsByDeviceId={thresholdsByDeviceId}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-medium text-fg">Recent history</h2>
        <p className="mt-0.5 max-w-3xl text-sm text-muted">
          Up to 750 samples — pick metric, range, and device below.
        </p>
        <div className="mt-3">
          <MeasurementChart measurements={recentMeasurements} variant="compact" />
        </div>
      </div>
    </div>
  );
}

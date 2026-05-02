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
            measurements={latestMeasurements}
            thresholdsByDeviceId={thresholdsByDeviceId}
          />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
          aria-hidden
        />
        <h2 className="relative text-lg font-semibold tracking-tight text-fg">
          Recent history
        </h2>
        <div className="relative mt-3">
          <MeasurementChart measurements={recentMeasurements} variant="compact" />
        </div>
      </section>
    </div>
  );
}

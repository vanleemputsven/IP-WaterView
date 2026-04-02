import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { prisma } from "@/lib/db/prisma";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import { PoolStatusCards } from "@/components/dashboard/pool-status-cards";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";

export const dynamic = "force-dynamic";

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
    take: 100,
    include: { device: true },
  });
  const recentMeasurements = recentMeasurementsRaw.map(mapMeasurementToClient);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Pool status</h1>
        <p className="mt-1 text-sm text-muted">
          Current measurements from your pool monitor
        </p>
      </div>

      <PoolStatusCards measurements={latestMeasurements} />

      <div>
        <h2 className="text-lg font-semibold text-fg">Recent history</h2>
        <MeasurementChart measurements={recentMeasurements} />
      </div>
    </div>
  );
}

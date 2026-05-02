import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { prisma } from "@/lib/db/prisma";
import { mapMeasurementToClient } from "@/lib/mappers/measurement-client";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  if (!profile) return null;

  const devices = await prisma.device.findMany({
    where: { profileId: profile.id, isActive: true },
  });

  const measurementsRaw = await prisma.measurement.findMany({
    where: { deviceId: { in: devices.map((d) => d.id) } },
    orderBy: { timestamp: "desc" },
    take: 2500,
    include: { device: true },
  });
  const measurements = measurementsRaw.map(mapMeasurementToClient);

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
          Up to 2 500 samples — metric, range, device, and brush zoom below.
        </p>
        <div className="mt-3">
          <MeasurementChart measurements={measurements} variant="expanded" />
        </div>
      </div>
    </div>
  );
}

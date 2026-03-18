import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { prisma } from "@/lib/db/prisma";
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

  const measurements = await prisma.measurement.findMany({
    where: { deviceId: { in: devices.map((d) => d.id) } },
    orderBy: { timestamp: "desc" },
    take: 500,
    include: { device: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Measurement history</h1>
        <p className="mt-1 text-sm text-muted">
          Historical pool measurements over time
        </p>
      </div>

      <MeasurementChart measurements={measurements} />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  deviceId: z.string().cuid(),
});

/** Legacy dashboard URL — pool dosing is configured under Admin → Devices → Pool dosing. */
export default async function LegacyDashboardDeviceSettingsRedirect({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const raw = await params;
  const parsed = paramsSchema.safeParse(raw);
  if (!parsed.success) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/dashboard/settings");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    redirect("/dashboard/settings");
  }

  redirect(`/admin/devices/${parsed.data.deviceId}/pool-settings`);
}

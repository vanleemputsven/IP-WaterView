import { redirect } from "next/navigation";

/** Legacy URL — pool dosing lives under Admin → Devices → Pool dosing (`/admin/devices/[deviceId]/pool-settings`). */
export default function LegacyDashboardPoolSettingsPage() {
  redirect("/dashboard/settings");
}

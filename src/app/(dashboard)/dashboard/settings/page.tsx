import { SlidersHorizontal } from "lucide-react";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileByUserId(user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Account preferences and more. Coming soon.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Account
        </h2>
        <div className="relative mt-3 overflow-hidden rounded-2xl border border-dashed border-border-subtle bg-surface-alt/20 px-4 py-5 sm:px-5">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted [&>svg]:h-5 [&>svg]:w-5">
              <SlidersHorizontal aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-fg-secondary">Preferences</p>
              <p className="mt-0.5 text-sm text-muted">
                Notifications, units, and display. Coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

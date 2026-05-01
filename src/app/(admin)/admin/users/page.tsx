import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { formatDateTimeForDisplay } from "@/lib/format/datetime";
import { ProfileRoleToggle } from "@/components/admin/profile-role-toggle";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionProfile =
    user != null ? await getProfileByUserId(user.id) : null;

  const [profiles, adminCount] = await Promise.all([
    prisma.profile.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { devices: true } },
      },
    }),
    prisma.profile.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Team</h1>
        <p className="mt-1 text-sm text-muted">
          Accounts synced from sign-up. Admins can access this console; users
          use the pool dashboard only.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Devices
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {profiles.map((p) => {
              const isSelf = sessionProfile?.id === p.id;
              const demoteToUserDisabled =
                p.role === "ADMIN" && adminCount <= 1;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-fg">{p.email}</span>
                    {isSelf ? (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-fg-secondary">
                    {p._count.devices}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                    {formatDateTimeForDisplay(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <ProfileRoleToggle
                      profileId={p.id}
                      role={p.role}
                      demoteToUserDisabled={demoteToUserDisabled}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {profiles.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No profiles yet. Sign up to create the first account.
          </div>
        )}
      </div>
    </div>
  );
}

import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type ChangeProfileRoleError = "profile_not_found" | "last_admin";

export async function changeProfileRole(params: {
  profileId: string;
  nextRole: Role;
}): Promise<
  | { ok: true; profile: { id: string; role: Role } }
  | { ok: false; error: ChangeProfileRoleError }
> {
  const target = await prisma.profile.findUnique({
    where: { id: params.profileId },
    select: { id: true, role: true },
  });

  if (!target) {
    return { ok: false, error: "profile_not_found" };
  }

  if (target.role === params.nextRole) {
    return { ok: true, profile: { id: target.id, role: target.role } };
  }

  if (target.role === "ADMIN" && params.nextRole === "USER") {
    const adminCount = await prisma.profile.count({
      where: { role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return { ok: false, error: "last_admin" };
    }
  }

  const updated = await prisma.profile.update({
    where: { id: params.profileId },
    data: { role: params.nextRole },
    select: { id: true, role: true },
  });

  return { ok: true, profile: updated };
}

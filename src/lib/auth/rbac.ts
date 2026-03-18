import type { Role } from "@prisma/client";

export const ROLES = {
  USER: "USER" as const,
  ADMIN: "ADMIN" as const,
} satisfies Record<string, Role>;

export function isAdmin(role: Role | string | null | undefined): boolean {
  return role === ROLES.ADMIN;
}

export function canAccessAdmin(role: Role | string | null | undefined): boolean {
  return isAdmin(role);
}

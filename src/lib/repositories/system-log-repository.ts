import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listDistinctSystemLogResources(): Promise<string[]> {
  const rows = await prisma.systemLog.findMany({
    distinct: ["resource"],
    where: { resource: { not: null } },
    select: { resource: true },
    orderBy: { resource: "asc" },
  });
  return rows.map((r) => r.resource).filter((r): r is string => r !== null);
}

export async function listDistinctSystemLogActions(): Promise<string[]> {
  const rows = await prisma.systemLog.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });
  return rows.map((r) => r.action);
}

export type SystemLogListFilters = {
  actorType?: "user" | "device" | "system";
  resource?: string;
  action?: string;
};

export function buildSystemLogWhere(
  filters: SystemLogListFilters,
): Prisma.SystemLogWhereInput {
  const where: Prisma.SystemLogWhereInput = {};
  if (filters.actorType) where.actorType = filters.actorType;
  if (filters.resource) where.resource = filters.resource;
  if (filters.action) where.action = filters.action;
  return where;
}

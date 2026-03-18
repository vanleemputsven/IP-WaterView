import { prisma } from "@/lib/db/prisma";

type ActorType = "user" | "device" | "system";

export async function createLog(params: {
  actorType: ActorType;
  actorId?: string | null;
  action: string;
  resource?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return prisma.systemLog.create({
    data: {
      actorType: params.actorType,
      actorId: params.actorId ?? null,
      action: params.action,
      resource: params.resource ?? null,
      metadata: params.metadata ?? undefined,
    },
  });
}

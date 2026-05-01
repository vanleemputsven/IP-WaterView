import { prisma } from "@/lib/db/prisma";

export type LogActorSlice = {
  actorType: string;
  actorId: string | null;
};

export function collectDeviceActorIdsFromLogs(
  logs: readonly LogActorSlice[],
): string[] {
  const ids = new Set<string>();
  for (const log of logs) {
    if (log.actorType === "device" && log.actorId) ids.add(log.actorId);
  }
  return [...ids];
}

export async function fetchDeviceNameMap(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const devices = await prisma.device.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  return new Map(devices.map((d) => [d.id, d.name]));
}

/**
 * Actor label for admin logs: device rows prefer the registered device display name;
 * `title` keeps the full id for hover/support when useful.
 */
export function formatSystemLogActor(
  log: LogActorSlice,
  deviceNames: ReadonlyMap<string, string>,
): { text: string; title?: string } {
  const { actorType, actorId } = log;

  if (actorType === "device" && actorId) {
    const name = deviceNames.get(actorId);
    if (name) {
      return {
        text: `device · ${name}`,
        title: actorId,
      };
    }
    return {
      text: `device:${actorId.slice(0, 8)}`,
      title: actorId,
    };
  }

  if (!actorId) {
    return { text: actorType };
  }

  return {
    text: `${actorType}:${actorId.slice(0, 8)}`,
    title: actorId,
  };
}

import { prisma } from "@/lib/db/prisma";

export type LogActorSlice = {
  actorType: string;
  actorId: string | null;
};

/** Maps loaded for log rows: device id → display name, profile id → email. */
export type SystemLogActorNameMaps = {
  devices: ReadonlyMap<string, string>;
  profiles: ReadonlyMap<string, string>;
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

export function collectUserActorIdsFromLogs(
  logs: readonly LogActorSlice[],
): string[] {
  const ids = new Set<string>();
  for (const log of logs) {
    if (log.actorType === "user" && log.actorId) ids.add(log.actorId);
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

export async function fetchProfileEmailMap(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const profiles = await prisma.profile.findMany({
    where: { id: { in: ids } },
    select: { id: true, email: true },
  });
  return new Map(profiles.map((p) => [p.id, p.email]));
}

export async function fetchActorNameMapsForLogs(
  logs: readonly LogActorSlice[],
): Promise<SystemLogActorNameMaps> {
  const deviceIds = collectDeviceActorIdsFromLogs(logs);
  const profileIds = collectUserActorIdsFromLogs(logs);
  const [devices, profiles] = await Promise.all([
    fetchDeviceNameMap(deviceIds),
    fetchProfileEmailMap(profileIds),
  ]);
  return { devices, profiles };
}

/**
 * Actor label for admin logs: device rows use the registered device name;
 * user rows use the profile email. Fallback keeps a short id prefix; `title`
 * keeps the full id for hover/support.
 */
export function formatSystemLogActor(
  log: LogActorSlice,
  maps: SystemLogActorNameMaps,
): { text: string; title?: string } {
  const { actorType, actorId } = log;

  if (actorType === "device" && actorId) {
    const name = maps.devices.get(actorId);
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

  if (actorType === "user" && actorId) {
    const email = maps.profiles.get(actorId);
    if (email) {
      return {
        text: `user · ${email}`,
        title: actorId,
      };
    }
    return {
      text: `user:${actorId.slice(0, 8)}`,
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

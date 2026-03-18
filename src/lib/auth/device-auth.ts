import { prisma } from "@/lib/db/prisma";
import { createHash } from "crypto";

const API_KEY_HEADER = "x-device-token";
const BEARER_PREFIX = "Bearer ";

function hashApiKey(plainKey: string): string {
  return createHash("sha256").update(plainKey, "utf8").digest("hex");
}

function getApiKeyFromRequest(request: Request): string | null {
  const header =
    request.headers.get(API_KEY_HEADER) ??
    (request.headers.get("authorization")?.startsWith(BEARER_PREFIX)
      ? request.headers.get("authorization")!.slice(BEARER_PREFIX.length).trim()
      : null);
  return header;
}

export async function resolveDeviceFromRequest(request: Request): Promise<{
  deviceId: string;
  deviceName: string;
} | null> {
  const header = getApiKeyFromRequest(request);
  if (!header) return null;

  const keyHash = hashApiKey(header);

  const device = await prisma.device.findFirst({
    where: { apiKeyHash: keyHash, isActive: true },
    select: { id: true, name: true },
  });

  if (!device) return null;

  return { deviceId: device.id, deviceName: device.name };
}

export function hashApiKeyForStorage(plainKey: string): string {
  return hashApiKey(plainKey);
}

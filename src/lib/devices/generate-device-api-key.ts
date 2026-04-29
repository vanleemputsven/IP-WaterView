import { randomBytes } from "crypto";

/** Opaque device token; only ever returned once over HTTPS after create or rotate. */
export function generateDeviceApiKey(): string {
  return `wv_${randomBytes(24).toString("hex")}`;
}

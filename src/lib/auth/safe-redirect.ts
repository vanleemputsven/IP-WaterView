import { z } from "zod";

/**
 * Post-auth path only: same-origin relative URL path (no scheme, no //).
 * Used for OAuth callback `next` and email sign-in redirects.
 */
const internalPathSchema = z
  .string()
  .min(1)
  .refine((s) => s.startsWith("/"), "must be relative")
  .refine((s) => !s.startsWith("//"), "no protocol-relative URL")
  .refine((s) => !s.includes("\\"), "no backslash")
  .refine((s) => !s.includes("://"), "no embedded scheme");

export function sanitizeInternalPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (raw == null || raw === "") return fallback;
  const parsed = internalPathSchema.safeParse(raw);
  return parsed.success ? parsed.data : fallback;
}

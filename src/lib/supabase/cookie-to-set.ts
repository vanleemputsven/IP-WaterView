/**
 * Payload passed to Supabase SSR `cookies.setAll` — aligned with Next.js cookie `set` options.
 */
export type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "strict" | "lax" | "none" | boolean;
    secure?: boolean;
    partitioned?: boolean;
    priority?: "low" | "medium" | "high";
  };
};

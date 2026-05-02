import { z } from "zod";

const actorSchema = z.enum(["user", "device", "system"]);

/**
 * Resolves validated admin log list filters from raw URL search params.
 * Resource and action must appear in the allowlists supplied from the database.
 */
export function resolveAdminLogsFilters(
  raw: Record<string, string | string[] | undefined>,
  allowedResources: ReadonlySet<string>,
  allowedActions: ReadonlySet<string>,
): {
  actor?: "user" | "device" | "system";
  resource?: string;
  action?: string;
} {
  const pick = (key: string): string | undefined =>
    typeof raw[key] === "string" ? raw[key] : undefined;

  const actorRaw = pick("actor");
  let actor: "user" | "device" | "system" | undefined;
  if (actorRaw !== undefined && actorRaw !== "") {
    const parsed = actorSchema.safeParse(actorRaw);
    actor = parsed.success ? parsed.data : undefined;
  }

  const resourceRaw = pick("resource")?.trim() ?? "";
  const resourceSchema = z.string().max(128);
  const resourceChecked = resourceRaw === "" ? undefined : resourceSchema.safeParse(resourceRaw);
  const resourceCandidate =
    resourceChecked?.success === true ? resourceChecked.data : undefined;
  const resource =
    resourceCandidate !== undefined && allowedResources.has(resourceCandidate)
      ? resourceCandidate
      : undefined;

  const actionRaw = pick("action")?.trim() ?? "";
  const actionSchema = z.string().max(256);
  const actionChecked = actionRaw === "" ? undefined : actionSchema.safeParse(actionRaw);
  const actionCandidate =
    actionChecked?.success === true ? actionChecked.data : undefined;
  const action =
    actionCandidate !== undefined && allowedActions.has(actionCandidate)
      ? actionCandidate
      : undefined;

  return { actor, resource, action };
}

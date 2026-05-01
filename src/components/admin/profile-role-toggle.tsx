"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

type Props = {
  profileId: string;
  role: Role;
  /** When true and role is ADMIN, switching to User is blocked (last admin). */
  demoteToUserDisabled: boolean;
};

export function ProfileRoleToggle({
  profileId,
  role,
  demoteToUserDisabled,
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(role);
  }, [role]);

  async function setRole(next: Role) {
    if (next === current || loading) return;
    if (next === "USER" && demoteToUserDisabled && current === "ADMIN") {
      setError("At least one administrator must remain.");
      return;
    }

    setError(null);
    const prev = current;
    setCurrent(next);
    setLoading(true);
    const res = await fetch(
      `/api/admin/profiles/${encodeURIComponent(profileId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      }
    );
    setLoading(false);

    if (!res.ok) {
      setCurrent(prev);
      let message = "Could not update role.";
      try {
        const body = (await res.json()) as { error?: string };
        if (typeof body.error === "string" && body.error.length > 0) {
          message = body.error;
        }
      } catch {
        /* keep default */
      }
      setError(message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="inline-flex rounded-lg border border-border-subtle bg-surface-alt/50 p-0.5 text-xs font-medium"
        role="group"
        aria-label="Account role"
      >
        <button
          type="button"
          disabled={loading || (demoteToUserDisabled && current === "ADMIN")}
          onClick={() => void setRole("USER")}
          title={
            demoteToUserDisabled && current === "ADMIN"
              ? "Promote another admin before demoting this user."
              : undefined
          }
          className={`rounded-md px-2.5 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
            current === "USER"
              ? "bg-surface text-fg shadow-sm ring-1 ring-border-subtle"
              : "text-muted hover:text-fg-secondary"
          }`}
        >
          User
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void setRole("ADMIN")}
          className={`rounded-md px-2.5 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
            current === "ADMIN"
              ? "bg-accent/15 text-accent"
              : "text-muted hover:text-fg-secondary"
          }`}
        >
          Admin
        </button>
      </div>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

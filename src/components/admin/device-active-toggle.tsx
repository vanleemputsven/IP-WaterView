"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { deviceId: string; isActive: boolean };

export function DeviceActiveToggle({ deviceId, isActive }: Props) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActive(isActive);
  }, [isActive]);

  async function setStatus(next: boolean) {
    if (next === active || loading) return;
    const prev = active;
    setActive(next);
    setLoading(true);
    const res = await fetch(
      `/api/admin/devices/${encodeURIComponent(deviceId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      }
    );
    setLoading(false);
    if (!res.ok) {
      setActive(prev);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className="inline-flex rounded-lg border border-border-subtle bg-surface-alt/50 p-0.5 text-xs font-medium"
      role="group"
      aria-label="Device enabled state"
    >
      <button
        type="button"
        disabled={loading}
        onClick={() => void setStatus(true)}
        className={`rounded-md px-2.5 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
          active
            ? "bg-success/20 text-success"
            : "text-muted hover:text-fg-secondary"
        }`}
      >
        On
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => void setStatus(false)}
        className={`rounded-md px-2.5 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50 ${
          !active
            ? "bg-danger/10 text-danger"
            : "text-muted hover:text-fg-secondary"
        }`}
      >
        Off
      </button>
    </div>
  );
}

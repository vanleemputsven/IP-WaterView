"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  deviceId: string;
  deviceName: string;
};

export function DeleteDeviceButton({ deviceId, deviceName }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleConfirmRemove() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/devices/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (res.status === 204) {
      setDialogOpen(false);
      router.refresh();
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "Could not remove device");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setDialogOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-lg border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
      >
        Remove
      </button>
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) setError(null);
        }}
        eyebrow="Devices"
        title="Remove this device?"
        description={
          <div className="min-w-0 space-y-3 break-words [overflow-wrap:anywhere]">
            <p className="text-fg">
              <span className="font-medium">{deviceName}</span>
              <span className="text-fg-secondary">
                {" "}
                will be disconnected from the cloud.
              </span>
            </p>
            <p className="text-fg-secondary">
              Its API key will stop working immediately. All measurements for
              this device will be permanently deleted.
            </p>
            <p className="font-medium text-danger">This cannot be undone.</p>
          </div>
        }
        cancelLabel="Keep device"
        confirmLabel={loading ? "Removing…" : "Remove device"}
        destructive
        confirming={loading}
        errorMessage={error}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}

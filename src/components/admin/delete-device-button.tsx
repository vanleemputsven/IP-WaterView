"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Props = {
  deviceId: string;
  deviceName: string;
  toolbarSegment?: boolean;
};

const toolbarTriggerClass =
  "flex min-h-9 w-full items-center justify-start gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger/30 disabled:pointer-events-none disabled:opacity-50 xl:h-9 xl:w-9 xl:min-w-9 xl:max-w-9 xl:justify-center xl:gap-0 xl:p-0";

export function DeleteDeviceButton({
  deviceId,
  deviceName,
  toolbarSegment = false,
}: Props) {
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
        aria-label={toolbarSegment ? `Remove ${deviceName}` : undefined}
        title={toolbarSegment ? "Remove device" : undefined}
        className={
          toolbarSegment
            ? toolbarTriggerClass
            : "inline-flex items-center justify-center rounded-lg border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
        }
      >
        <Trash2
          className={`h-3.5 w-3.5 shrink-0 opacity-90 ${toolbarSegment ? "xl:h-4 xl:w-4" : ""}`}
          aria-hidden
        />
        {toolbarSegment ? (
          <span className="xl:hidden" aria-hidden>
            Remove
          </span>
        ) : (
          "Remove"
        )}
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

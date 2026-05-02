"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  deviceId: string;
  deviceName: string;
  /** Compact trigger aligned with other row actions (toolbar segment). */
  toolbarSegment?: boolean;
};

/** Stacked below `xl`; horizontal row uses icon-only cells to save width. */
const toolbarTriggerClass =
  "flex min-h-9 w-full items-center justify-start gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35 disabled:pointer-events-none disabled:opacity-50 xl:h-9 xl:w-9 xl:min-w-9 xl:max-w-9 xl:justify-center xl:gap-0 xl:p-0";

export function RenameDeviceButton({
  deviceId,
  deviceName,
  toolbarSegment = false,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(deviceName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    setPortalEl(document.body);
  }, []);

  useLayoutEffect(() => {
    if (open) setName(deviceName);
  }, [open, deviceName]);

  const close = useCallback(() => {
    if (loading) return;
    setOpen(false);
    setError(null);
  }, [loading]);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const lockScroll = () => {
      const doc = document.documentElement;
      const gap = Math.max(0, window.innerWidth - doc.clientWidth);
      doc.style.overflow = "hidden";
      doc.style.paddingRight = gap > 0 ? `${gap}px` : "";
    };

    const unlockScroll = () => {
      const doc = document.documentElement;
      doc.style.overflow = "";
      doc.style.paddingRight = "";
    };

    if (open) {
      lockScroll();
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
      unlockScroll();
    }

    return () => {
      if (el.open) el.close();
      unlockScroll();
    };
  }, [open, portalEl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === deviceName) {
      close();
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/devices/${encodeURIComponent(deviceId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not rename device");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[80] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center overflow-x-hidden overflow-y-auto whitespace-normal border-0 bg-transparent p-4 shadow-none backdrop:bg-fg/50 backdrop:backdrop-blur-sm sm:p-6"
      onClose={close}
      onCancel={(e) => {
        if (loading) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && !loading) close();
      }}
    >
      <div
        className="flex max-h-[85dvh] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-card sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-2 border-b border-border-subtle px-4 py-3.5 sm:gap-3">
          <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
              aria-hidden
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Devices
              </p>
              <h2
                id={titleId}
                className="mt-1 text-base font-semibold leading-snug text-fg"
              >
                Rename device
              </h2>
              <p id={descId} className="mt-0.5 text-sm text-muted">
                Names must be unique per owner account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-fg disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/40"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3.5">
            <label
              htmlFor={`rename-${deviceId}`}
              className="block text-sm font-medium text-fg-secondary"
            >
              Device name
            </label>
            <input
              id={`rename-${deviceId}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="wv-input mt-1 max-w-md"
              autoComplete="off"
              disabled={loading}
            />
            {error ? (
              <div
                role="alert"
                className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                {error}
              </div>
            ) : null}
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border-subtle px-4 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={loading}
              className="wv-btn-secondary w-full disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="wv-btn-primary w-full disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Saving…" : "Save name"}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={toolbarSegment ? `Rename ${deviceName}` : undefined}
        title={toolbarSegment ? "Rename device" : undefined}
        className={
          toolbarSegment
            ? toolbarTriggerClass
            : "inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-alt"
        }
      >
        <Pencil
          className={`h-3.5 w-3.5 shrink-0 opacity-80 ${toolbarSegment ? "xl:h-4 xl:w-4" : ""}`}
          aria-hidden
        />
        {toolbarSegment ? (
          <span className="xl:hidden" aria-hidden>
            Rename
          </span>
        ) : (
          "Rename"
        )}
      </button>
      {portalEl && open ? createPortal(dialog, portalEl) : null}
    </>
  );
}

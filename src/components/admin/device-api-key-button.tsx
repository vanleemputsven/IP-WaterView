"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, Copy, KeyRound, X } from "lucide-react";

type Phase = "closed" | "confirm" | "reveal";

type Props = {
  deviceId: string;
  deviceName: string;
};

export function DeviceApiKeyButton({ deviceId, deviceName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    setPortalEl(document.body);
  }, []);

  const open = phase !== "closed";

  const close = useCallback(() => {
    if (loading) return;
    setPhase("closed");
    setError(null);
    setNewKey(null);
    setCopied(false);
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

  async function handleRotate() {
    setLoading(true);
    setError(null);

    const res = await fetch(
      `/api/admin/devices/${encodeURIComponent(deviceId)}/api-key`,
      { method: "POST" }
    );

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      apiKey?: string;
    };

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not create a new key");
      return;
    }

    if (!data.apiKey) {
      setError("Invalid response from server");
      return;
    }

    setError(null);
    setNewKey(data.apiKey);
    setPhase("reveal");
  }

  async function copyKey() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the key manually");
    }
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      role="alertdialog"
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
        {phase === "confirm" ? (
          <>
            <header className="flex shrink-0 items-start gap-2 border-b border-border-subtle px-4 py-3.5 sm:gap-3">
              <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
                  aria-hidden
                >
                  <KeyRound className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Devices
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1 text-base font-semibold leading-snug text-fg break-words [overflow-wrap:anywhere]"
                  >
                    New API key for this device?
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    The previous key stops working immediately — only do this if
                    you can update the device firmware or config right away.
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

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3.5">
              <div
                className="w-full min-w-0 overflow-hidden rounded-xl border border-danger/30 bg-danger/5 p-3 sm:p-4"
                id={descId}
              >
                <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger sm:mt-0.5"
                    aria-hidden
                  >
                    <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2.5 text-sm leading-relaxed break-words [overflow-wrap:anywhere]">
                    <p className="text-fg">
                      <span className="font-medium">{deviceName}</span>
                      <span className="text-fg-secondary">
                        {" "}
                        will only accept the new secret after you confirm.
                      </span>
                    </p>
                    <p className="text-fg-secondary">
                      Stored keys are one-way hashes — the old secret cannot be
                      retrieved, so we always issue a fresh key.
                    </p>
                  </div>
                </div>
              </div>
              {error ? (
                <div
                  role="alert"
                  className="mt-3 min-w-0 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger break-words [overflow-wrap:anywhere]"
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
                type="button"
                onClick={handleRotate}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Generating…" : "Generate new key"}
              </button>
            </footer>
          </>
        ) : null}

        {phase === "reveal" && newKey ? (
          <>
            <header className="flex shrink-0 items-start gap-2 border-b border-border-subtle px-4 py-3.5 sm:gap-3">
              <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
                  aria-hidden
                >
                  <KeyRound className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Devices
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1 text-base font-semibold leading-snug text-fg"
                  >
                    Save this API key
                  </h2>
                  <p id={descId} className="mt-0.5 text-sm text-muted">
                    Copy it now — it will not be shown again.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/40"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5">
              <div className="rounded-xl border border-success/30 bg-success/5 p-3 sm:p-4">
                <p className="text-sm font-medium text-success">{deviceName}</p>
                <pre className="mt-2 max-h-40 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-code-bg px-3 py-2.5 font-mono text-sm text-inverse-fg">
                  {newKey}
                </pre>
                <p className="mt-1.5 text-xs text-muted">
                  Header:{" "}
                  <span className="font-mono text-fg-secondary">X-Device-Token</span>
                </p>
              </div>
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
                onClick={copyKey}
                className="wv-btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-success" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy key
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={close}
                className="wv-btn-primary w-full sm:w-auto"
              >
                Done
              </button>
            </footer>
          </>
        ) : null}
      </div>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setNewKey(null);
          setCopied(false);
          setPhase("confirm");
        }}
        className="inline-flex items-center justify-center rounded-lg border border-accent/35 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
      >
        New API key
      </button>
      {portalEl && open ? createPortal(dialog, portalEl) : null}
    </>
  );
}

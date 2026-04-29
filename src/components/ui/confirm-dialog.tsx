"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  eyebrow?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  confirming?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * Full-viewport `<dialog>` + inner panel avoids UA `dialog` width/max-width quirks and
 * broken `min(100vw-1.5rem, …)` math (CSS requires spaces around `-`).
 * Panel matches admin cards: rounded-xl, border, shadow-card.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  confirming = false,
  errorMessage,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalEl(document.body);
  }, []);

  const close = useCallback(() => {
    if (confirming) return;
    onOpenChange(false);
  }, [confirming, onOpenChange]);

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

  /* `white-space` inherits: table cells use `whitespace-nowrap` on the devices page, so the
   * dialog must reset it or wrapped text stays on one line and clips. Portal to `body` so the
   * modal tree is not under `<table>` / `<td>` (layout + inheritance quirks). */
  const dialog = (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[80] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center overflow-x-hidden overflow-y-auto whitespace-normal border-0 bg-transparent p-4 shadow-none backdrop:bg-fg/50 backdrop:backdrop-blur-sm sm:p-6"
      onClose={() => onOpenChange(false)}
      onCancel={(e) => {
        if (confirming) e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current && !confirming) close();
      }}
    >
      <div
        className="flex max-h-[85dvh] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-card sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start gap-2 border-b border-border-subtle px-4 py-3.5 sm:gap-3">
          {destructive ? (
            <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger"
                aria-hidden
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                {eyebrow ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {eyebrow}
                  </p>
                ) : null}
                <h2
                  id={titleId}
                  className={`text-base font-semibold leading-snug text-fg break-words [overflow-wrap:anywhere] ${eyebrow ? "mt-1" : ""}`}
                >
                  {title}
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  Nothing is deleted until you confirm.
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {eyebrow}
                </p>
              ) : null}
              <h2
                id={titleId}
                className={`text-base font-semibold leading-snug text-fg break-words [overflow-wrap:anywhere] ${eyebrow ? "mt-1" : ""}`}
              >
                {title}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                Press Esc or close when you are finished.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={close}
            disabled={confirming}
            className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-alt hover:text-fg disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/40"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-3.5">
          {destructive ? (
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
                <div className="min-w-0 flex-1 text-sm leading-relaxed break-words [overflow-wrap:anywhere]">
                  {description}
                </div>
              </div>
            </div>
          ) : (
            <div
              id={descId}
              className="min-w-0 text-sm leading-relaxed text-fg-secondary break-words [overflow-wrap:anywhere]"
            >
              {description}
            </div>
          )}

          {errorMessage ? (
            <div
              role="alert"
              className="mt-3 min-w-0 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger break-words [overflow-wrap:anywhere]"
            >
              {errorMessage}
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border-subtle px-4 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            disabled={confirming}
            className="wv-btn-secondary w-full disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 sm:w-auto ${
              destructive
                ? "bg-danger text-white hover:bg-danger/95"
                : "wv-btn-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </dialog>
  );

  if (!portalEl) return null;
  return createPortal(dialog, portalEl);
}

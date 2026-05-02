"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  deviceName: string;
  apiKey: string;
  /** Extra row(s), e.g. wizard navigation links */
  children?: React.ReactNode;
  className?: string;
  /** For dialog accessibility: associate heading with `aria-labelledby` */
  headingId?: string;
  /** For dialog accessibility: associate description with `aria-describedby` */
  descriptionId?: string;
  /** Override default screen-reader summary (e.g. after key rotation) */
  ariaLabel?: string;
  /** No card chrome (e.g. inside a dialog that already has a frame) */
  omitOuterShell?: boolean;
  /** Hide device title line */
  omitHeading?: boolean;
  /** Hide “Shown once · header …” line */
  omitSubtitle?: boolean;
};

export function DeviceCreatedApiKeyPanel({
  deviceName,
  apiKey,
  children,
  className = "",
  headingId,
  descriptionId,
  ariaLabel,
  omitOuterShell = false,
  omitHeading = false,
  omitSubtitle = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore — user can select manually */
    }
  }, [apiKey]);

  const defaultAria = `${deviceName} registered. API secret shown once; use HTTP header X-Device-Token.`;

  const shellClass = omitOuterShell
    ? "border-0 bg-transparent p-0 shadow-none ring-0"
    : "rounded-xl border border-border-subtle bg-surface p-5 shadow-card ring-1 ring-success/20 sm:p-6";

  const keyBlockMargin = omitHeading && omitSubtitle ? "mt-0" : "mt-4";

  const childrenWrapClass = omitOuterShell
    ? "mt-4 flex flex-wrap gap-3 border-t border-border-subtle pt-4"
    : "mt-6 flex flex-wrap gap-3 border-t border-border-subtle pt-5";

  return (
    <section
      className={`${shellClass} ${className}`.trim()}
      aria-label={ariaLabel ?? defaultAria}
    >
      {!omitHeading ? (
        <h3
          id={headingId}
          className="text-lg font-semibold tracking-tight text-fg"
        >
          {deviceName}
        </h3>
      ) : null}
      {!omitSubtitle ? (
        <p
          id={descriptionId}
          className={`text-sm text-muted ${omitHeading ? "" : "mt-1"}`}
        >
          Shown once · header{" "}
          <code className="rounded bg-surface-alt px-1 py-0.5 font-mono text-xs text-fg-secondary">
            X-Device-Token
          </code>
        </p>
      ) : null}

      <div
        className={`${keyBlockMargin} flex min-h-[3rem] min-w-0 items-stretch overflow-hidden rounded-lg border border-border-subtle bg-surface`}
      >
        <pre className="min-w-0 flex-1 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all px-3 py-2.5 font-mono text-sm leading-relaxed text-fg [overflow-wrap:anywhere]">
          {apiKey}
        </pre>
        <button
          type="button"
          onClick={() => void copy()}
          className={`flex shrink-0 items-center gap-1.5 rounded-r-lg border-l border-border-subtle px-3 text-xs font-medium text-on-accent transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-on-accent/40 ${
            copied
              ? "bg-accent-deep hover:bg-accent-deep"
              : "bg-accent hover:bg-accent-deep"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-200" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 opacity-90" aria-hidden />
              Copy
            </>
          )}
        </button>
      </div>

      {children ? <div className={childrenWrapClass}>{children}</div> : null}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  formatThresholdLabel,
  formatThresholdUnitSuffix,
} from "@/lib/format/threshold-label";

const AUTOSAVE_MS = 650;
const SAVED_VISIBLE_MS = 2000;

export type ThresholdFieldProps = {
  id: string;
  thresholdKey: string;
  unit: string | null;
  /** Serialized decimal from the server */
  initialValueStr: string;
  /** PATCH target, e.g. `/api/admin/thresholds` or `/api/admin/device-thresholds` */
  apiCollectionPath: string;
};

function parseDraft(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (
    t === "" ||
    t === "-" ||
    t === "." ||
    t === "-." ||
    /^-?\d+\.$/.test(t)
  ) {
    return null;
  }
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function valuesClose(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-8;
}

/** Compact table row — matches admin logs/devices tables. */
export function ThresholdAutosaveRow({
  id,
  thresholdKey,
  unit,
  initialValueStr,
  apiCollectionPath,
}: ThresholdFieldProps) {
  const labelId = useId();
  const statusId = useId();

  const initialNum = Number(initialValueStr);
  const safeInitial = Number.isFinite(initialNum) ? initialNum : 0;

  const [draft, setDraft] = useState(initialValueStr.trim());
  const [committed, setCommitted] = useState(safeInitial);
  const committedRef = useRef(safeInitial);
  committedRef.current = committed;

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const persistGenRef = useRef(0);
  const savedHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSavedTimer = useCallback(() => {
    if (savedHideTimerRef.current !== null) {
      clearTimeout(savedHideTimerRef.current);
      savedHideTimerRef.current = null;
    }
  }, []);

  const persist = useCallback(
    async (n: number) => {
      if (valuesClose(n, committedRef.current)) {
        return;
      }

      const gen = ++persistGenRef.current;
      setStatus("saving");
      setError(null);
      clearSavedTimer();

      const res = await fetch(
        `${apiCollectionPath}/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: n }),
        },
      );

      if (gen !== persistGenRef.current) {
        return;
      }

      let message = "Could not save.";
      try {
        const body = (await res.json()) as { error?: string };
        if (typeof body.error === "string" && body.error.length > 0) {
          message = body.error;
        }
      } catch {
        /* keep default */
      }

      if (!res.ok) {
        setStatus("error");
        setError(message);
        return;
      }

      setCommitted(n);
      committedRef.current = n;
      setDraft(String(n));
      setStatus("saved");
      setError(null);

      savedHideTimerRef.current = setTimeout(() => {
        setStatus((s) => (s === "saved" ? "idle" : s));
        savedHideTimerRef.current = null;
      }, SAVED_VISIBLE_MS);
    },
    [apiCollectionPath, id, clearSavedTimer],
  );

  useEffect(() => {
    return () => {
      clearSavedTimer();
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [clearSavedTimer]);

  useEffect(() => {
    const parsed = parseDraft(draft);
    if (parsed === null) {
      return;
    }
    if (valuesClose(parsed, committedRef.current)) {
      return;
    }

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void persist(parsed);
    }, AUTOSAVE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [draft, persist]);

  function handleBlur() {
    const parsed = parseDraft(draft);
    if (parsed === null) {
      setDraft(String(committedRef.current));
      setStatus("idle");
      setError(null);
      return;
    }
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void persist(parsed);
  }

  const unitSuffix = formatThresholdUnitSuffix(unit);
  const statusText =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : status === "error" && error
          ? error
          : null;

  const inputId = `threshold-${id}`;

  return (
    <tr>
      <td className="px-4 py-2 align-middle">
        <label
          id={labelId}
          htmlFor={inputId}
          className="text-sm font-medium text-fg-secondary"
        >
          {formatThresholdLabel(thresholdKey)}
        </label>
      </td>
      <td className="px-4 py-2 align-middle">
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-labelledby={labelId}
            aria-describedby={statusText ? statusId : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            disabled={status === "saving"}
            className="block h-9 w-[7.25rem] rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm text-fg tabular-nums transition-colors placeholder:text-muted/60 disabled:opacity-60"
          />
          {unitSuffix ? (
            <span className="text-xs text-muted tabular-nums">{unitSuffix}</span>
          ) : null}
        </div>
      </td>
      <td className="max-w-[min(14rem,40vw)] px-4 py-2 align-middle text-right">
        <span
          id={statusId}
          className={`inline-block text-xs ${
            status === "error"
              ? "text-danger"
              : status === "saved"
                ? "text-success"
                : "text-muted"
          }`}
          role={status === "error" ? "alert" : undefined}
          aria-live="polite"
          title={status === "error" && error ? error : undefined}
        >
          {statusText ?? "—"}
        </span>
      </td>
    </tr>
  );
}

"use client";

import { Sparkles } from "lucide-react";

type Props = {
  deviceId: string;
  deviceName: string;
};

/**
 * Placeholder for future automated dosing — API / hardware dispatch will attach here.
 */
export function AutoFixDoseButton({ deviceId, deviceName }: Props) {
  void deviceId;

  return (
    <button
      type="button"
      disabled
      title="Automated dosing — coming soon"
      aria-label={`AutoFix dosing for ${deviceName} — coming soon`}
      className="inline-flex h-9 min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent shadow-[0_1px_8px_rgb(13_148_136/0.38)] ring-2 ring-accent-bright/60 ring-offset-1 ring-offset-surface transition-[transform,box-shadow] enabled:hover:bg-accent-deep motion-safe:enabled:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-[0.72]"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-95" aria-hidden />
      AutoFix
    </button>
  );
}

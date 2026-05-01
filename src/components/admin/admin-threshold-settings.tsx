"use client";

import {
  ThresholdAutosaveRow,
  type ThresholdFieldProps,
} from "@/components/admin/threshold-autosave-field";

type Props = {
  thresholds: ThresholdFieldProps[];
};

export function AdminThresholdSettings({ thresholds }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <p className="border-b border-border-subtle bg-surface-alt/30 px-4 py-2 text-xs text-muted">
        Autosaves shortly after you pause typing or when you leave a field.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Threshold
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted">
                Value
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {thresholds.map((t) => (
              <ThresholdAutosaveRow key={t.id} {...t} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

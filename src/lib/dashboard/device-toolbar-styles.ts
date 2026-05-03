/**
 * Shared with admin devices action toolbar — keeps dosing “Edit” visually aligned with Limits / rename controls.
 */
export const deviceToolbarLinkClass =
  "flex min-h-9 w-full items-center justify-start gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35 xl:h-9 xl:w-9 xl:min-w-9 xl:max-w-9 xl:justify-center xl:gap-0 xl:p-0";

/** Outer chrome for one or more toolbar segments (matches admin devices table). */
export const deviceToolbarGroupClass =
  "flex w-full max-w-[13rem] flex-col divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-sm xl:inline-flex xl:w-auto xl:max-w-none xl:flex-row xl:divide-x xl:divide-y-0";

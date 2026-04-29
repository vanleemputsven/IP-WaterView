import { AquaSenseLogo } from "@/components/brand/aqua-sense-logo";

/** App / marketing headers — prominent but fits with the legacy line below. */
export const BRAND_LOCKUP_HEADER_LOGO_CLASS =
  "h-9 w-auto sm:h-10 md:h-11";

/** Login / signup — larger wordmark, same lockup structure. */
export const BRAND_LOCKUP_AUTH_LOGO_CLASS = "h-11 w-auto sm:h-12";

/** Footer wordmark — slightly smaller than the top bar. */
export const BRAND_LOCKUP_FOOTER_LOGO_CLASS =
  "h-8 w-auto sm:h-9 opacity-90";

type AquaSenseBrandLockupProps = {
  /** Passed through to `AquaSenseLogo`. */
  logoClassName?: string;
  /** When true, the wordmark has empty alt (parent should set `aria-label`). */
  decorative?: boolean;
  /** Headers and nav: logo with legacy line below (left-aligned). Auth: centered stack. */
  layout?: "inline" | "stacked";
  className?: string;
};

/** One line everywhere — readable on any background, no raster mark / contrast issues. */
const LEGACY_COPY = "Previously known as Waterview";

function LegacyLine({ align }: { align: "start" | "center" }) {
  return (
    <p
      className={`max-w-[16rem] text-[11px] font-normal leading-snug text-muted sm:max-w-none sm:text-xs ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {LEGACY_COPY}
    </p>
  );
}

/**
 * AquaSense wordmark plus the same legacy sentence everywhere so stakeholders
 * (e.g. proposal docs titled Waterview) immediately see continuity — typographic only.
 */
export function AquaSenseBrandLockup({
  logoClassName = BRAND_LOCKUP_HEADER_LOGO_CLASS,
  decorative = false,
  layout = "inline",
  className = "",
}: AquaSenseBrandLockupProps) {
  if (layout === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <AquaSenseLogo decorative={decorative} className={logoClassName} />
        <LegacyLine align="center" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-start gap-1 ${className}`}
    >
      <AquaSenseLogo decorative={decorative} className={logoClassName} />
      <LegacyLine align="start" />
    </div>
  );
}

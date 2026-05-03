import Link from "next/link";
import { siteFooterAttribution } from "@/lib/site/site-footer";

/** Matches sticky header chrome (`bg-surface/95 backdrop-blur`) and section top accents. */
export const siteFooterChromeClass =
  "relative border-t border-border-subtle bg-surface/95 backdrop-blur-sm";

/** Same hairline accent as dashboard hero / pool-status section cards. */
export function FooterChromeTopHairline() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
    />
  );
}

const holderLinkClass =
  "rounded-sm font-medium text-fg-secondary underline decoration-accent-bright/25 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-accent-bright focus-visible:ring-2 focus-visible:ring-accent-bright/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** Same as `holderLinkClass` but focus ring sits on `bg-canvas` (auth / marketing strips without surface chrome). */
const holderLinkOnCanvasClass =
  "rounded-sm font-medium text-fg-secondary underline decoration-accent-bright/25 underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-accent-bright focus-visible:ring-2 focus-visible:ring-accent-bright/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export function FooterAttributionHolderLink({
  className = holderLinkClass,
}: {
  className?: string;
}) {
  const { copyrightHolder, copyrightHolderUrl } = siteFooterAttribution;

  return (
    <a
      href={copyrightHolderUrl}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
    >
      {copyrightHolder}
    </a>
  );
}

const footerLegalLinkClass =
  "rounded-sm text-xs font-medium leading-snug text-muted underline decoration-transparent underline-offset-2 transition-colors hover:text-fg-secondary hover:decoration-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const footerLegalLinkOnCanvasClass =
  "rounded-sm text-xs font-medium leading-snug text-muted underline decoration-transparent underline-offset-2 transition-colors hover:text-fg-secondary hover:decoration-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

/** Privacy, cookies and terms routes — stubs until legal copy is finalized. */
export function FooterLegalNav({
  className = "",
  linkClassName = footerLegalLinkClass,
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav
      aria-label="Legal information"
      className={`flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 ${className}`.trim()}
    >
      <Link href="/privacy" className={linkClassName}>
        Privacy policy
      </Link>
      <Link href="/cookies" className={linkClassName}>
        Cookie policy
      </Link>
      <Link href="/terms" className={linkClassName}>
        Terms of use
      </Link>
    </nav>
  );
}

/** `appShell`: bordered surface bar + hairline — pairs with sticky `bg-surface` headers. `minimal`: text-only on canvas; use on auth and other headerless centered flows. */
export type SiteFooterVariant = "appShell" | "minimal";

type SiteFooterProps = {
  className?: string;
  variant?: SiteFooterVariant;
};

export function SiteFooter({
  className = "",
  variant = "appShell",
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const { appDisplayName } = siteFooterAttribution;
  const isMinimal = variant === "minimal";

  return (
    <footer
      className={
        isMinimal
          ? `mt-auto pb-8 pt-6 ${className}`.trim()
          : `${siteFooterChromeClass} mt-auto py-6 ${className}`.trim()
      }
    >
      {!isMinimal && <FooterChromeTopHairline />}
      <div
        className={`relative mx-auto flex max-w-6xl flex-col px-4 sm:px-6 lg:px-8 ${isMinimal ? "gap-4" : "gap-5"}`.trim()}
      >
        <p className="text-center text-sm leading-relaxed text-muted">
          © <span className="tabular-nums">{year}</span>{" "}
          <FooterAttributionHolderLink
            className={isMinimal ? holderLinkOnCanvasClass : holderLinkClass}
          />
          <span aria-hidden={true}> · </span>
          <span className="text-fg-secondary">{appDisplayName}</span>
          . All rights reserved.
        </p>
        <FooterLegalNav
          className={
            isMinimal
              ? "border-t border-border-subtle/40 pt-4"
              : "border-t border-border-subtle/70 pt-4"
          }
          linkClassName={
            isMinimal ? footerLegalLinkOnCanvasClass : footerLegalLinkClass
          }
        />
      </div>
    </footer>
  );
}

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

/** Privacy, cookies and terms routes — stubs until legal copy is finalized. */
export function FooterLegalNav({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Legal information"
      className={`flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 ${className}`.trim()}
    >
      <Link href="/privacy" className={footerLegalLinkClass}>
        Privacy policy
      </Link>
      <Link href="/cookies" className={footerLegalLinkClass}>
        Cookie policy
      </Link>
      <Link href="/terms" className={footerLegalLinkClass}>
        Terms of use
      </Link>
    </nav>
  );
}

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className = "" }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const { appDisplayName } = siteFooterAttribution;

  return (
    <footer
      className={`${siteFooterChromeClass} mt-auto py-6 ${className}`.trim()}
    >
      <FooterChromeTopHairline />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm leading-relaxed text-muted">
          © <span className="tabular-nums">{year}</span>{" "}
          <FooterAttributionHolderLink />
          <span aria-hidden={true}> · </span>
          <span className="text-fg-secondary">{appDisplayName}</span>
          . All rights reserved.
        </p>
        <FooterLegalNav className="border-t border-border-subtle/70 pt-4" />
      </div>
    </footer>
  );
}

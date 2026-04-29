import Image from "next/image";

type AquaSenseLogoProps = {
  className?: string;
  /** When true, alt is empty (use when the parent has `aria-label`). */
  decorative?: boolean;
};

/**
 * Full AquaSense wordmark (`public/AquaSense-logo.svg`).
 * Default size matches app chrome; override `className` for auth hero, footer, etc.
 */
export function AquaSenseLogo({
  className = "h-9 w-auto sm:h-10 md:h-11",
  decorative = false,
}: AquaSenseLogoProps) {
  return (
    <Image
      src="/AquaSense-logo.svg"
      alt={decorative ? "" : "AquaSense"}
      width={320}
      height={80}
      className={`block w-auto shrink-0 object-contain object-left ${className}`}
      unoptimized
      sizes="(max-width: 640px) min(85vw, 320px), 400px"
    />
  );
}

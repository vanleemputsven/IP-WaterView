import Image from "next/image";

type AquaSenseLogoProps = {
  className?: string;
  /** When true, alt is empty (use when the parent link has `aria-label`). */
  decorative?: boolean;
};

/**
 * Full AquaSense wordmark (`public/AquaSense-logo.svg`).
 */
export function AquaSenseLogo({
  className = "h-8 w-auto max-w-full",
  decorative = false,
}: AquaSenseLogoProps) {
  return (
    <Image
      src="/AquaSense-logo.svg"
      alt={decorative ? "" : "AquaSense"}
      width={320}
      height={80}
      className={className}
      unoptimized
      sizes="(max-width: 640px) 240px, 320px"
    />
  );
}

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cpu,
  Droplets,
  LineChart,
  Menu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AquaSenseLogo } from "@/components/brand/aqua-sense-logo";
import { LandingHeroPreview } from "@/components/marketing/landing-hero-preview";

/** Ambient strip — abstract motifs, not a feature list */
const LANDING_STRIP_PHRASES = [
  "ripple",
  "signal",
  "clarity",
  "cadence",
  "threshold",
  "horizon",
  "baseline",
  "continuum",
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-muted">{description}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-fg shadow-card transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-border-subtle/90 bg-surface/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-90"
            aria-label="AquaSense home"
          >
            <AquaSenseLogo decorative className="h-7 w-auto sm:h-8" />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
            >
              How it works
            </a>
            <a
              href="#why-aquasense"
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
            >
              Why AquaSense
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <details className="relative md:hidden">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border-subtle bg-surface text-fg-secondary shadow-sm transition-colors hover:bg-surface-alt hover:text-fg [&::-webkit-details-marker]:hidden">
                <Menu className="h-5 w-5" aria-hidden />
                <span className="sr-only">Open menu</span>
              </summary>
              <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-border-subtle bg-surface/95 p-2 shadow-card backdrop-blur-md">
                <nav className="flex flex-col gap-0.5" aria-label="Mobile">
                  <a
                    href="#features"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
                  >
                    How it works
                  </a>
                  <a
                    href="#why-aquasense"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
                  >
                    Why AquaSense
                  </a>
                  <hr className="my-1 border-border-subtle" />
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-accent-bright transition-colors hover:bg-accent/5"
                  >
                    Get started
                  </Link>
                </nav>
              </div>
            </details>

            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-fg-secondary transition-colors hover:bg-surface-alt hover:text-fg sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="wv-btn-primary text-sm motion-safe:transition-transform motion-safe:active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-accent-bright/15 to-transparent blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                Sense every ripple. Act before problems surface.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted">
                AquaSense connects your sensors to a modern monitoring experience:
                live chemistry at a glance, history you can trust, and admin tools
                that stay out of your way.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="wv-btn-primary gap-2 px-5 py-2.5 text-base motion-safe:transition-transform motion-safe:active:scale-[0.98]"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="wv-btn-secondary text-base motion-safe:transition-transform motion-safe:active:scale-[0.98] sm:hidden"
                >
                  Sign in
                </Link>
                <a
                  href="#features"
                  className="text-sm font-semibold text-accent-bright underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  Explore features
                </a>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border-subtle pt-8 sm:max-w-md">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Metrics
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-fg">
                    Temp · pH · Cl
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Built for
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-fg">Pools & pros</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Stack
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-fg">Next.js · IoT</dd>
                </div>
              </dl>
            </div>

            <div className="relative lg:justify-self-end">
              <LandingHeroPreview />
            </div>
          </div>
        </section>

        <section
          className="border-y border-border-subtle/60 bg-gradient-to-b from-surface-alt/25 via-transparent to-surface-alt/25 backdrop-blur-sm"
          aria-label="Ambient motifs"
        >
          <div className="group relative mx-auto max-w-6xl px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-canvas/90 to-transparent sm:w-14"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-canvas/90 to-transparent sm:w-14"
              aria-hidden
            />
            <div className="overflow-hidden">
              <p className="sr-only">
                Decorative scrolling phrases (not product claims):{" "}
                {LANDING_STRIP_PHRASES.join(", ")}.
              </p>
              <div
                className="pointer-events-none select-none [-webkit-mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]"
                aria-hidden
              >
                <div
                  className="flex w-max pointer-events-auto motion-safe:animate-landing-marquee motion-safe:will-change-transform motion-reduce:animate-none motion-reduce:will-change-auto motion-safe:backface-hidden group-hover:[animation-play-state:paused]"
                >
                  {[0, 1].map((copy) => (
                    <ul
                      key={copy}
                      className="flex shrink-0 items-center gap-1 px-4 sm:gap-1.5 sm:px-8"
                      aria-hidden={copy !== 0}
                    >
                      {LANDING_STRIP_PHRASES.map((phrase, index) => (
                        <li
                          key={`${copy}-${phrase}`}
                          className="flex items-center gap-4 sm:gap-5"
                        >
                          {index > 0 && (
                            <span
                              className="font-light text-accent-bright/35"
                              aria-hidden
                            >
                              ·
                            </span>
                          )}
                          <span className="cursor-default whitespace-nowrap font-medium lowercase text-muted/90 transition-colors duration-300 ease-out tracking-[0.04em] motion-reduce:transition-none hover:text-accent-bright/80 sm:text-sm">
                            {phrase}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to stay on top of water health"
            description="From the first sensor ping to the latest reading in history, AquaSense keeps the experience consistent, fast, and easy to scan."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Activity,
                title: "Live pool status",
                text: "Temperature, pH, and chlorine in clear tiles with tabular numbers for quick comparison.",
              },
              {
                icon: LineChart,
                title: "History & trends",
                text: "See how chemistry evolves over time so you can spot drift before it becomes a maintenance issue.",
              },
              {
                icon: ShieldCheck,
                title: "Admin & audit-minded",
                text: "Separate admin flows for devices, logs, and settings, built for teams that need accountability.",
              },
              {
                icon: Cpu,
                title: "Built for connected hardware",
                text: "Structured around devices and secure ingest patterns so your fleet can grow without rework.",
              },
              {
                icon: Droplets,
                title: "Calm, water-native aesthetic",
                text: "Soft canvas, teal signal color, and generous whitespace reduce fatigue during daily checks.",
              },
              {
                icon: Sparkles,
                title: "Modern web stack",
                text: "Next.js App Router, type-safe APIs, and components that match your design tokens out of the box.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="wv-card-interactive group p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-110 motion-safe:group-hover:bg-accent/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 bg-surface-alt/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <SectionHeading
            eyebrow="How it works"
            title="From sensor to signal in three steps"
            description="A straightforward flow your team can explain to anyone, without a whiteboard full of jargon."
          />
          <ol className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect your device",
                body: "Register hardware and obtain credentials through the admin tools. Seed demo data when you want to explore the UI first.",
              },
              {
                step: "02",
                title: "Ingest measurements",
                body: "Send structured readings to the API. Validate inputs server-side so your dashboard always reflects trusted data.",
              },
              {
                step: "03",
                title: "Monitor & decide",
                body: "Use the dashboard for at-a-glance health and history for deeper context, then act with confidence.",
              },
            ].map((item) => (
              <li key={item.step} className="relative">
                <div className="wv-card-interactive h-full p-6 pt-8">
                  <span className="absolute -top-3 left-6 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-on-accent shadow-sm ring-2 ring-surface">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-fg">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="why-aquasense"
          className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
                  Why AquaSense
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                  Monitoring that feels as clear as the water you maintain
                </h2>
                <p className="mt-4 text-muted">
                  Too many dashboards compete for attention with noise and neon overload.
                  AquaSense is intentionally calm: typography you can read quickly, semantic
                  color for status, and a layout that mirrors how operators actually scan
                  chemistry.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Semantic design tokens: one source of truth for color, radius, and elevation.",
                    "Accessible focus rings and motion-safe defaults for keyboard and reduced-motion users.",
                    "Room to grow: admin, history, and device workflows without reinventing the shell.",
                  ].map((line) => (
                    <li key={line} className="flex gap-3 text-sm text-fg-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-bright ring-2 ring-accent-bright/25" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wv-card border-accent-bright/25 bg-gradient-to-br from-surface to-canvas/80 p-8 shadow-card transition-shadow duration-200 hover:border-accent-bright/40 hover:shadow-lg">
                <blockquote className="border-l-4 border-accent-bright pl-5 text-lg font-medium leading-relaxed text-fg">
                  “We built AquaSense for teams who check chemistry daily, not once a quarter.
                  If your UI feels like work, people stop looking.”
                </blockquote>
                <p className="mt-6 text-sm text-muted">
                  Product principle: clarity over chrome, signal over decoration.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle bg-surface/80 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/"
              className="w-fit transition-opacity hover:opacity-90"
              aria-label="AquaSense home"
            >
              <AquaSenseLogo decorative className="h-6 w-auto opacity-90" />
            </Link>
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} AquaSense. Pool monitoring, refined.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-fg-secondary">
            <a
              href="#features"
              className="transition-colors hover:text-fg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-fg"
            >
              How it works
            </a>
            <Link href="/login" className="transition-colors hover:text-fg">
              Sign in
            </Link>
            <Link href="/signup" className="transition-colors hover:text-fg">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

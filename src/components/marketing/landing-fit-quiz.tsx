"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";

export const FIT_CHECK_HASH = "#fit-check";
const OPEN_EVENT = "aquasense:open-fit-check";

type QuizOption = {
  readonly label: string;
  readonly points: number;
};

type QuizQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly hint?: string;
  readonly options: readonly QuizOption[];
};

const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "testing-habits",
    prompt: "How predictable is your water testing routine?",
    hint: "Honest answers map better to the right next step.",
    options: [
      { label: "Several times per week, almost like clockwork", points: 0 },
      { label: "About weekly, sometimes slips when I'm busy", points: 1 },
      { label: "Mostly when the water looks or smells off", points: 2 },
      {
        label: "I forget often — life gets in the way",
        points: 3,
      },
    ],
  },
  {
    id: "past-issues",
    prompt: "In the last season, what happened with water quality?",
    options: [
      { label: "Smooth sailing — no surprises", points: 0 },
      { label: "Minor haze or chemistry drift once or twice", points: 1 },
      { label: "Cloudy water, algae, irritation, or heavy chlorine smell", points: 2 },
      { label: "More than once — it cost time, chemicals, or peace of mind", points: 3 },
    ],
  },
  {
    id: "decision-style",
    prompt: "When you adjust chemistry, what guides you?",
    options: [
      {
        label: "Logged readings, clear targets, and a repeatable routine",
        points: 0,
      },
      { label: "Test strips and rough dosing — I don't keep history", points: 1 },
      { label: "Experience and intuition more than measurements", points: 2 },
      { label: "I delay or avoid it until someone else flags an issue", points: 3 },
    ],
  },
  {
    id: "scale",
    prompt: "How many pools, spas, or similar bodies do you keep healthy?",
    options: [
      { label: "One home pool or spa", points: 1 },
      { label: "Two or more on the same site", points: 2 },
      { label: "Commercial, HOA, rental, or multi-location", points: 3 },
      { label: "None — I'm exploring for a future project", points: 0 },
    ],
  },
  {
    id: "events",
    prompt: "Before guests, rentals, or inspections — how confident are you?",
    options: [
      { label: "I'm rarely uncertain — I verify ahead of time", points: 0 },
      { label: "Occasionally I'd like a quicker sanity check", points: 1 },
      { label: "Often I'm guessing whether it will hold up", points: 2 },
      {
        label: "It's stressful — I worry about surprises at the wrong moment",
        points: 3,
      },
    ],
  },
  {
    id: "after-shocks",
    prompt: "After storms, heat waves, parties, or heavy bather load, you…",
    options: [
      { label: "Re-check within a day, every time", points: 0 },
      { label: "Usually get to it within a couple of days", points: 1 },
      { label: "Sometimes it takes longer than it should", points: 2 },
      { label: "I often wait until there's an obvious problem", points: 3 },
    ],
  },
  {
    id: "history-value",
    prompt: "How useful would simple charts and history be for you?",
    options: [
      { label: "Nice to have, not essential", points: 0 },
      { label: "Helpful to spot slow drift", points: 1 },
      { label: "Important for accountability across a team", points: 2 },
      {
        label: "Critical — compliance, warranty, insurance, or client trust",
        points: 3,
      },
    ],
  },
  {
    id: "stress-live",
    prompt: "Would live visibility into temp, pH, and sanitizer lower your mental load?",
    options: [
      { label: "I'm already comfortable with my rhythm", points: 0 },
      { label: "Somewhat — fewer unknowns would help", points: 1 },
      { label: "Quite a bit — I dislike guessing", points: 2 },
      {
        label: "A lot — I want fewer 2 a.m. surprises",
        points: 3,
      },
    ],
  },
] as const;

const SCORE_MAX = QUESTIONS.reduce(
  (acc, q) => acc + Math.max(...q.options.map((o) => o.points)),
  0,
);

function tierFromScore(total: number): "steady" | "bridge" | "strong" {
  if (total <= 7) return "steady";
  if (total <= 15) return "bridge";
  return "strong";
}

function clearFitCheckHash() {
  if (typeof window === "undefined") return;
  if (window.location.hash === FIT_CHECK_HASH) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }
}

export function openFitCheckModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
  if (window.location.hash !== FIT_CHECK_HASH) {
    window.history.pushState(null, "", FIT_CHECK_HASH);
  }
}

/**
 * Marketing banner for the fit-check strip. Add `public/fit-check-banner.png`
 * (wide image; ~21:9 or 2:1). If the file is absent or fails to load, an abstract
 * token-aligned illustration is shown instead.
 */
const FIT_CHECK_BANNER_SRC = "/fit-check-banner.png";

function FitCheckBannerArt() {
  const [showPhoto, setShowPhoto] = useState(true);

  return (
    <div className="relative min-h-[11rem] flex-1 overflow-hidden sm:min-h-[13rem] lg:min-h-[12.5rem]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-canvas via-sky-100/50 to-surface-alt"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[145%] w-[min(140%,32rem)] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(13_148_136/0.22),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-screen [background-image:repeating-linear-gradient(-14deg,rgb(15_118_110/0.07)_0_1px,transparent_1px_14px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface/90 to-transparent lg:from-surface/50"
        aria-hidden
      />
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-provided static asset; no build-time guarantee
        <img
          src={FIT_CHECK_BANNER_SRC}
          alt=""
          width={1200}
          height={514}
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          onError={() => setShowPhoto(false)}
        />
      ) : null}
    </div>
  );
}

/** Styled like other in-page anchors; opens the fit-check dialog (hash + event for SPA). */
export function FitCheckLink({
  className,
  children,
  ...rest
}: ComponentProps<"a">) {
  return (
    <a
      {...rest}
      href={FIT_CHECK_HASH}
      className={className}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        openFitCheckModal();
      }}
    >
      {children}
    </a>
  );
}

/**
 * Full-width strip under the hero, aligned to `max-w-6xl`. Uses optional
 * `public/fit-check-banner.png`; falls back to abstract gradients from design tokens.
 */
export function FitCheckTeaser() {
  return (
    <section
      id="fit-check"
      aria-label="AquaSense fit check"
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_12px_40px_rgb(15_23_42/0.08)] motion-safe:transition-[box-shadow,border-color] motion-safe:duration-300 hover:border-accent-bright/20 hover:shadow-[0_1px_2px_rgb(15_23_42/0.05),0_16px_48px_rgb(15_23_42/0.1)] motion-reduce:transition-none"
    >
      <div className="flex flex-col-reverse lg:flex-row lg:items-stretch">
        <div className="flex flex-1 flex-col justify-center gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:max-w-md lg:py-10 xl:max-w-lg">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
              Two-minute fit check
            </p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-fg sm:text-xl">
              Is continuous monitoring a match for you?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Eight plain-language questions about testing habits, risk, and stress — then a
              clear readout. No account; nothing leaves your browser.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => openFitCheckModal()}
              className="wv-btn-primary inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold sm:w-auto motion-safe:transition-transform motion-safe:active:scale-[0.98]"
            >
              Start the check
              <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
            </button>
            <p className="text-xs text-muted">
              Opens in a window over this page · Press Esc or click outside to close
            </p>
          </div>
        </div>
        <FitCheckBannerArt />
      </div>
    </section>
  );
}

export function LandingFitQuiz() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const close = useCallback(() => {
    setOpen(false);
    clearFitCheckHash();
  }, []);

  useEffect(() => {
    const syncHash = () => {
      setOpen(window.location.hash === FIT_CHECK_HASH);
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    syncHash();
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, []);

  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const lockScroll = () => {
      const doc = document.documentElement;
      // Measure before hiding overflow; compensates exactly one scrollbar width
      const gap = Math.max(0, window.innerWidth - doc.clientWidth);
      doc.style.overflow = "hidden";
      doc.style.paddingRight = gap > 0 ? `${gap}px` : "";
    };

    const unlockScroll = () => {
      const doc = document.documentElement;
      doc.style.overflow = "";
      doc.style.paddingRight = "";
    };

    if (open) {
      lockScroll();
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
      unlockScroll();
    }

    return () => {
      if (el.open) el.close();
      unlockScroll();
    };
  }, [open]);

  const isComplete = answers.length === QUESTIONS.length;
  const totalScore = useMemo(
    () => answers.reduce((s, p) => s + p, 0),
    [answers],
  );

  const reset = useCallback(() => {
    setStep(0);
    setAnswers([]);
  }, []);

  const selectOption = useCallback(
    (points: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[step] = points;
        return next;
      });
      setStep((s) => Math.min(s + 1, QUESTIONS.length));
    },
    [step],
  );

  const goBack = useCallback(() => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  }, [step]);

  const progressPercent =
    isComplete || step >= QUESTIONS.length
      ? 100
      : Math.round((step / QUESTIONS.length) * 100);

  const tier = isComplete ? tierFromScore(totalScore) : null;

  const resultCopy =
    tier === "steady"
      ? {
          title: "You're already disciplined",
          body: "Your answers suggest a solid manual rhythm. AquaSense is less about fixing chaos and more about continuous assurance: the same readings you trust, always available, with history when you need to prove a trend or train someone new.",
          accent: "border-success/40 bg-success/5",
        }
      : tier === "bridge"
        ? {
            title: "You're a strong candidate for continuous monitoring",
            body: "The gaps you described are normal — testing slips, weather swings, and busy days stack up. AquaSense turns occasional spot-checks into a steady signal, so drift shows up in the dashboard before it shows up on swimmers.",
            accent: "border-accent-bright/40 bg-accent/5",
          }
        : tier === "strong"
          ? {
              title: "Continuous monitoring aligns with how you operate",
              body: "Your workflow has real consequence when chemistry lags: guests, compliance, or multiple sites. AquaSense is built for operators who need live context, defensible history, and fewer surprises — without another noisy dashboard.",
              accent: "border-warning/45 bg-warning/10",
            }
          : null;

  const question = !isComplete && step < QUESTIONS.length ? QUESTIONS[step] : null;

  const handleDialogClose = useCallback(() => {
    setOpen(false);
    clearFitCheckHash();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-[80] m-0 flex max-h-[min(88dvh,40rem)] w-[min(100vw-1.25rem,26rem)] max-w-[100vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface p-0 shadow-2xl backdrop:bg-fg/55 backdrop:backdrop-blur-sm sm:w-[min(100vw-2rem,28rem)]"
      aria-labelledby={headingId}
      onClose={handleDialogClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-subtle bg-surface-alt/30 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-bright">
              Fit check
            </p>
            <h2
              id={headingId}
              className="mt-1 text-lg font-bold leading-snug text-fg"
            >
              Do you need AquaSense on duty?
            </h2>
            <p className="mt-1 text-xs text-muted">
              Eight questions. Answers stay in this browser only.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/40"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <div className="flex items-center justify-between gap-4 text-xs font-medium text-muted">
            <span className="tabular-nums">
              {isComplete
                ? "Complete"
                : `Question ${Math.min(step + 1, QUESTIONS.length)} of ${QUESTIONS.length}`}
            </span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            aria-label="Quiz progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out motion-reduce:transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="relative mt-6 min-h-[12rem]">
            {question && (
              <div
                key={`q-${question.id}-${step}`}
                className="motion-safe:animate-landing-quiz-step motion-reduce:opacity-100"
                role="group"
                aria-labelledby={`${headingId}-q-${question.id}`}
              >
                <h3
                  id={`${headingId}-q-${question.id}`}
                  className="text-base font-semibold leading-snug text-fg"
                >
                  {question.prompt}
                </h3>
                {question.hint && (
                  <p className="mt-2 text-xs text-muted">{question.hint}</p>
                )}
                <ul className="mt-4 flex flex-col gap-2">
                  {question.options.map((opt) => (
                    <li key={opt.label}>
                      <button
                        type="button"
                        onClick={() => selectOption(opt.points)}
                        className="group flex w-full items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-alt/50 px-3.5 py-3 text-left text-sm font-medium text-fg-secondary shadow-sm transition-all duration-200 ease-out hover:border-accent-bright/45 hover:bg-surface hover:text-fg hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:active:scale-[0.99]"
                      >
                        <ChevronRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent-bright motion-reduce:group-hover:translate-x-0"
                          aria-hidden
                        />
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isComplete && resultCopy && (
              <div
                key="result"
                className="motion-safe:animate-landing-quiz-step motion-reduce:opacity-100"
              >
                <div
                  className={`rounded-xl border px-3.5 py-4 ${resultCopy.accent}`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright"
                      aria-hidden
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Your result
                      </p>
                      <p className="mt-1 text-lg font-bold text-fg">
                        {resultCopy.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-fg-secondary sm:text-sm">
                        {resultCopy.body}
                      </p>
                      <p className="mt-3 text-[0.7rem] text-muted sm:text-xs">
                        Score band: {totalScore} / {SCORE_MAX} — indicative only.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <Link
                    href="/signup"
                    className="wv-btn-primary inline-flex justify-center gap-2 px-4 py-2.5 text-sm motion-safe:transition-transform motion-safe:active:scale-[0.98]"
                  >
                    Explore AquaSense
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={reset}
                    className="wv-btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Retake check
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isComplete && step > 0 && (
            <div className="mt-5 border-t border-border-subtle pt-4">
              <button
                type="button"
                onClick={goBack}
                className="text-xs font-semibold text-accent-bright underline-offset-4 transition-colors hover:text-accent hover:underline sm:text-sm"
              >
                ← Previous question
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

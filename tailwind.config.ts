import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-alt": "rgb(var(--color-surface-alt) / <alpha-value>)",
        "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        "fg-secondary": "rgb(var(--color-fg-secondary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-deep": "rgb(var(--color-accent-deep) / <alpha-value>)",
        "accent-bright": "rgb(var(--color-accent-bright) / <alpha-value>)",
        "on-accent": "rgb(var(--color-on-accent) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "code-bg": "rgb(var(--color-code-bg) / <alpha-value>)",
        "inverse-fg": "rgb(var(--color-inverse-fg) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["var(--font-wv-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-wv-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "landing-bar-up": {
          "0%": { transform: "scaleY(0.45)", opacity: "0.65" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        "landing-marquee": {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        "landing-quiz-step": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dashboard-card-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "landing-bar-up": "landing-bar-up 0.55s ease-out both",
        "landing-marquee": "landing-marquee 40s linear infinite",
        "landing-quiz-step": "landing-quiz-step 0.35s ease-out both",
        "dashboard-card-in": "dashboard-card-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

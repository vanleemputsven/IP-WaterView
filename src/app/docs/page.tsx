"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { publicPdfDocuments } from "@/lib/docs/public-pdf-docs";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
      API-referentie laden…
    </div>
  ),
});

type DocsTab = "api" | "pdfs";

const tabBase =
  "rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export default function DocsPage() {
  const [tab, setTab] = useState<DocsTab>("api");
  const firstHref = publicPdfDocuments[0]?.href ?? "";
  const [selectedPdfHref, setSelectedPdfHref] = useState<string>(firstHref);

  const selectedTitle =
    publicPdfDocuments.find((d) => d.href === selectedPdfHref)?.title ?? "Document";

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/"
              className="text-sm font-medium text-muted underline decoration-transparent underline-offset-4 outline-none transition-colors hover:text-fg hover:decoration-border-subtle focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              ← Home
            </Link>
            <span className="hidden text-border-subtle sm:inline" aria-hidden>
              |
            </span>
            <h1 className="text-base font-semibold tracking-tight text-fg">Documentatie</h1>
          </div>
          <nav className="flex gap-1 rounded-lg bg-surface-alt p-1" aria-label="Documentatietype">
            <button
              type="button"
              className={`${tabBase} ${tab === "api" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"}`}
              onClick={() => setTab("api")}
              aria-pressed={tab === "api"}
            >
              OpenAPI / Swagger
            </button>
            <button
              type="button"
              className={`${tabBase} ${tab === "pdfs" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"}`}
              onClick={() => setTab("pdfs")}
              aria-pressed={tab === "pdfs"}
            >
              PDF’s
            </button>
          </nav>
        </div>
      </header>

      <div className={tab === "api" ? "flex min-h-0 flex-1 flex-col bg-white" : "hidden"} aria-hidden={tab !== "api"}>
        <SwaggerUI
          url="/api/openapi"
          docExpansion="list"
          defaultModelExpandDepth={2}
          persistAuthorization
          tryItOutEnabled
        />
      </div>

      <div
        className={tab === "pdfs" ? "mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-0 md:flex-row md:min-h-0" : "hidden"}
        aria-hidden={tab !== "pdfs"}
      >
        <aside className="w-full shrink-0 border-b border-border-subtle bg-surface md:w-72 md:border-b-0 md:border-r">
          <div className="max-h-[40vh] overflow-y-auto p-3 md:max-h-none md:p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Projectdocumenten</p>
            <ul className="space-y-1">
              {publicPdfDocuments.map((doc) => {
                const active = doc.href === selectedPdfHref;
                return (
                  <li key={doc.href}>
                    <button
                      type="button"
                      onClick={() => setSelectedPdfHref(doc.href)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-bright/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                        active
                          ? "bg-surface-alt font-medium text-fg ring-1 ring-border-subtle"
                          : "text-fg-secondary hover:bg-surface-alt/80"
                      }`}
                      aria-current={active ? "true" : undefined}
                    >
                      {doc.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <section className="flex min-h-[65vh] flex-1 flex-col bg-surface md:min-h-0">
          {selectedPdfHref ? (
            <iframe
              title={selectedTitle}
              src={selectedPdfHref}
              className="min-h-[60vh] w-full flex-1 border-0 md:min-h-0"
            />
          ) : (
            <p className="p-6 text-sm text-muted">Geen documenten geconfigureerd.</p>
          )}
        </section>
      </div>
    </div>
  );
}

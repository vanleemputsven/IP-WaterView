"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-600">
      Loading API reference…
    </div>
  ),
});

/**
 * Interactieve OpenAPI-documentatie. Spec wordt geladen van `/api/openapi`
 * (YAML met juiste Content-Type; bronbestand: `public/openapi.yaml`).
 */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        url="/api/openapi"
        docExpansion="list"
        defaultModelExpandDepth={2}
        persistAuthorization
        tryItOutEnabled
      />
    </div>
  );
}

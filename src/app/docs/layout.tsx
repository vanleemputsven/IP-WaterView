import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API reference",
  description:
    "OpenAPI / Swagger UI interactieve referentie voor de AquaSense backend.",
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

import type { Metadata } from "next";
import { LegalDocumentShell } from "@/components/legal/legal-document-shell";

export const metadata: Metadata = {
  title: "Cookie policy · AquaSense",
  description: "Legal placeholder.",
};

export default function CookiePolicyPage() {
  return <LegalDocumentShell title="Cookie policy" />;
}

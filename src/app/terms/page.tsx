import type { Metadata } from "next";
import { LegalDocumentShell } from "@/components/legal/legal-document-shell";

export const metadata: Metadata = {
  title: "Terms of use · AquaSense",
  description: "Legal placeholder.",
};

export default function TermsOfUsePage() {
  return <LegalDocumentShell title="Terms of use" />;
}

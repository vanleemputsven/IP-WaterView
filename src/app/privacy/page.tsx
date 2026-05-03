import type { Metadata } from "next";
import { LegalDocumentShell } from "@/components/legal/legal-document-shell";

export const metadata: Metadata = {
  title: "Privacy policy · AquaSense",
  description: "Legal placeholder.",
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentShell title="Privacy policy" />;
}

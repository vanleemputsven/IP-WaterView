import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const wvSans = Plus_Jakarta_Sans({
  variable: "--font-wv-sans",
  subsets: ["latin"],
  display: "swap",
});

const wvMono = JetBrains_Mono({
  variable: "--font-wv-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AquaSense: Pool monitoring",
  applicationName: "AquaSense",
  description: "IoT-based pool water monitoring platform",
  icons: {
    // SVG/PNG first for crisp icons; ICO for legacy /favicon.ico clients.
    icon: [
      { url: "/AquaSense-logo.svg", type: "image/svg+xml" },
      { url: "/AquaSense-icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/AquaSense-icon.png",
    shortcut: "/AquaSense-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${wvSans.variable} ${wvMono.variable} min-h-screen bg-canvas font-sans text-fg antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

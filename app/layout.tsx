import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Prompt, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { SITE_URL } from "@/lib/site";

const sans = Noto_Sans_Thai({ variable: "--font-sans-th", subsets: ["thai", "latin"], display: "swap" });
const serif = Prompt({ variable: "--font-serif-th", subsets: ["thai", "latin"], weight: ["500", "600", "700"], display: "swap" });
const display = Space_Grotesk({ variable: "--font-display-latin", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SISE · พื้นที่ออนไลน์ของคนศรีสะเกษ", template: "%s · SISE ศรีสะเกษ" },
  description: "ศรีสะเกษ เมืองเล็ก ไม่ธรรมดา ค้นพบร้านอาหาร คาเฟ่ งาน ที่เที่ยว และพูดคุยกับคนศรีสะเกษในห้องที่คุณสนใจ — Discover Sisaket.",
  applicationName: "SISE",
  keywords: ["ศรีสะเกษ", "ร้านอาหารศรีสะเกษ", "คาเฟ่ศรีสะเกษ", "เที่ยวศรีสะเกษ", "งานศรีสะเกษ", "ของกินศรีสะเกษ", "ชุมชนศรีสะเกษ"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "SISE",
    title: "SISE · พื้นที่ออนไลน์ของคนศรีสะเกษ",
    description: "Local stories. Local places. Local people.",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "SISE", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sans.variable} ${serif.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-night focus:px-4 focus:py-2 focus:text-on-night">
          ข้ามไปยังเนื้อหา
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

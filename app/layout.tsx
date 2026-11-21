import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Event Check-In App — Sistem Pendaftaran Acara & Kehadiran",
  description:
    "Sistem Pendaftaran Acara & Kehadiran untuk bengkel, seminar, dan aktiviti kolej dengan semakan kehadiran pantas di kaunter pendaftaran.",
  openGraph: {
    title: "Event Check-In App — Sistem Pendaftaran Acara & Kehadiran",
    description:
      "Sistem Pendaftaran Acara & Kehadiran untuk bengkel, seminar, dan aktiviti kolej dengan semakan kehadiran pantas di kaunter pendaftaran.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Check-In App — Sistem Pendaftaran Acara & Kehadiran",
    description:
      "Sistem Pendaftaran Acara & Kehadiran untuk bengkel, seminar, dan aktiviti kolej dengan semakan kehadiran pantas di kaunter pendaftaran.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}

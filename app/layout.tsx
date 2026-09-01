import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kargo Operasyon Platformu",
    template: "%s | Kargo Operasyon Platformu",
  },
  description:
    "Müşteri, bakiye/cari, kargo entegrasyonları ve raporlamayı tek sistemden yöneten operasyon platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" closeButton />
        <SpeedInsights />
      </body>
    </html>
  );
}

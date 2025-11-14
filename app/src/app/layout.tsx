import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO/GEO Visibility Blog Generator",
  description: "Generate geo-targeted SEO articles with Claude, Exa, and Unsplash in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NuqsAdapter>
          <div className="relative min-h-screen">
            <Image
              src="/logo.png"
              width={64}
              height={64}
              priority
              alt="Monogram logo"
              role="img"
              tabIndex={0}
              aria-label="Company monogram logo"
              className="fixed right-6 top-6 z-40 h-12 w-12 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_20px_45px_rgba(42,51,164,0.18)] backdrop-blur"
            />
            {children}
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}

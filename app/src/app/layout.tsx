import type { Metadata } from "next";
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}>
        <NuqsAdapter>
          <div className="relative flex h-full flex-col">{children}</div>
        </NuqsAdapter>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Kyryll Pavlenko",
  description: "Software engineer. Books, places, and writing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://covers.openlibrary.org" />
        <link rel="alternate" type="application/rss+xml" title="Kyryll Pavlenko — Writing & Books" href="/rss.xml" />
      </head>
      <body>
        <SiteHeader />
        <div className="mx-auto max-w-[1160px] px-5 sm:px-8">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

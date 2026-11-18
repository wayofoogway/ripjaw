import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import type { ReactNode } from "react";
import { Lockup } from "@/components/layout/lockup";
import { SiteFooter } from "@/components/layout/site-footer";
import { site } from "@/config/site";
import { fadeScript } from "@/lib/fade-script";
import "./globals.css";

/* Fonts are self-hosted from pinned npm packages, so a build never depends on a font service. */
const spaceGrotesk = localFont({
  src: "../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon-180.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0B0C10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      // The head script adds `data-js` before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Runs the fades without waiting for React. Content is never hidden when script does not run. */}
        <script dangerouslySetInnerHTML={{ __html: fadeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-lg focus:bg-rj-text focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-rj-bg"
        >
          Skip to content
        </a>
        {/* No navigation bar: a small logo, and the page links live in the footer. */}
        <header className="container-rj pt-8">
          <Link href="/" aria-label={`${site.name} home`} className="inline-flex h-11 items-center">
            <Lockup className="h-7 w-auto" />
          </Link>
        </header>
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

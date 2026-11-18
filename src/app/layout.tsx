import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Providers } from "@/components/layout/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav, type NavItem } from "@/components/layout/site-nav";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import { featureStatusMeta, getFeature, site } from "@/config/site";
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

const navItems: NavItem[] = site.routes
  .filter((route) => route.nav)
  .map((route) => {
    if (!route.statusFeatureId) return { path: route.path, label: route.label };
    const { status } = getFeature(route.statusFeatureId);
    const showChip = status !== "available_beta";
    return {
      path: route.path,
      label: route.label,
      chip: showChip ? { status, label: featureStatusMeta[status].short } : undefined,
    };
  });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      // The head script below adds `data-js` before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Marks that script runs, which the `pinned:` variant needs before it turns on sticky scroll stories. */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.js=""' }} />
      </head>
      <body>
        <noscript>
          {/* Scroll reveals start hidden and pinned stories need script; show everything without it. */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Providers
          referral={{
            botUrl: site.links.telegramBot,
            queryParam: site.referrals.queryParam,
            codePattern: site.referrals.codePattern,
            startPrefix: site.referrals.startPrefix,
          }}
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-full focus:bg-rj-surface-2 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-rj-text"
          >
            Skip to content
          </a>
          <AnnouncementBar {...site.beta.announcement} />
          <SiteNav
            items={navItems}
            ctaLabel={site.cta.primary.label}
            microcopy={site.cta.microcopy}
            xLink={{ href: site.links.x, label: `X ${site.links.xHandle}` }}
          />
          <main id="main">{children}</main>
          <SiteFooter />
          <StickyMobileCta
            label={site.cta.primary.label}
            reminder={site.cta.reminder}
            hideWhenVisibleId="site-footer"
          />
        </Providers>
      </body>
    </html>
  );
}

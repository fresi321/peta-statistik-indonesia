import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "@/styles.css?url";
import {
  SEO,
  absoluteUrl,
  defaultMeta,
  buildWebAppJsonLd,
  buildDatasetJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildProvinceItemListJsonLd,
  jsonLdScript,
} from "@/lib/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [...defaultMeta()],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: absoluteUrl("/") },
      { rel: "alternate", hrefLang: "id", href: absoluteUrl("/") },
      { rel: "alternate", hrefLang: "x-default", href: absoluteUrl("/") },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@500;600;700&display=swap",
      },
      { rel: "image_src", href: absoluteUrl(SEO.ogImagePath) },
    ],
    scripts: [
      jsonLdScript(buildWebAppJsonLd()),
      jsonLdScript(buildDatasetJsonLd()),
      jsonLdScript(buildFaqJsonLd()),
      jsonLdScript(buildBreadcrumbJsonLd()),
      jsonLdScript(buildProvinceItemListJsonLd()),
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <a
          href="#peta"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
        >
          Langsung ke peta statistik
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

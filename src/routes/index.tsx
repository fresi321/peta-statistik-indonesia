import { createFileRoute } from "@tanstack/react-router";
import { MapApp } from "@/components/map/MapApp";
import { SeoContent } from "@/components/seo/SeoContent";
import { SEO, absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { property: "og:title", content: SEO.title },
      { property: "og:description", content: SEO.description },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:title", content: SEO.title },
      { name: "twitter:description", content: SEO.description },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="min-h-dvh bg-bg">
      <div id="peta" className="h-dvh">
        <MapApp />
      </div>
      <SeoContent />
    </main>
  );
}

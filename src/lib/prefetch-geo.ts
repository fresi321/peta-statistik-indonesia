/**
 * Shared GeoJSON fetch cache — warm the network before Leaflet mounts,
 * and reuse the same promise when the map layer loads.
 */

const GEO_URL = "/geo/indonesia-provinces.json";

let geoPromise: Promise<GeoJSON.FeatureCollection> | null = null;

export function prefetchProvinceGeoJson(): Promise<GeoJSON.FeatureCollection> {
  if (!geoPromise) {
    geoPromise = fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`GeoJSON ${res.status}`);
        return res.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .catch((err) => {
        geoPromise = null;
        throw err;
      });
  }
  return geoPromise;
}

/** Kick off map code-split + GeoJSON while the shell paints. */
export function warmMapAssets(): void {
  if (typeof window === "undefined") return;
  const run = () => {
    void prefetchProvinceGeoJson();
    void import("@/components/map/IndonesiaMap");
  };
  const ric = window.requestIdleCallback?.bind(window);
  if (ric) {
    ric(() => run(), { timeout: 2000 });
  } else {
    globalThis.setTimeout(run, 100);
  }
}

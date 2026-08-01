/**
 * Shared GeoJSON fetch cache — warm the network before Leaflet mounts,
 * and reuse the same promise when the map layer loads.
 */

const PROVINCE_GEO_URL = "/geo/indonesia-provinces.json";
const REGENCY_GEO_URL = "/geo/indonesia-regencies-simplified.json";

let provincePromise: Promise<GeoJSON.FeatureCollection> | null = null;
let regencyPromise: Promise<GeoJSON.FeatureCollection> | null = null;

export function prefetchProvinceGeoJson(): Promise<GeoJSON.FeatureCollection> {
  if (!provincePromise) {
    provincePromise = fetch(PROVINCE_GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`GeoJSON province ${res.status}`);
        return res.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .catch((err) => {
        provincePromise = null;
        throw err;
      });
  }
  return provincePromise;
}

/** Lazy — only when user switches to kab/kota (not on first paint). */
export function prefetchRegencyGeoJson(): Promise<GeoJSON.FeatureCollection> {
  if (!regencyPromise) {
    regencyPromise = fetch(REGENCY_GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`GeoJSON regency ${res.status}`);
        return res.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .catch((err) => {
        regencyPromise = null;
        throw err;
      });
  }
  return regencyPromise;
}

/** Kick off map code-split + province GeoJSON while the shell paints. */
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

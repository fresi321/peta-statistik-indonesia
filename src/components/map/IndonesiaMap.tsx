import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  getMetricValue,
  metricRange,
  normalize,
  METRIC_BY_KEY,
  PROVINCE_BY_GEO,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import {
  MAP_INTERACTION,
  MAP_NO_DATA,
  choroplethColor,
} from "@/lib/map-colors";

type IndonesiaMapProps = {
  metric: MetricKey;
  selectedKey: string | null;
  onSelect: (geoKey: string | null, stats: ProvinceStats | null) => void;
  onHover: (stats: ProvinceStats | null) => void;
};

export function IndonesiaMap({
  metric,
  selectedKey,
  onSelect,
  onHover,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const metricRef = useRef(metric);
  const selectedRef = useRef(selectedKey);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);

  metricRef.current = metric;
  selectedRef.current = selectedKey;
  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      minZoom: 4,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        opacity: 0.85,
        pane: "overlayPane",
      },
    ).addTo(map);

    mapRef.current = map;

    let cancelled = false;

    (async () => {
      const res = await fetch("/geo/indonesia-provinces.json");
      const geojson = await res.json();
      if (cancelled || !mapRef.current) return;

      const layer = L.geoJSON(geojson, {
        style: (feature) => styleForFeature(feature, metricRef.current),
        onEachFeature: (feature, featureLayer) => {
          const key = String(feature.properties?.Propinsi ?? "");
          const stats = PROVINCE_BY_GEO[key] ?? null;

          featureLayer.on({
            mouseover: (e) => {
              const target = e.target as L.Path;
              target.setStyle({
                weight: MAP_INTERACTION.hoverWeight,
                color: MAP_INTERACTION.hoverStroke,
                fillOpacity: MAP_INTERACTION.hoverFillOpacity,
              });
              target.bringToFront();
              onHoverRef.current(stats);
            },
            mouseout: (e) => {
              const target = e.target as L.Path;
              if (selectedRef.current === key) {
                target.setStyle({
                  weight: MAP_INTERACTION.selectedWeight,
                  color: MAP_INTERACTION.selectedStroke,
                  fillOpacity: MAP_INTERACTION.selectedFillOpacity,
                });
              } else {
                layer.resetStyle(target);
              }
              onHoverRef.current(null);
            },
            click: () => {
              onSelectRef.current(key, stats);
            },
          });

          if (stats) {
            const m = METRIC_BY_KEY[metricRef.current];
            featureLayer.bindTooltip(
              `<strong>${stats.name}</strong><br/>${m.short}: ${m.format(getMetricValue(stats, metricRef.current))}`,
              { sticky: true, className: "map-tooltip", opacity: 1 },
            );
          }
        },
      });

      layer.addTo(map);
      layerRef.current = layer;

      try {
        const b = layer.getBounds();
        if (b.isValid()) {
          map.fitBounds(b, { padding: [24, 24], maxZoom: 6 });
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((fl) => {
      const path = fl as L.Path & { feature?: GeoJSON.Feature };
      const feature = path.feature;
      if (!feature) return;
      path.setStyle(styleForFeature(feature, metric));
      const key = String(feature.properties?.Propinsi ?? "");
      const stats = PROVINCE_BY_GEO[key];
      if (stats) {
        const m = METRIC_BY_KEY[metric];
        path.setTooltipContent(
          `<strong>${stats.name}</strong><br/>${m.short}: ${m.format(getMetricValue(stats, metric))}`,
        );
      }
      if (selectedKey === key) {
        path.setStyle({
          weight: MAP_INTERACTION.selectedWeight,
          color: MAP_INTERACTION.selectedStroke,
          fillOpacity: MAP_INTERACTION.selectedFillOpacity,
        });
      }
    });
  }, [metric, selectedKey]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.eachLayer((fl) => {
      const path = fl as L.Path & { feature?: GeoJSON.Feature };
      const key = String(path.feature?.properties?.Propinsi ?? "");
      if (selectedKey === key) {
        path.setStyle({
          weight: MAP_INTERACTION.selectedWeight,
          color: MAP_INTERACTION.selectedStroke,
          fillOpacity: MAP_INTERACTION.selectedFillOpacity,
        });
        path.bringToFront();
      } else {
        layer.resetStyle(path);
      }
    });
  }, [selectedKey]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Peta interaktif provinsi Indonesia"
    />
  );
}

function styleForFeature(
  feature: GeoJSON.Feature | undefined,
  metric: MetricKey,
): L.PathOptions {
  const key = String(feature?.properties?.Propinsi ?? "");
  const stats = PROVINCE_BY_GEO[key];
  if (!stats) {
    return {
      fillColor: MAP_NO_DATA.fill,
      color: MAP_NO_DATA.stroke,
      weight: MAP_INTERACTION.defaultWeight,
      fillOpacity: MAP_NO_DATA.fillOpacity,
    };
  }
  const m = METRIC_BY_KEY[metric];
  const range = metricRange(metric);
  const t = normalize(getMetricValue(stats, metric), range.min, range.max);
  return {
    fillColor: choroplethColor(t, m.higherIsBetter),
    color: MAP_INTERACTION.defaultStroke,
    weight: MAP_INTERACTION.defaultWeight,
    fillOpacity: MAP_INTERACTION.defaultFillOpacity,
    className: "province-path",
  };
}

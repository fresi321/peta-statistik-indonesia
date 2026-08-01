import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Download,
  List,
  Map as MapIcon,
  Search,
  Table2,
  X,
} from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { DataAttribution } from "@/components/map/DataAttribution";
import { DataFreshnessBadge } from "@/components/map/DataFreshnessBadge";
import { ChoroplethLegend } from "@/components/map/ChoroplethLegend";
import { HistoryTimeline } from "@/components/map/HistoryTimeline";
import { LevelSwitcher } from "@/components/map/LevelSwitcher";
import { MetricPicker, QUICK_METRICS } from "@/components/map/MetricPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  REGENCIES,
  REGENCY_BY_GEO,
  type RegencyUnit,
} from "@/data/admin/regency-index";
import {
  CATEGORIES,
  DATA_SOURCES,
  METRIC_BY_KEY,
  PROVINCE_BY_GEO,
  PROVINCES,
  getCategory,
  metricsForCategory,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { useHistoryPlayback } from "@/hooks/useHistoryPlayback";
import { hasHistory, type AdminLevel } from "@/lib/history-access";
import {
  PALETTE_STORAGE_KEY,
  type PaletteMode,
} from "@/lib/map-colors";
import {
  buildMetricSummary,
  buildPreviewStats,
  resolveMetricValue,
} from "@/lib/map-legend";
import { mapColorForValue } from "@/lib/map-scale";
import { warmMapAssets } from "@/lib/prefetch-geo";
import { cn } from "@/lib/utils";
import type { MapSelectPayload } from "@/components/map/IndonesiaMap";
import { getHistoryValue } from "@/lib/history-access";

function buildRegencyPreview(
  unit: RegencyUnit,
  metric: MetricKey,
  historyYear: number | null,
) {
  const m = METRIC_BY_KEY[metric];
  const value =
    historyYear != null
      ? getHistoryValue(unit.geoKey, metric, historyYear, "regency")
      : null;
  return {
    name: unit.name,
    parent: unit.provinceName,
    valueLabel: value == null ? "—" : m.format(value),
    unit: m.unit,
    metricShort:
      historyYear != null ? `${m.short} · ${historyYear}` : m.short,
  };
}

/** Heavy chunks — Leaflet / Recharts / dialogs — code-split from shell */
const IndonesiaMap = lazy(() =>
  import("@/components/map/IndonesiaMap").then((m) => ({
    default: m.IndonesiaMap,
  })),
);
const StatsPanel = lazy(() =>
  import("@/components/map/StatsPanel").then((m) => ({
    default: m.StatsPanel,
  })),
);
const AccessibleDataTable = lazy(() =>
  import("@/components/map/AccessibleDataTable").then((m) => ({
    default: m.AccessibleDataTable,
  })),
);
const DownloadMenu = lazy(() =>
  import("@/components/map/DownloadMenu").then((m) => ({
    default: m.DownloadMenu,
  })),
);

function MapChunkFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
      <div
        className="size-8 animate-pulse rounded-full border-2 border-accent/30 border-t-accent"
        aria-hidden
      />
      <p className="text-sm font-medium text-fg">Memuat peta…</p>
      <p className="text-[11px] text-muted-foreground">
        Modul peta & batas provinsi
      </p>
    </div>
  );
}

function PanelChunkFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-xs text-muted-foreground",
        className,
      )}
    >
      Memuat panel…
    </div>
  );
}

const GUIDE_KEY = "psi_data_guide_dismissed_v1";

function isXlViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1280px)").matches;
}

function readPaletteMode(): PaletteMode {
  try {
    const v = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (v === "colorblind" || v === "default") return v;
  } catch {
    /* ignore */
  }
  return "default";
}

export function MapApp() {
  const [category, setCategory] = useState<CategoryKey>("ekonomi");
  const [metric, setMetric] = useState<MetricKey>("ump");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProvinceStats | null>(null);
  const [hovered, setHovered] = useState<ProvinceStats | null>(null);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [legendClass, setLegendClass] = useState<number | null>(null);
  const [legendHoverClass, setLegendHoverClass] = useState<number | null>(
    null,
  );
  const [palette, setPalette] = useState<PaletteMode>("default");
  const [adminLevel, setAdminLevel] = useState<AdminLevel>("province");
  const [parentFilter, setParentFilter] = useState<string | null>(null);
  const [regencyLoading, setRegencyLoading] = useState(false);
  const [selectedRegency, setSelectedRegency] = useState<RegencyUnit | null>(
    null,
  );
  const [hoveredRegency, setHoveredRegency] = useState<RegencyUnit | null>(
    null,
  );

  const history = useHistoryPlayback(metric, adminLevel);
  const historyYear = history.enabled ? history.year : null;
  const historyDomain = history.enabled ? history.domain : null;

  const activeCategory = getCategory(category);
  const categoryMetrics = metricsForCategory(category);
  const activeMetric = METRIC_BY_KEY[metric];
  const metricSummary = useMemo(
    () => buildMetricSummary(metric, historyYear, historyDomain),
    [metric, historyYear, historyDomain],
  );

  // Kab/kota MVP: only poverty has history — auto-switch metric
  useEffect(() => {
    if (adminLevel === "regency" && !hasHistory(metric, "regency")) {
      setCategory("demografi");
      setMetric("poverty");
    }
  }, [adminLevel, metric]);

  useEffect(() => {
    setPalette(readPaletteMode());
  }, []);

  // Prefetch Leaflet chunk + GeoJSON while chrome paints
  useEffect(() => {
    warmMapAssets();
  }, []);

  useEffect(() => {
    try {
      if (!localStorage.getItem(GUIDE_KEY)) setShowGuide(true);
    } catch {
      setShowGuide(true);
    }
  }, []);

  useEffect(() => {
    setSortAsc(!activeMetric.higherIsBetter);
  }, [metric, activeMetric.higherIsBetter]);

  useEffect(() => {
    setLegendClass(null);
    setLegendHoverClass(null);
  }, [metric]);

  const setPalettePersist = (mode: PaletteMode) => {
    setPalette(mode);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const selectCategory = (key: CategoryKey) => {
    const cat = getCategory(key);
    setCategory(key);
    if (!cat.metrics.includes(metric)) {
      setMetric(cat.defaultMetric);
    }
  };

  const selectData = (cat: CategoryKey, m: MetricKey) => {
    setCategory(cat);
    setMetric(m);
    setShowGuide(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const dismissGuide = () => {
    setShowGuide(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const filteredProvinces = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...PROVINCES];
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.capital.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const va = resolveMetricValue(a, metric, historyYear) ?? 0;
      const vb = resolveMetricValue(b, metric, historyYear) ?? 0;
      const diff = va - vb;
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [query, metric, sortAsc, historyYear]);

  const filteredRegencies = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = parentFilter
      ? REGENCIES.filter((r) => r.parentProvinceKey === parentFilter)
      : [...REGENCIES];
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.provinceName.toLowerCase().includes(q) ||
          r.geoKey.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const va =
        historyYear != null
          ? (getHistoryValue(a.geoKey, metric, historyYear, "regency") ?? 0)
          : 0;
      const vb =
        historyYear != null
          ? (getHistoryValue(b.geoKey, metric, historyYear, "regency") ?? 0)
          : 0;
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [query, metric, sortAsc, historyYear, parentFilter]);

  const handleMapSelect = (payload: MapSelectPayload | null) => {
    if (!payload) {
      setSelectedKey(null);
      setSelected(null);
      setSelectedRegency(null);
      setMobileStatsOpen(false);
      return;
    }
    setSelectedKey(payload.geoKey);
    if (payload.level === "province") {
      setSelected(payload.province);
      setSelectedRegency(null);
      if (payload.province) {
        setListOpen(false);
        setMobileStatsOpen(isXlViewport());
      } else {
        setMobileStatsOpen(false);
      }
    } else {
      setSelected(null);
      setSelectedRegency(payload.regency);
      if (payload.regency) {
        setListOpen(false);
        setMobileStatsOpen(isXlViewport());
      } else {
        setMobileStatsOpen(false);
      }
    }
  };

  const handleListSelectProvince = (p: ProvinceStats) => {
    setSelectedKey(p.geoKey);
    setSelected(p);
    setSelectedRegency(null);
    setListOpen(false);
    setMobileStatsOpen(true);
  };

  const handleListSelectRegency = (r: RegencyUnit) => {
    setSelectedKey(r.geoKey);
    setSelectedRegency(r);
    setSelected(null);
    setListOpen(false);
    setMobileStatsOpen(true);
  };

  const openDetailFromCard = () => {
    if (adminLevel === "regency") {
      const target = hoveredRegency ?? selectedRegency;
      if (!target) return;
      setSelectedKey(target.geoKey);
      setSelectedRegency(target);
      setSelected(null);
      setMobileStatsOpen(true);
      return;
    }
    const target = hovered ?? selected;
    if (!target) return;
    setSelectedKey(target.geoKey);
    setSelected(target);
    setSelectedRegency(null);
    setMobileStatsOpen(true);
  };

  const setLevel = (level: AdminLevel) => {
    history.pause();
    setAdminLevel(level);
    setSelectedKey(null);
    setSelected(null);
    setSelectedRegency(null);
    setHovered(null);
    setHoveredRegency(null);
    setLegendClass(null);
    if (level === "province") {
      setParentFilter(null);
    }
  };

  const drillIntoProvince = (provinceKey: string) => {
    setAdminLevel("regency");
    setParentFilter(provinceKey);
    setSelectedKey(null);
    setSelected(null);
    setSelectedRegency(null);
    if (!hasHistory(metric, "regency")) {
      setCategory("demografi");
      setMetric("poverty");
    }
  };

  const display = hovered ?? selected;
  const displayRegency = hoveredRegency ?? selectedRegency;
  const preview =
    adminLevel === "province" && display
      ? buildPreviewStats(display, metric, historyYear)
      : null;
  const regencyPreview =
    adminLevel === "regency" && displayRegency
      ? buildRegencyPreview(displayRegency, metric, historyYear)
      : null;

  const parentFilterName = parentFilter
    ? (PROVINCE_BY_GEO[parentFilter]?.name ?? parentFilter)
    : null;

  return (
    <div className="app-shell relative flex h-full w-full flex-col overflow-hidden">
      {/* Screen-reader live summary — not color-only access to the map story */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {metricSummary}
      </div>

      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-2.5 py-2 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5">
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
            <MapIcon className="size-4 text-accent" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-sm font-semibold tracking-tight text-fg sm:text-base">
              Peta Statistik
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="hidden rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground sm:inline">
                {DATA_SOURCES.provinceCount} provinsi
              </span>
              <div className="hidden md:block">
                <DataFreshnessBadge
                  metric={metric}
                  compact
                  historyYear={historyYear}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-sm">
          <MetricPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            category={category}
            metric={metric}
            onSelect={selectData}
            triggerClassName="h-11 w-full max-w-none"
          />
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <Button
            variant="secondary"
            size="default"
            className="min-h-11 gap-1.5 px-3"
            onClick={() => setTableOpen(true)}
          >
            <Table2 className="size-3.5 text-accent" aria-hidden />
            <span className="hidden lg:inline">Tabel</span>
          </Button>
          <Button
            variant="secondary"
            size="default"
            className="min-h-11 gap-1.5 px-3"
            onClick={() => setDownloadOpen(true)}
          >
            <Download className="size-3.5 text-accent" aria-hidden />
            <span className="hidden md:inline">Unduh</span>
          </Button>
          <Button
            variant="secondary"
            size="default"
            className="min-h-11 min-w-11 lg:hidden"
            onClick={() => setListOpen(true)}
            aria-label="Daftar & cari provinsi"
          >
            <List className="size-4" aria-hidden />
            <span className="hidden md:inline">Provinsi</span>
          </Button>
        </div>
      </header>

      {showGuide && (
        <div className="z-20 shrink-0 border-b border-accent/20 bg-accent/10 px-3 py-2 sm:px-5 sm:py-2.5">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-fg sm:text-sm">
                38 provinsi · pilih data, ketuk peta, lalu ketuk kartu untuk
                detail
              </p>
              <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
                {QUICK_METRICS.slice(0, 4).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      selectData(
                        CATEGORIES.find((c) => c.metrics.includes(item.key))!
                          .key,
                        item.key,
                      )
                    }
                    className="min-h-11 shrink-0 rounded-full border border-border bg-surface px-3 text-xs font-medium text-fg active:bg-muted"
                  >
                    {METRIC_BY_KEY[item.key].short}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="min-h-11 shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 text-xs font-medium text-accent"
                >
                  Lainnya…
                </button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0"
              onClick={dismissGuide}
              aria-label="Tutup panduan"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="z-20 hidden shrink-0 border-b border-border bg-surface/80 md:block">
        <div
          className="flex gap-1.5 overflow-x-auto px-3 py-2"
          role="tablist"
          aria-label="Bidang data"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={c.key === category}
              title={c.description}
              onClick={() => selectCategory(c.key)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                c.key === category
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border bg-surface-elevated text-muted-foreground hover:text-fg",
              )}
            >
              {c.short}
            </button>
          ))}
        </div>
        <div
          className="flex gap-1 overflow-x-auto border-t border-border/60 bg-bg/40 px-3 py-1.5"
          role="tablist"
          aria-label={`Indikator ${activeCategory.label}`}
        >
          {categoryMetrics.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={m.key === metric}
              title={m.description}
              onClick={() => setMetric(m.key)}
              className={cn(
                "min-h-11 shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                m.key === metric
                  ? "bg-surface-elevated text-fg shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-fg",
              )}
            >
              {m.short}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <aside
          className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-surface/80 lg:flex"
          aria-label="Daftar provinsi"
        >
          {adminLevel === "province" ? (
            <ProvinceList
              query={query}
              onQuery={setQuery}
              filtered={filteredProvinces}
              metric={metric}
              categoryLabel={activeCategory.short}
              selectedKey={selectedKey}
              sortAsc={sortAsc}
              palette={palette}
              historyYear={historyYear}
              historyDomain={historyDomain}
              onToggleSort={() => setSortAsc((v) => !v)}
              onSelect={handleListSelectProvince}
              onOpenDataPicker={() => setPickerOpen(true)}
              onOpenTable={() => setTableOpen(true)}
            />
          ) : (
            <RegencyList
              query={query}
              onQuery={setQuery}
              filtered={filteredRegencies}
              metric={metric}
              selectedKey={selectedKey}
              sortAsc={sortAsc}
              palette={palette}
              historyYear={historyYear}
              historyDomain={historyDomain}
              parentFilterName={parentFilterName}
              onClearParent={() => setParentFilter(null)}
              onToggleSort={() => setSortAsc((v) => !v)}
              onSelect={handleListSelectRegency}
              onOpenDataPicker={() => setPickerOpen(true)}
            />
          )}
        </aside>

        <div
          className="relative min-w-0 flex-1"
          role="region"
          aria-label={`Peta ${activeCategory.label} — ${activeMetric.label}`}
        >
          <ClientOnly fallback={<MapChunkFallback />}>
            <Suspense fallback={<MapChunkFallback />}>
              <IndonesiaMap
                metric={metric}
                selectedKey={selectedKey}
                legendClass={legendClass}
                legendHoverClass={legendHoverClass}
                palette={palette}
                historyYear={historyYear}
                adminLevel={adminLevel}
                parentFilter={parentFilter}
                onSelect={handleMapSelect}
                onHoverProvince={setHovered}
                onHoverRegency={setHoveredRegency}
                onRegencyLoadingChange={setRegencyLoading}
              />
            </Suspense>
          </ClientOnly>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex flex-col gap-1.5 px-2 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:px-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <LevelSwitcher
                level={adminLevel}
                onChange={setLevel}
                loading={regencyLoading}
              />
              {parentFilterName && (
                <button
                  type="button"
                  onClick={() => setParentFilter(null)}
                  className="pointer-events-auto inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-surface/95 px-2.5 text-[11px] font-medium text-fg shadow-md backdrop-blur-md"
                >
                  Dalam: {parentFilterName}
                  <X className="size-3 opacity-70" aria-hidden />
                </button>
              )}
            </div>

            {adminLevel === "regency" && (
              <p className="pointer-events-none rounded-lg border border-border/80 bg-surface/90 px-2.5 py-1 text-[10px] leading-snug text-muted-foreground shadow-sm backdrop-blur-md">
                Pola warna berubah di level lebih rinci (efek skala/zona · MAUP).
                Batas kab/kota disederhanakan untuk visualisasi.
              </p>
            )}

            {history.enabled && history.year != null && (
              <HistoryTimeline
                years={history.years}
                yearIndex={history.yearIndex}
                year={history.year}
                playing={history.playing}
                speed={history.speed}
                loop={history.loop}
                onTogglePlay={history.togglePlay}
                onStepPrev={history.stepPrev}
                onStepNext={history.stepNext}
                onScrub={history.scrubToIndex}
                onSpeedChange={history.setSpeed}
                onLoopChange={history.setLoop}
              />
            )}

            {preview && (
              <button
                type="button"
                className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3 py-2.5 text-left shadow-lg backdrop-blur-md active:bg-muted/40 xl:cursor-default xl:active:bg-surface/95"
                onClick={openDetailFromCard}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">
                      {preview.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {preview.metricShort}
                      {preview.unit ? ` · ${preview.unit}` : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Peringkat {preview.rank}/{preview.total}
                      {!preview.higherIsBetter && (
                        <span>
                          {" "}
                          · lebih rendah lebih baik
                        </span>
                      )}
                    </p>
                    {preview.vsMeanLabel && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {preview.vsMeanLabel}
                      </p>
                    )}
                    {selected && (
                      <button
                        type="button"
                        className="mt-1.5 text-[11px] font-medium text-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          drillIntoProvince(selected.geoKey);
                        }}
                      >
                        Lihat kab/kota di sini →
                      </button>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-base font-medium tabular-nums text-fg">
                      {preview.valueLabel}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-accent xl:hidden">
                      Ketuk untuk detail
                    </p>
                  </div>
                </div>
              </button>
            )}

            {regencyPreview && (
              <button
                type="button"
                className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3 py-2.5 text-left shadow-lg backdrop-blur-md"
                onClick={openDetailFromCard}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">
                      {regencyPreview.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {regencyPreview.parent}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {regencyPreview.metricShort}
                      {regencyPreview.unit ? ` · ${regencyPreview.unit}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-base font-medium tabular-nums text-fg">
                    {regencyPreview.valueLabel}
                  </p>
                </div>
              </button>
            )}

            <ChoroplethLegend
              metric={metric}
              activeClass={legendClass}
              hoveredClass={legendHoverClass}
              onActiveClassChange={setLegendClass}
              onHoveredClassChange={setLegendHoverClass}
              palette={palette}
              onPaletteChange={setPalettePersist}
              domain={historyDomain}
              historyYear={historyYear}
              adminLevel={adminLevel === "regency" ? "regency" : "province"}
              parentFilter={parentFilter}
            />

            <div className="hidden justify-end sm:flex">
              <DataAttribution metric={metric} />
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <PanelChunkFallback className="hidden w-[360px] shrink-0 border-l border-border xl:flex" />
          }
        >
          {adminLevel === "province" ? (
            <StatsPanel
              province={selected}
              metric={metric}
              category={category}
              onClose={() => handleMapSelect(null)}
              className="hidden w-[360px] shrink-0 xl:flex"
              historyYear={historyYear}
              historyDomain={historyDomain}
              onDrillRegency={
                selected ? () => drillIntoProvince(selected.geoKey) : undefined
              }
            />
          ) : (
            <RegencyStatsPanel
              regency={selectedRegency}
              metric={metric}
              historyYear={historyYear}
              historyDomain={historyDomain}
              onClose={() => handleMapSelect(null)}
              className="hidden w-[360px] shrink-0 xl:flex"
            />
          )}
        </Suspense>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Navigasi utama"
      >
        <div className="grid grid-cols-4">
          <DockBtn
            label="Data"
            icon={<Search className="size-5" />}
            active={pickerOpen}
            onClick={() => setPickerOpen(true)}
          />
          <DockBtn
            label="Provinsi"
            icon={<List className="size-5" />}
            active={listOpen}
            onClick={() => setListOpen(true)}
          />
          <DockBtn
            label="Tabel"
            icon={<Table2 className="size-5" />}
            active={tableOpen}
            onClick={() => setTableOpen(true)}
          />
          <DockBtn
            label="Unduh"
            icon={<Download className="size-5" />}
            active={downloadOpen}
            onClick={() => setDownloadOpen(true)}
          />
        </div>
      </nav>

      {downloadOpen && (
        <Suspense fallback={null}>
          <DownloadMenu
            filtered={
              adminLevel === "province" ? filteredProvinces : PROVINCES
            }
            all={PROVINCES}
            category={category}
            metric={metric}
            open={downloadOpen}
            onOpenChange={setDownloadOpen}
            hideTrigger
            historyYear={historyYear}
          />
        </Suspense>
      )}

      {tableOpen && adminLevel === "province" && (
        <Suspense fallback={null}>
          <AccessibleDataTable
            open={tableOpen}
            onOpenChange={setTableOpen}
            rows={filteredProvinces}
            metric={metric}
            palette={palette}
            selectedKey={selectedKey}
            onSelect={handleListSelectProvince}
            hideTrigger
            historyYear={historyYear}
            historyDomain={historyDomain}
          />
        </Suspense>
      )}

      {listOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            aria-label="Tutup daftar"
            onClick={() => setListOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-border bg-surface shadow-2xl sm:bottom-auto sm:left-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[320px] sm:rounded-none sm:rounded-r-2xl">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div>
                <h2 className="text-sm font-semibold">
                  {adminLevel === "regency" ? "Cari kab/kota" : "Cari provinsi"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Urut {activeMetric.short}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={() => setListOpen(false)}
                aria-label="Tutup"
              >
                <X className="size-4" />
              </Button>
            </div>
            {adminLevel === "province" ? (
              <ProvinceList
                query={query}
                onQuery={setQuery}
                filtered={filteredProvinces}
                metric={metric}
                categoryLabel={activeCategory.short}
                selectedKey={selectedKey}
                sortAsc={sortAsc}
                palette={palette}
                historyYear={historyYear}
                historyDomain={historyDomain}
                onToggleSort={() => setSortAsc((v) => !v)}
                onSelect={handleListSelectProvince}
                onOpenDataPicker={() => {
                  setListOpen(false);
                  setPickerOpen(true);
                }}
                onOpenTable={() => {
                  setListOpen(false);
                  setTableOpen(true);
                }}
              />
            ) : (
              <RegencyList
                query={query}
                onQuery={setQuery}
                filtered={filteredRegencies}
                metric={metric}
                selectedKey={selectedKey}
                sortAsc={sortAsc}
                palette={palette}
                historyYear={historyYear}
                historyDomain={historyDomain}
                parentFilterName={parentFilterName}
                onClearParent={() => setParentFilter(null)}
                onToggleSort={() => setSortAsc((v) => !v)}
                onSelect={handleListSelectRegency}
                onOpenDataPicker={() => {
                  setListOpen(false);
                  setPickerOpen(true);
                }}
              />
            )}
          </div>
        </div>
      )}

      {((selected && adminLevel === "province") ||
        (selectedRegency && adminLevel === "regency")) &&
        mobileStatsOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/50 backdrop-blur-sm"
            aria-label="Tutup statistik"
            onClick={() => setMobileStatsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex h-[min(78dvh,36rem)] flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
            <Suspense
              fallback={
                <PanelChunkFallback className="min-h-[12rem] flex-1" />
              }
            >
              {adminLevel === "province" ? (
                <StatsPanel
                  province={selected}
                  metric={metric}
                  category={category}
                  onClose={() => handleMapSelect(null)}
                  className="border-l-0"
                  historyYear={historyYear}
                  historyDomain={historyDomain}
                  onDrillRegency={
                    selected
                      ? () => drillIntoProvince(selected.geoKey)
                      : undefined
                  }
                />
              ) : (
                <RegencyStatsPanel
                  regency={selectedRegency}
                  metric={metric}
                  historyYear={historyYear}
                  historyDomain={historyDomain}
                  onClose={() => handleMapSelect(null)}
                  className="border-l-0"
                />
              )}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

function DockBtn({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground active:text-fg",
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          active ? "bg-accent/15 text-accent" : "",
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function ProvinceList({
  query,
  onQuery,
  filtered,
  metric,
  categoryLabel,
  selectedKey,
  sortAsc,
  palette,
  historyYear = null,
  historyDomain = null,
  onToggleSort,
  onSelect,
  onOpenDataPicker,
  onOpenTable,
}: {
  query: string;
  onQuery: (q: string) => void;
  filtered: ProvinceStats[];
  metric: MetricKey;
  categoryLabel: string;
  selectedKey: string | null;
  sortAsc: boolean;
  palette: PaletteMode;
  historyYear?: number | null;
  historyDomain?: { min: number; max: number } | null;
  onToggleSort: () => void;
  onSelect: (p: ProvinceStats) => void;
  onOpenDataPicker: () => void;
  onOpenTable: () => void;
}) {
  const m = METRIC_BY_KEY[metric];
  const colorOpts = historyDomain ? { domain: historyDomain } : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cari provinsi, ibu kota, wilayah…"
            className="h-11 pl-9"
            aria-label="Filter provinsi (38 wilayah)"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            {filtered.length} wilayah · {m.short}
            {historyYear != null ? ` · ${historyYear}` : ""}
          </p>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground active:text-fg"
          >
            {sortAsc ? (
              <ArrowUpNarrowWide className="size-3.5" />
            ) : (
              <ArrowDownWideNarrow className="size-3.5" />
            )}
            {sortAsc ? "Naik" : "Turun"}
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenDataPicker}
          className="mt-2 min-h-11 w-full rounded-lg border border-dashed border-border px-2.5 py-2 text-left text-[11px] text-muted-foreground active:border-accent/40 active:text-accent"
        >
          Data: <span className="font-medium text-fg">{m.label}</span> (
          {categoryLabel})
        </button>
        <button
          type="button"
          onClick={onOpenTable}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-muted-foreground active:text-fg"
        >
          <Table2 className="size-3.5 text-accent" aria-hidden />
          Buka tabel data (aksesibel)
        </button>
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto overscroll-contain">
        <ul className="p-2" aria-label={`Daftar provinsi menurut ${m.short}`}>
          {filtered.map((p, i) => {
            const val = resolveMetricValue(p, metric, historyYear);
            const active = selectedKey === p.geoKey;
            return (
              <li key={p.geoKey}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors active:bg-muted/80",
                    active
                      ? "bg-accent/10 ring-1 ring-accent/30"
                      : "hover:bg-muted/80",
                  )}
                >
                  <span className="w-5 shrink-0 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        val == null
                          ? "var(--color-border)"
                          : mapColorForValue(val, metric, palette, colorOpts),
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {p.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {p.capital}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {val == null ? "—" : m.format(val)}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Tidak ada provinsi yang cocok.
            </li>
          )}
        </ul>
      </div>
      <div className="border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <p className="text-[10px] leading-snug text-muted-foreground">
          {DATA_SOURCES.requiredAttribution}
        </p>
      </div>
    </div>
  );
}

function RegencyList({
  query,
  onQuery,
  filtered,
  metric,
  selectedKey,
  sortAsc,
  palette,
  historyYear = null,
  historyDomain = null,
  parentFilterName,
  onClearParent,
  onToggleSort,
  onSelect,
  onOpenDataPicker,
}: {
  query: string;
  onQuery: (q: string) => void;
  filtered: RegencyUnit[];
  metric: MetricKey;
  selectedKey: string | null;
  sortAsc: boolean;
  palette: PaletteMode;
  historyYear?: number | null;
  historyDomain?: { min: number; max: number } | null;
  parentFilterName: string | null;
  onClearParent: () => void;
  onToggleSort: () => void;
  onSelect: (r: RegencyUnit) => void;
  onOpenDataPicker: () => void;
}) {
  const m = METRIC_BY_KEY[metric];
  const colorOpts = historyDomain ? { domain: historyDomain } : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cari kab/kota atau provinsi…"
            className="h-11 pl-9"
            aria-label="Filter kab/kota"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            {filtered.length} kab/kota · {m.short}
            {historyYear != null ? ` · ${historyYear}` : ""}
          </p>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground active:text-fg"
          >
            {sortAsc ? (
              <ArrowUpNarrowWide className="size-3.5" />
            ) : (
              <ArrowDownWideNarrow className="size-3.5" />
            )}
            {sortAsc ? "Naik" : "Turun"}
          </button>
        </div>
        {parentFilterName && (
          <button
            type="button"
            onClick={onClearParent}
            className="mt-2 min-h-10 w-full rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-2 text-left text-[11px] font-medium text-accent"
          >
            Filter: {parentFilterName} · ketuk untuk hapus
          </button>
        )}
        <button
          type="button"
          onClick={onOpenDataPicker}
          className="mt-2 min-h-11 w-full rounded-lg border border-dashed border-border px-2.5 py-2 text-left text-[11px] text-muted-foreground active:border-accent/40 active:text-accent"
        >
          Data: <span className="font-medium text-fg">{m.label}</span>
          {" · "}
          level kab/kota (kemiskinan)
        </button>
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto overscroll-contain">
        <ul className="p-2" aria-label={`Daftar kab/kota menurut ${m.short}`}>
          {filtered.map((r, i) => {
            const val =
              historyYear != null
                ? getHistoryValue(r.geoKey, metric, historyYear, "regency")
                : null;
            const active = selectedKey === r.geoKey;
            return (
              <li key={r.geoKey}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors active:bg-muted/80",
                    active
                      ? "bg-accent/10 ring-1 ring-accent/30"
                      : "hover:bg-muted/80",
                  )}
                >
                  <span className="w-5 shrink-0 text-center font-mono text-[11px] tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        val == null
                          ? "var(--color-border)"
                          : mapColorForValue(val, metric, palette, colorOpts),
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {r.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {r.provinceName}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {val == null ? "—" : m.format(val)}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Tidak ada kab/kota yang cocok.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function RegencyStatsPanel({
  regency,
  metric,
  historyYear,
  historyDomain,
  onClose,
  className,
}: {
  regency: RegencyUnit | null;
  metric: MetricKey;
  historyYear: number | null;
  historyDomain: { min: number; max: number } | null;
  onClose: () => void;
  className?: string;
}) {
  if (!regency) {
    return (
      <aside
        className={cn(
          "flex h-full flex-col border-l border-border bg-surface/95",
          className,
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold text-fg">Pilih kab/kota</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ketuk peta atau daftar untuk melihat nilai multi-tahun.
          </p>
        </div>
      </aside>
    );
  }

  const m = METRIC_BY_KEY[metric];
  const value =
    historyYear != null
      ? getHistoryValue(regency.geoKey, metric, historyYear, "regency")
      : null;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-border bg-surface/95 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {regency.provinceName}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-fg">
            {regency.name}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Tutup panel"
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {m.label}
            {historyYear != null ? ` · ${historyYear}` : ""}
          </p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-fg">
            {value == null ? "—" : m.format(value)}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Visualisasi kab/kota · deret multi-tahun (bukan rilis resmi per unit)
          </p>
        </div>
        {historyDomain && (
          <p className="mt-3 text-[10px] text-muted-foreground">
            Skala deret shared: {m.format(historyDomain.min)} –{" "}
            {m.format(historyDomain.max)}
          </p>
        )}
      </div>
    </aside>
  );
}

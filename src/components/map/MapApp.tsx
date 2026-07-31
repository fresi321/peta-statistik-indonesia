import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Download,
  List,
  Map as MapIcon,
  Search,
  X,
} from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import {
  DataAttribution,
  MetricSourceLine,
} from "@/components/map/DataAttribution";
import { DownloadMenu } from "@/components/map/DownloadMenu";
import { IndonesiaMap } from "@/components/map/IndonesiaMap";
import { MetricPicker, QUICK_METRICS } from "@/components/map/MetricPicker";
import { StatsPanel } from "@/components/map/StatsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  DATA_SOURCES,
  METRIC_BY_KEY,
  PROVINCES,
  getCategory,
  getMetricValue,
  metricRange,
  metricsForCategory,
  choroplethColor,
  choroplethLegendGradient,
  normalize,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { cn } from "@/lib/utils";

const GUIDE_KEY = "psi_data_guide_dismissed_v1";

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
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const activeCategory = getCategory(category);
  const categoryMetrics = metricsForCategory(category);
  const activeMetric = METRIC_BY_KEY[metric];
  const range = metricRange(metric);

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

  const filtered = useMemo(() => {
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
      const diff = getMetricValue(a, metric) - getMetricValue(b, metric);
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [query, metric, sortAsc]);

  const handleSelect = (geoKey: string | null, stats: ProvinceStats | null) => {
    setSelectedKey(geoKey);
    setSelected(stats);
    if (stats) {
      setMobileStatsOpen(true);
      setListOpen(false);
    } else {
      setMobileStatsOpen(false);
    }
  };

  const display = hovered ?? selected;

  return (
    <div className="app-shell relative flex h-full w-full flex-col overflow-hidden">
      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-2.5 py-2 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5">
        <div className="hidden min-w-0 items-center gap-2 sm:flex">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
            <MapIcon className="size-4 text-accent" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-sm font-semibold tracking-tight text-fg sm:text-base">
              Peta Statistik
            </h1>
            <p className="hidden truncate text-[11px] text-muted-foreground md:block">
              {DATA_SOURCES.updatedAt}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-sm">
          <MetricPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            category={category}
            metric={metric}
            onSelect={selectData}
            triggerClassName="h-11 w-full max-w-none sm:h-9"
          />
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => setDownloadOpen(true)}
          >
            <Download className="size-3.5 text-accent" aria-hidden />
            <span className="hidden md:inline">Unduh</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
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
                Ketuk data di atas, lalu ketuk provinsi di peta
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
                    className="min-h-9 shrink-0 rounded-full border border-border bg-surface px-3 text-xs font-medium text-fg active:bg-muted"
                  >
                    {METRIC_BY_KEY[item.key].short}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="min-h-9 shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3 text-xs font-medium text-accent"
                >
                  Lainnya…
                </button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 shrink-0"
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
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
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
                "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
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
          <ProvinceList
            query={query}
            onQuery={setQuery}
            filtered={filtered}
            metric={metric}
            categoryLabel={activeCategory.short}
            selectedKey={selectedKey}
            sortAsc={sortAsc}
            onToggleSort={() => setSortAsc((v) => !v)}
            onSelect={(p) => handleSelect(p.geoKey, p)}
            onOpenDataPicker={() => setPickerOpen(true)}
          />
        </aside>

        <div
          className="relative min-w-0 flex-1"
          role="region"
          aria-label={`Peta ${activeCategory.label} — ${activeMetric.label}`}
        >
          <ClientOnly
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-bg px-6 text-center">
                <p className="text-sm font-medium text-fg">Memuat peta…</p>
              </div>
            }
          >
            <IndonesiaMap
              metric={metric}
              selectedKey={selectedKey}
              onSelect={handleSelect}
              onHover={setHovered}
            />
          </ClientOnly>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col gap-1.5 px-2 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs sm:px-0">
            {display && (
              <button
                type="button"
                className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3 py-2 text-left shadow-lg backdrop-blur-md active:bg-muted/40 md:pointer-events-none"
                onClick={() => {
                  setSelectedKey(display.geoKey);
                  setSelected(display);
                  setMobileStatsOpen(true);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">
                      {display.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {activeMetric.short} · ketuk untuk detail
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-base font-medium tabular-nums text-fg">
                    {activeMetric.format(getMetricValue(display, metric))}
                  </p>
                </div>
              </button>
            )}

            <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Biru
                </span>
                <div
                  className="h-2 min-w-0 flex-1 rounded-full"
                  style={{
                    background: choroplethLegendGradient(
                      activeMetric.higherIsBetter,
                    ),
                  }}
                />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Merah
                </span>
              </div>
              <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
                <span>{activeMetric.format(range.min)}</span>
                <span className="font-sans text-[10px] text-fg">
                  {activeMetric.short}
                </span>
                <span>{activeMetric.format(range.max)}</span>
              </div>
              <div className="mt-1 hidden sm:block">
                <MetricSourceLine metric={metric} />
              </div>
            </div>

            <div className="hidden justify-end sm:flex">
              <DataAttribution metric={metric} />
            </div>
          </div>
        </div>

        <StatsPanel
          province={selected}
          metric={metric}
          category={category}
          onClose={() => handleSelect(null, null)}
          className="hidden w-[360px] shrink-0 xl:flex"
        />
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Navigasi utama"
      >
        <div className="grid grid-cols-3">
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
            label="Unduh"
            icon={<Download className="size-5" />}
            active={downloadOpen}
            onClick={() => setDownloadOpen(true)}
          />
        </div>
      </nav>

      <DownloadMenu
        filtered={filtered}
        all={PROVINCES}
        category={category}
        metric={metric}
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        hideTrigger
      />

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
                <h2 className="text-sm font-semibold">Cari provinsi</h2>
                <p className="text-[11px] text-muted-foreground">
                  Urut {activeMetric.short}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={() => setListOpen(false)}
                aria-label="Tutup"
              >
                <X className="size-4" />
              </Button>
            </div>
            <ProvinceList
              query={query}
              onQuery={setQuery}
              filtered={filtered}
              metric={metric}
              categoryLabel={activeCategory.short}
              selectedKey={selectedKey}
              sortAsc={sortAsc}
              onToggleSort={() => setSortAsc((v) => !v)}
              onSelect={(p) => handleSelect(p.geoKey, p)}
              onOpenDataPicker={() => {
                setListOpen(false);
                setPickerOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {selected && mobileStatsOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/50 backdrop-blur-sm"
            aria-label="Tutup statistik"
            onClick={() => setMobileStatsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex h-[min(78dvh,36rem)] flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
            <StatsPanel
              province={selected}
              metric={metric}
              category={category}
              onClose={() => handleSelect(null, null)}
              className="border-l-0"
            />
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
  onToggleSort,
  onSelect,
  onOpenDataPicker,
}: {
  query: string;
  onQuery: (q: string) => void;
  filtered: ProvinceStats[];
  metric: MetricKey;
  categoryLabel: string;
  selectedKey: string | null;
  sortAsc: boolean;
  onToggleSort: () => void;
  onSelect: (p: ProvinceStats) => void;
  onOpenDataPicker: () => void;
}) {
  const m = METRIC_BY_KEY[metric];
  const range = metricRange(metric);

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
            placeholder="Cari nama / ibu kota…"
            className="h-11 pl-9"
            aria-label="Filter provinsi"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            {filtered.length} wilayah · {m.short}
          </p>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground active:text-fg"
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
          className="mt-2 min-h-10 w-full rounded-lg border border-dashed border-border px-2.5 py-2 text-left text-[11px] text-muted-foreground active:border-accent/40 active:text-accent"
        >
          Data: <span className="font-medium text-fg">{m.label}</span> (
          {categoryLabel})
        </button>
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto overscroll-contain">
        <ul className="p-2">
          {filtered.map((p, i) => {
            const val = getMetricValue(p, metric);
            const t = normalize(val, range.min, range.max);
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
                      background: choroplethColor(t, m.higherIsBetter),
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
                    {m.format(val)}
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

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
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
import { Badge } from "@/components/ui/badge";
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
  shortAttribution,
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

  // Default sort: for "lower is better" metrics, low values first feels natural
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
      {/* 1. Brand + primary data action */}
      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-border bg-surface/90 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated sm:size-9 sm:rounded-xl">
            <MapIcon className="size-3.5 text-accent sm:size-4" aria-hidden />
          </div>
          <div className="min-w-0 hidden xs:block sm:block">
            <h1 className="truncate font-display text-sm font-semibold tracking-tight text-fg sm:text-base">
              Peta Statistik
            </h1>
            <p className="hidden truncate text-[11px] text-muted-foreground md:block">
              {DATA_SOURCES.updatedAt} · {shortAttribution(metric)}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
          <MetricPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            category={category}
            metric={metric}
            onSelect={selectData}
            triggerClassName="w-full"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <DownloadMenu
            filtered={filtered}
            all={PROVINCES}
            category={category}
            metric={metric}
          />
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={() => setListOpen(true)}
            aria-label="Daftar & cari provinsi"
          >
            <List className="size-4" aria-hidden />
            <span className="hidden sm:inline">Provinsi</span>
          </Button>
        </div>
      </header>

      {/* 2. Guided first-run + category context */}
      {showGuide && (
        <div className="z-20 shrink-0 border-b border-accent/20 bg-accent/10 px-3 py-2.5 sm:px-5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-fg">
                Mulai: pilih data yang ingin Anda lihat di peta
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Gunakan kotak <strong className="text-fg">Cari & pilih data</strong>{" "}
                di atas, atau ketuk pintasan di bawah. Lalu klik provinsi untuk
                detail.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_METRICS.slice(0, 5).map((item) => (
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
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-fg hover:border-accent/40 hover:text-accent"
                  >
                    {METRIC_BY_KEY[item.key].short}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                >
                  Semua data…
                </button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={dismissGuide}
              aria-label="Tutup panduan"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 3. Category filter (what domain) then metrics in that domain */}
      <div className="z-20 shrink-0 border-b border-border bg-surface/80">
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
          <span className="mr-1 hidden shrink-0 self-center text-[10px] text-muted-foreground sm:inline">
            Indikator:
          </span>
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
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="ml-auto shrink-0 self-center text-[11px] font-medium text-accent hover:underline"
          >
            Cari data
          </button>
        </div>
      </div>

      {/* 4. Status strip — what am I looking at? */}
      <div className="z-20 flex shrink-0 items-center gap-2 border-b border-border bg-surface-elevated/50 px-3 py-1.5 text-[11px] sm:px-4">
        <Badge variant="accent" className="shrink-0">
          {activeMetric.short}
        </Badge>
        <span className="min-w-0 truncate text-muted-foreground">
          <span className="text-fg">{activeMetric.label}</span>
          <span className="hidden sm:inline">
            {" "}
            · {activeCategory.label} ·{" "}
            biru = nilai lebih rendah · merah = nilai lebih tinggi
          </span>
        </span>
        <button
          type="button"
          className="ml-auto shrink-0 font-medium text-accent hover:underline"
          onClick={() => setPickerOpen(true)}
        >
          Ganti
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1">
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

          {/* Empty-state CTA when nothing selected */}
          {!display && !showGuide && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-10 w-[min(100%-1.5rem,20rem)] -translate-x-1/2 rounded-xl border border-border bg-surface/90 px-3 py-2 text-center shadow-lg backdrop-blur-md">
              <p className="text-xs text-muted-foreground">
                Peta menampilkan{" "}
                <strong className="text-fg">{activeMetric.label}</strong>.
                Klik wilayah atau buka daftar provinsi.
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-4 left-3 right-3 z-10 flex flex-col gap-2 sm:bottom-6 sm:left-4 sm:right-auto sm:max-w-xs">
            {display && (
              <div className="pointer-events-none rounded-xl border border-border bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">
                      {display.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {display.region}
                    </p>
                  </div>
                  <Badge variant="accent">{activeMetric.short}</Badge>
                </div>
                <p className="mt-1.5 font-mono text-lg font-medium tabular-nums text-fg">
                  {activeMetric.format(getMetricValue(display, metric))}
                </p>
                <MetricSourceLine metric={metric} className="mt-1" />
              </div>
            )}

            <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3.5 py-3 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Skala {activeMetric.short}
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-[10px] font-medium text-accent hover:underline"
                >
                  Ganti data
                </button>
              </div>
              <div
                className="mt-2 h-2.5 w-full rounded-full"
                style={{
                  background: choroplethLegendGradient(
                    activeMetric.higherIsBetter,
                  ),
                }}
              />
              <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
                <span>{activeMetric.format(range.min)}</span>
                <span>{activeMetric.format(range.max)}</span>
              </div>
              <MetricSourceLine metric={metric} className="mt-2" />
            </div>

            <div className="flex justify-end">
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

      {listOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            aria-label="Tutup daftar"
            onClick={() => setListOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[78dvh] flex-col rounded-t-2xl border border-border bg-surface shadow-2xl sm:bottom-auto sm:left-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[320px] sm:rounded-none sm:rounded-r-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Cari provinsi</h2>
                <p className="text-[11px] text-muted-foreground">
                  Diurutkan by {activeMetric.short}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
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
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            aria-label="Tutup statistik"
            onClick={() => setMobileStatsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 flex h-[82dvh] flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
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
            className="pl-9"
            aria-label="Filter provinsi"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            {filtered.length} wilayah · {m.short}
            {query.trim() ? " · filter" : ""}
          </p>
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-fg"
            title={
              sortAsc
                ? "Urutan: rendah → tinggi"
                : "Urutan: tinggi → rendah"
            }
          >
            {sortAsc ? (
              <ArrowUpNarrowWide className="size-3" />
            ) : (
              <ArrowDownWideNarrow className="size-3" />
            )}
            {sortAsc ? "Naik" : "Turun"}
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenDataPicker}
          className="mt-2 w-full rounded-lg border border-dashed border-border px-2 py-1.5 text-left text-[11px] text-muted-foreground hover:border-accent/40 hover:text-accent"
        >
          Data aktif: <span className="font-medium text-fg">{m.label}</span> (
          {categoryLabel}) — ketuk untuk ganti
        </button>
        <MetricSourceLine metric={metric} className="mt-1.5" />
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto">
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
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
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
              Tidak ada provinsi yang cocok. Ubah kata kunci.
            </li>
          )}
        </ul>
      </div>
      <div className="border-t border-border px-3 py-2">
        <p className="text-[10px] leading-snug text-muted-foreground">
          {DATA_SOURCES.requiredAttribution}
        </p>
      </div>
    </div>
  );
}

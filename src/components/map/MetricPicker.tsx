import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Sparkles, X } from "lucide-react";
import {
  CATEGORIES,
  METRIC_BY_KEY,
  METRICS,
  getCategory,
  shortAttribution,
  type CategoryKey,
  type MetricKey,
} from "@/data/province-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** High-intent shortcuts for first-time discovery */
export const QUICK_METRICS: { key: MetricKey; reason: string }[] = [
  { key: "stunting", reason: "Prevalensi stunting" },
  { key: "disasterEvents", reason: "Kejadian bencana" },
  { key: "voterTurnout", reason: "Partisipasi pemilu" },
  { key: "tkddPerCapita", reason: "Transfer daerah" },
  { key: "ump", reason: "Upah minimum kerja" },
  { key: "population", reason: "Berapa penduduk?" },
  { key: "inflation", reason: "Kenaikan harga" },
  { key: "hdi", reason: "Indeks pembangunan" },
  { key: "poverty", reason: "Tingkat kemiskinan" },
  { key: "gdpPerCapita", reason: "Kekayaan daerah" },
];

function categoryForMetric(key: MetricKey): CategoryKey {
  for (const c of CATEGORIES) {
    if (c.metrics.includes(key)) return c.key;
  }
  return "demografi";
}

export function searchMetrics(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return METRICS;
  return METRICS.filter((m) => {
    const cat = getCategory(categoryForMetric(m.key));
    const hay = [
      m.label,
      m.short,
      m.description,
      m.unit,
      cat.label,
      cat.short,
      cat.description,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((w) => hay.includes(w));
  });
}

type MetricPickerProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: CategoryKey;
  metric: MetricKey;
  onSelect: (category: CategoryKey, metric: MetricKey) => void;
  triggerClassName?: string;
};

export function MetricPicker({
  open,
  onOpenChange,
  category,
  metric,
  onSelect,
  triggerClassName,
}: MetricPickerProps) {
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState<CategoryKey | "all">("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const active = METRIC_BY_KEY[metric];
  const activeCat = getCategory(category);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setFilterCat("all");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    let list = searchMetrics(q);
    if (filterCat !== "all") {
      const keys = new Set(getCategory(filterCat).metrics);
      list = list.filter((m) => keys.has(m.key));
    }
    return list;
  }, [q, filterCat]);

  const grouped = useMemo(() => {
    return CATEGORIES.map((c) => ({
      cat: c,
      items: results.filter((m) => c.metrics.includes(m.key)),
    })).filter((g) => g.items.length > 0);
  }, [results]);

  const pick = (key: MetricKey) => {
    onSelect(categoryForMetric(key), key);
    onOpenChange(false);
  };

  const dialog =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
            <button
              type="button"
              className="absolute inset-0 bg-bg/75 backdrop-blur-sm"
              aria-label="Tutup pemilih data"
              onClick={() => onOpenChange(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative flex h-[min(88dvh,36rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl"
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                  <h2 id={titleId} className="text-sm font-semibold text-fg">
                    Cari & pilih data peta
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Ketik topik (UMP, padi, Gini…) atau pilih pintasan
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  aria-label="Tutup"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="shrink-0 border-b border-border px-4 py-3">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari: upah, inflasi, penduduk, wisata…"
                    className="pl-9"
                    aria-label="Cari indikator statistik"
                  />
                </div>

                {!q && (
                  <div className="mt-3">
                    <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="size-3 text-accent" aria-hidden />
                      Sering dicari
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_METRICS.map((item) => {
                        const m = METRIC_BY_KEY[item.key];
                        const on = item.key === metric;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => pick(item.key)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-left text-xs transition-colors",
                              on
                                ? "border-accent/40 bg-accent/15 text-accent"
                                : "border-border bg-surface-elevated text-fg hover:border-border-strong",
                            )}
                          >
                            <span className="font-medium">{m.short}</span>
                            <span className="ml-1 text-muted-foreground">
                              · {item.reason}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5"
                  role="tablist"
                  aria-label="Filter kategori"
                >
                  <FilterChip
                    active={filterCat === "all"}
                    onClick={() => setFilterCat("all")}
                    label="Semua"
                  />
                  {CATEGORIES.map((c) => (
                    <FilterChip
                      key={c.key}
                      active={filterCat === c.key}
                      onClick={() => setFilterCat(c.key)}
                      label={c.short}
                    />
                  ))}
                </div>
              </div>

              <div className="panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
                {grouped.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Tidak ada indikator cocok untuk “{q}”. Coba kata lain.
                  </p>
                ) : (
                  grouped.map(({ cat, items }) => (
                    <div key={cat.key} className="mb-3">
                      <p className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {cat.label}
                        <span className="ml-1 font-normal normal-case tracking-normal">
                          — {cat.description}
                        </span>
                      </p>
                      <ul>
                        {items.map((m) => {
                          const on = m.key === metric;
                          return (
                            <li key={m.key}>
                              <button
                                type="button"
                                onClick={() => pick(m.key)}
                                className={cn(
                                  "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                                  on
                                    ? "bg-accent/10 ring-1 ring-accent/30"
                                    : "hover:bg-muted/70",
                                )}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-fg">
                                      {m.label}
                                    </span>
                                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                      {m.short}
                                    </span>
                                  </span>
                                  <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {m.description}
                                    {m.unit ? ` · ${m.unit}` : ""}
                                  </span>
                                  <span className="mt-0.5 block text-[10px] text-accent/90">
                                    {shortAttribution(m.key)}
                                     · biru→merah = rendah→tinggi
                                  </span>
                                </span>
                                {on && (
                                  <span className="shrink-0 text-[10px] font-medium text-accent">
                                    Aktif
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
                Sedang ditampilkan:{" "}
                <strong className="text-fg">{active.label}</strong> (
                {activeCat.label})
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn(
          "min-w-0 max-w-[min(100%,16rem)] justify-start gap-2 border-accent/25 bg-accent/10 text-fg hover:bg-accent/15",
          triggerClassName,
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(true)}
      >
        <Search className="size-3.5 shrink-0 text-accent" aria-hidden />
        <span className="min-w-0 truncate text-left">
          <span className="block truncate text-xs font-semibold">
            {active.short}
          </span>
          <span className="block truncate text-[10px] font-normal text-muted-foreground">
            {activeCat.short} · ganti data
          </span>
        </span>
      </Button>
      {dialog}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-border bg-bg/50 text-muted-foreground hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}

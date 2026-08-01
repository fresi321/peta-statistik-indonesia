import { useEffect, useState } from "react";
import { ChevronDown, Contrast, X } from "lucide-react";
import { MetricSourceLine } from "@/components/map/DataAttribution";
import {
  METRIC_BY_KEY,
  metricRange,
  type MetricKey,
} from "@/data/province-stats";
import {
  choroplethLegendGradient,
  paletteLabel,
  type PaletteMode,
} from "@/lib/map-colors";
import {
  LEGEND_CLASS_COUNT,
  classBounds,
  classColor,
  classProvinceCount,
} from "@/lib/map-legend";
import { historyMeanForYear, hasHistory } from "@/lib/history-access";
import {
  metricMean,
  scaleKindForMetric,
} from "@/lib/map-scale";
import { cn } from "@/lib/utils";

export type ChoroplethLegendProps = {
  metric: MetricKey;
  activeClass: number | null;
  hoveredClass: number | null;
  onActiveClassChange: (index: number | null) => void;
  onHoveredClassChange: (index: number | null) => void;
  palette: PaletteMode;
  onPaletteChange: (mode: PaletteMode) => void;
  /** Shared multi-year domain when history playback is active. */
  domain?: { min: number; max: number } | null;
  /** Active history year for class counts / mean. */
  historyYear?: number | null;
  adminLevel?: "province" | "regency";
  parentFilter?: string | null;
};

export function ChoroplethLegend({
  metric,
  activeClass,
  hoveredClass,
  onActiveClassChange,
  onHoveredClassChange,
  palette,
  onPaletteChange,
  domain = null,
  historyYear = null,
  adminLevel = "province",
  parentFilter = null,
}: ChoroplethLegendProps) {
  const m = METRIC_BY_KEY[metric];
  const range = domain ?? metricRange(metric);
  const kind = scaleKindForMetric(metric);
  const mean =
    historyYear != null && hasHistory(metric, adminLevel)
      ? (historyMeanForYear(metric, historyYear, adminLevel) ??
        metricMean(metric))
      : metricMean(metric);
  const [expanded, setExpanded] = useState(false);
  const domainOrUndef = domain ?? undefined;

  useEffect(() => {
    setExpanded(false);
  }, [metric]);

  const toggleClass = (index: number) => {
    onActiveClassChange(activeClass === index ? null : index);
  };

  const clear = () => {
    onActiveClassChange(null);
    onHoveredClassChange(null);
  };

  const bins = Array.from({ length: LEGEND_CLASS_COUNT }, (_, i) => {
    const b = classBounds(metric, i, domainOrUndef);
    const count = classProvinceCount(
      metric,
      i,
      domainOrUndef,
      historyYear,
      { level: adminLevel, parentFilter },
    );
    return {
      index: i,
      color: classColor(i, metric, palette, domainOrUndef),
      label: `${m.format(b.valueMin)} – ${m.format(b.valueMax)}`,
      count,
    };
  });

  const showSegments = expanded || activeClass !== null;
  const gradient = choroplethLegendGradient(m.higherIsBetter, {
    kind,
    palette,
  });

  return (
    <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium text-fg">
              {m.short}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {kind === "diverging" ? "diverging" : "sequential"}
                {domain != null && historyYear != null
                  ? ` · ${historyYear}`
                  : ""}
              </span>
            </p>
            {activeClass !== null && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-accent active:bg-muted sm:min-h-8 sm:min-w-0 sm:px-1.5"
                aria-label="Hapus filter kelas"
              >
                <X className="size-3.5 sm:size-3" aria-hidden />
                <span className="hidden sm:inline">Semua</span>
              </button>
            )}
          </div>
          <div className="mt-0.5 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
            <span>{m.format(range.min)}</span>
            {kind === "diverging" ? (
              <span className="font-sans text-[9px] text-fg/80">
                μ {m.format(mean)}
              </span>
            ) : (
              <span className="font-sans text-[10px] text-fg">{m.short}</span>
            )}
            <span>{m.format(range.max)}</span>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground active:bg-muted sm:hidden"
          aria-expanded={showSegments}
          aria-label={showSegments ? "Ciutkan legenda" : "Perluas legenda filter"}
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              showSegments && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </div>

      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full ring-1 ring-border/60 sm:h-2.5"
        style={{ background: gradient }}
        aria-hidden
      />

      {kind === "diverging" && (
        <p className="mt-1 text-[9px] leading-snug text-muted-foreground">
          Tengah = rata-rata nasional · kiri di bawah · kanan di atas
        </p>
      )}

      <div
        className={cn(
          "mt-2 gap-1",
          showSegments ? "flex" : "hidden",
          "sm:flex",
        )}
        role="group"
        aria-label="Filter kelas warna peta"
      >
        {bins.map((bin) => {
          const pressed = activeClass === bin.index;
          const preview = hoveredClass === bin.index;
          return (
            <button
              key={bin.index}
              type="button"
              aria-pressed={pressed}
              title={`${bin.label} · ${bin.count} provinsi`}
              onClick={() => toggleClass(bin.index)}
              onMouseEnter={() => onHoveredClassChange(bin.index)}
              onMouseLeave={() => onHoveredClassChange(null)}
              onFocus={() => onHoveredClassChange(bin.index)}
              onBlur={() => onHoveredClassChange(null)}
              className={cn(
                "min-h-11 min-w-0 flex-1 rounded-lg border px-0.5 py-1 transition-[box-shadow,opacity,transform] active:scale-[0.98] sm:min-h-10",
                pressed
                  ? "border-fg/40 ring-2 ring-fg/25"
                  : preview
                    ? "border-accent/50 ring-1 ring-accent/30"
                    : "border-border/80 hover:border-border-strong",
                activeClass !== null && !pressed && "opacity-55",
              )}
            >
              <span
                className="mx-auto block h-3 w-full max-w-[2.5rem] rounded-sm sm:h-3.5"
                style={{ background: bin.color }}
              />
              <span className="mt-0.5 block text-center text-[9px] tabular-nums text-muted-foreground">
                {bin.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeClass !== null && (
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
          Filter kelas {activeClass + 1}:{" "}
          <span className="text-fg">{bins[activeClass]?.label ?? ""}</span>
          {" · "}
          {bins[activeClass]?.count ?? 0} provinsi
        </p>
      )}

      {!showSegments && activeClass === null && (
        <p className="mt-1 text-[10px] text-muted-foreground sm:hidden">
          Perluas untuk filter rentang warna
        </p>
      )}

      <div className="mt-2 flex items-center gap-2 border-t border-border/70 pt-2">
        <button
          type="button"
          onClick={() =>
            onPaletteChange(palette === "default" ? "colorblind" : "default")
          }
          className={cn(
            "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-medium transition-colors sm:min-h-9",
            palette === "colorblind"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-border bg-surface-elevated text-muted-foreground hover:text-fg",
          )}
          aria-pressed={palette === "colorblind"}
          title="Ganti ke palet aman buta warna (ColorBrewer)"
        >
          <Contrast className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{paletteLabel(palette)}</span>
        </button>
      </div>

      <div className="mt-1.5 hidden sm:block">
        <MetricSourceLine metric={metric} />
      </div>
    </div>
  );
}

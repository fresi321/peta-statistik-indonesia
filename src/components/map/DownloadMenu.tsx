import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, FileJson, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportData,
  type ExportFormat,
  type ExportMode,
} from "@/lib/export-data";
import {
  DATA_SOURCES,
  METRIC_BY_KEY,
  getCategory,
  shortAttribution,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { cn } from "@/lib/utils";

type Scope = "filtered" | "all";

interface DownloadMenuProps {
  filtered: ProvinceStats[];
  all: ProvinceStats[];
  category: CategoryKey;
  metric: MetricKey;
  className?: string;
  /** Controlled open (for mobile dock) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide built-in trigger button */
  hideTrigger?: boolean;
}

export function DownloadMenu({
  filtered,
  all,
  category,
  metric,
  className,
  open: openProp,
  onOpenChange,
  hideTrigger,
}: DownloadMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (openProp === undefined) setInternalOpen(v);
  };

  const [scope, setScope] = useState<Scope>("filtered");
  const [mode, setMode] = useState<ExportMode>("category");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const cat = getCategory(category);
  const m = METRIC_BY_KEY[metric];
  const count = scope === "filtered" ? filtered.length : all.length;
  const isFiltered = filtered.length < all.length;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setScope(isFiltered ? "filtered" : "all");
  }, [isFiltered]);

  const handleDownload = () => {
    const provinces = scope === "filtered" ? filtered : all;
    const result = exportData({
      provinces,
      mode,
      format,
      category,
      metric,
    });
    if (!result.ok) {
      setToast("Tidak ada data untuk diunduh");
      return;
    }
    setToast(`Diunduh: ${result.filename} (${result.count} provinsi)`);
    setOpen(false);
  };

  const panel = open && mounted
    ? createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-start sm:justify-end sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-bg/50 backdrop-blur-[2px]"
            aria-label="Tutup unduh data"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-label="Unduh data statistik"
            className="relative z-10 flex max-h-[min(88dvh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:mt-14 sm:max-h-[min(80dvh,32rem)] sm:rounded-2xl"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
            <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-fg">Unduh data</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Menyertakan atribusi sumber BPS
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="panel-scroll min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-3">
              <fieldset>
                <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Cakupan wilayah
                </legend>
                <div className="grid grid-cols-2 gap-1.5">
                  <ScopeBtn
                    active={scope === "filtered"}
                    onClick={() => setScope("filtered")}
                    label={isFiltered ? `Hasil filter` : "Daftar aktif"}
                    hint={`${filtered.length} provinsi`}
                  />
                  <ScopeBtn
                    active={scope === "all"}
                    onClick={() => setScope("all")}
                    label="Semua"
                    hint={`${all.length} provinsi`}
                  />
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Kolom data
                </legend>
                <div className="flex flex-col gap-1">
                  <ModeBtn
                    active={mode === "metric"}
                    onClick={() => setMode("metric")}
                    title={`Indikator: ${m.short}`}
                    desc={`${m.label} · ${shortAttribution(metric)}`}
                  />
                  <ModeBtn
                    active={mode === "category"}
                    onClick={() => setMode("category")}
                    title={`Kategori: ${cat.short}`}
                    desc={`${cat.metrics.length} indikator ${cat.label.toLowerCase()}`}
                  />
                  <ModeBtn
                    active={mode === "full"}
                    onClick={() => setMode("full")}
                    title="Semua indikator"
                    desc="Semua kategori digabung"
                  />
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Format
                </legend>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormatBtn
                    active={format === "csv"}
                    onClick={() => setFormat("csv")}
                    icon={<FileSpreadsheet className="size-3.5" />}
                    label="CSV"
                    desc="Excel + # sumber"
                  />
                  <FormatBtn
                    active={format === "json"}
                    onClick={() => setFormat("json")}
                    icon={<FileJson className="size-3.5" />}
                    label="JSON"
                    desc="attribution[]"
                  />
                </div>
              </fieldset>
            </div>

            <div className="shrink-0 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button className="h-11 w-full gap-2" onClick={handleDownload}>
                <Download className="size-4" aria-hidden />
                Unduh {count} provinsi · {format.toUpperCase()}
              </Button>
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                {DATA_SOURCES.requiredAttribution}
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {!hideTrigger && (
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          aria-expanded={open}
          aria-controls={panelId}
          aria-haspopup="dialog"
          onClick={() => setOpen(!open)}
        >
          <Download className="size-3.5 text-accent" aria-hidden />
          <span className="hidden sm:inline">Unduh</span>
        </Button>
      )}
      {panel}
      {toast &&
        mounted &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-20 left-1/2 z-[80] max-w-[90vw] -translate-x-1/2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-fg shadow-xl sm:bottom-4 sm:left-auto sm:right-4 sm:translate-x-0"
          >
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5 text-accent" aria-hidden />
              {toast}
            </span>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ScopeBtn({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-lg border px-2.5 py-2 text-left transition-colors",
        active
          ? "border-accent/40 bg-accent/10 text-fg"
          : "border-border bg-bg/40 text-muted-foreground hover:text-fg",
      )}
    >
      <span className="block text-xs font-medium">{label}</span>
      <span className="mt-0.5 block text-[10px] opacity-80">{hint}</span>
    </button>
  );
}

function ModeBtn({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-start gap-2 rounded-lg border px-2.5 py-2.5 text-left transition-colors",
        active
          ? "border-accent/40 bg-accent/10"
          : "border-border bg-bg/40 hover:border-border-strong",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
          active
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border",
        )}
        aria-hidden
      >
        {active && <Check className="size-2.5" />}
      </span>
      <span>
        <span className="block text-xs font-medium text-fg">{title}</span>
        <span className="block text-[10px] text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

function FormatBtn({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
        active
          ? "border-accent/40 bg-accent/10 text-fg"
          : "border-border bg-bg/40 text-muted-foreground hover:text-fg",
      )}
    >
      <span className={cn(active ? "text-accent" : "")}>{icon}</span>
      <span>
        <span className="block text-xs font-medium">{label}</span>
        <span className="block text-[10px] opacity-80">{desc}</span>
      </span>
    </button>
  );
}

import { useMemo } from "react";
import { Table2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  METRIC_BY_KEY,
  getMetricValue,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { provinceRank } from "@/lib/map-legend";
import { mapColorForValue } from "@/lib/map-scale";
import type { PaletteMode } from "@/lib/map-colors";
import { cn } from "@/lib/utils";

type AccessibleDataTableProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: ProvinceStats[];
  metric: MetricKey;
  palette: PaletteMode;
  selectedKey: string | null;
  onSelect: (p: ProvinceStats) => void;
  /** Compact trigger button for toolbars */
  triggerClassName?: string;
  hideTrigger?: boolean;
};

export function AccessibleDataTable({
  open,
  onOpenChange,
  rows,
  metric,
  palette,
  selectedKey,
  onSelect,
  triggerClassName,
  hideTrigger,
}: AccessibleDataTableProps) {
  const m = METRIC_BY_KEY[metric];

  const tableRows = useMemo(() => {
    return rows.map((p, i) => {
      const value = getMetricValue(p, metric);
      const { rank } = provinceRank(p.geoKey, metric);
      return {
        province: p,
        value,
        rank,
        // display order rank in current sorted list
        listIndex: i + 1,
        color: mapColorForValue(value, metric, palette),
      };
    });
  }, [rows, metric, palette]);

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-fg active:bg-muted",
            triggerClassName,
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Table2 className="size-3.5 text-accent" aria-hidden />
          Tabel data
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
            aria-label="Tutup tabel data"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-table-title"
            className="absolute bottom-0 left-0 right-0 flex max-h-[88dvh] flex-col rounded-t-2xl border border-border bg-surface shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(80dvh,40rem)] sm:w-[min(36rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <h2
                  id="data-table-title"
                  className="text-sm font-semibold text-fg"
                >
                  Tabel {m.label}
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {rows.length} provinsi · nilai, peringkat, dan wilayah — alternatif
                  non-visual ke peta warna
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                onClick={() => onOpenChange(false)}
                aria-label="Tutup"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="panel-scroll min-h-0 flex-1 overflow-auto overscroll-contain">
              <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  {m.label} per provinsi Indonesia. Kolom: peringkat daftar, nama
                  provinsi, wilayah, nilai {m.short}
                  {m.unit ? ` dalam ${m.unit}` : ""}, dan peringkat nasional (1 =
                  nilai tertinggi).
                </caption>
                <thead className="sticky top-0 z-[1] bg-surface">
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      #
                    </th>
                    <th scope="col" className="px-2 py-2.5 font-medium">
                      Provinsi
                    </th>
                    <th
                      scope="col"
                      className="hidden px-2 py-2.5 font-medium sm:table-cell"
                    >
                      Wilayah
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2.5 text-right font-medium"
                    >
                      {m.short}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2.5 text-right font-medium"
                    >
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const active = selectedKey === row.province.geoKey;
                    return (
                      <tr
                        key={row.province.geoKey}
                        className={cn(
                          "border-b border-border/70 transition-colors",
                          active ? "bg-accent/10" : "hover:bg-muted/60",
                        )}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                          {row.listIndex}
                        </td>
                        <th
                          scope="row"
                          className="px-2 py-2.5 font-medium text-fg"
                        >
                          <button
                            type="button"
                            className="inline-flex min-h-11 w-full items-center gap-2 text-left"
                            onClick={() => {
                              onSelect(row.province);
                              onOpenChange(false);
                            }}
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full ring-1 ring-border"
                              style={{ background: row.color }}
                              aria-hidden
                            />
                            <span className="min-w-0">
                              <span className="block truncate">
                                {row.province.name}
                              </span>
                              <span className="block truncate text-[11px] font-normal text-muted-foreground sm:hidden">
                                {row.province.region}
                              </span>
                            </span>
                          </button>
                        </th>
                        <td className="hidden px-2 py-2.5 text-xs text-muted-foreground sm:table-cell">
                          {row.province.region}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-fg">
                          {m.format(row.value)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.rank}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border px-4 py-2.5 text-[10px] leading-snug text-muted-foreground">
              Warna titik mengikuti legenda peta (bukan satu-satunya penanda).{" "}
              {m.higherIsBetter
                ? "Nilai lebih tinggi umumnya lebih baik."
                : "Nilai lebih rendah umumnya lebih baik."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

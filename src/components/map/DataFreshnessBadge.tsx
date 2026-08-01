import { Clock } from "lucide-react";
import {
  freshnessToneClass,
  globalFreshness,
  metricFreshness,
} from "@/lib/data-attribution";
import type { MetricKey } from "@/data/province-stats";
import { cn } from "@/lib/utils";

export function DataFreshnessBadge({
  metric,
  className,
  compact,
  historyYear,
}: {
  metric?: MetricKey;
  className?: string;
  compact?: boolean;
  /** When set, show the active history frame year. */
  historyYear?: number | null;
}) {
  const global = globalFreshness();
  const metricInfo = metric ? metricFreshness(metric) : null;
  const yearLabel =
    historyYear != null
      ? String(historyYear)
      : metricInfo?.year ?? null;

  return (
    <div
      className={cn(
        "inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium tabular-nums",
        freshnessToneClass(global.tone),
        className,
      )}
      title={
        metricInfo
          ? `${global.title} Indikator: ${metricInfo.shortName} (${yearLabel ?? metricInfo.year}) · ${metricInfo.cadence}${
              historyYear != null ? " · frame historis" : ""
            }`
          : global.title
      }
    >
      <Clock className="size-3 shrink-0 opacity-80" aria-hidden />
      {compact ? (
        <span className="truncate">
          {historyYear != null ? (
            <>
              {historyYear}
              <span className="opacity-80"> · historis</span>
            </>
          ) : (
            <>
              {global.iso}
              <span className="opacity-80"> · {global.label}</span>
            </>
          )}
        </span>
      ) : (
        <span className="min-w-0 truncate">
          Data {global.iso}
          <span className="opacity-80"> · {global.label}</span>
          {yearLabel && (
            <span className="opacity-90">
              {" "}
              · {yearLabel}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

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
}: {
  metric?: MetricKey;
  className?: string;
  compact?: boolean;
}) {
  const global = globalFreshness();
  const metricInfo = metric ? metricFreshness(metric) : null;

  return (
    <div
      className={cn(
        "inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium tabular-nums",
        freshnessToneClass(global.tone),
        className,
      )}
      title={
        metricInfo
          ? `${global.title} Indikator: ${metricInfo.shortName} (${metricInfo.year}) · ${metricInfo.cadence}`
          : global.title
      }
    >
      <Clock className="size-3 shrink-0 opacity-80" aria-hidden />
      {compact ? (
        <span className="truncate">
          {global.iso}
          <span className="opacity-80"> · {global.label}</span>
        </span>
      ) : (
        <span className="min-w-0 truncate">
          Data {global.iso}
          <span className="opacity-80"> · {global.label}</span>
          {metricInfo && (
            <span className="opacity-90">
              {" "}
              · {metricInfo.year}
            </span>
          )}
        </span>
      )}
    </div>
  );
}

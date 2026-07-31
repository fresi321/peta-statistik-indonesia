import { useState } from "react";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";
import {
  DATA_SOURCES,
  primarySourceForMetric,
  reliabilityLabel,
  shortAttribution,
  type MetricKey,
} from "@/data/province-stats";
import { cn } from "@/lib/utils";

/** Compact always-visible source line for the active metric. */
export function MetricSourceLine({
  metric,
  className,
}: {
  metric: MetricKey;
  className?: string;
}) {
  const src = primarySourceForMetric(metric);
  return (
    <p
      className={cn(
        "text-[10px] leading-snug text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium text-fg/80">Sumber: </span>
      <a
        href={src.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:text-accent hover:underline"
      >
        {src.shortName}
      </a>
      <span>
        {" "}
        ({src.year} · {reliabilityLabel(src.reliability)})
      </span>
    </p>
  );
}

export function DataAttribution({
  metric,
  className,
}: {
  metric?: MetricKey;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = metric ? primarySourceForMetric(metric) : null;

  return (
    <div className={cn("pointer-events-auto", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface/95 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-md backdrop-blur-md transition-colors hover:text-fg"
        aria-expanded={open}
      >
        <BookOpen className="size-3 shrink-0 text-accent" aria-hidden />
        <span className="truncate">
          {active
            ? `Sumber: ${active.shortName}`
            : "Sumber data"}
        </span>
        <ChevronDown
          className={cn(
            "size-3 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Tutup sumber data"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Sumber data statistik"
            className="absolute bottom-full right-0 z-50 mb-2 w-[min(100vw-1.5rem,24rem)] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-xl"
          >
            <div className="border-b border-border px-3.5 py-2.5">
              <p className="text-sm font-semibold text-fg">Sumber & atribusi</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {DATA_SOURCES.requiredAttribution}
              </p>
              {metric && (
                <p className="mt-1.5 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-fg">
                  Indikator aktif: <strong>{shortAttribution(metric)}</strong>
                </p>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">
                Diperbarui {DATA_SOURCES.updatedAt} · {DATA_SOURCES.coverageNote}
              </p>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {DATA_SOURCES.sources.map((s) => {
                const isActive =
                  metric &&
                  (s.fields as readonly MetricKey[]).includes(metric);
                return (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted",
                        isActive && "bg-accent/10 ring-1 ring-accent/25",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-fg">
                          {s.name}
                          <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                        </span>
                        <span className="mt-0.5 block text-[10px] text-muted-foreground">
                          {s.year} · {reliabilityLabel(s.reliability)}
                        </span>
                        <span className="mt-1 block text-[10px] leading-snug text-muted-foreground/90">
                          {s.citation}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-border px-3.5 py-2.5 text-[10px] leading-relaxed text-muted-foreground">
              {DATA_SOURCES.disclaimer}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

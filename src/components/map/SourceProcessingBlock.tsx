import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  DATA_SOURCES,
  METRIC_BY_KEY,
  copyableCitation,
  getSourcesForMetric,
  primarySourceForMetric,
  reliabilityLabel,
  type MetricKey,
} from "@/data/province-stats";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function SourceProcessingBlock({
  metric,
  className,
  compact,
}: {
  metric: MetricKey;
  className?: string;
  compact?: boolean;
}) {
  const m = METRIC_BY_KEY[metric];
  const primary = primarySourceForMetric(metric);
  const all = getSourcesForMetric(metric);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = copyableCitation(metric, absoluteUrl("/"));
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      className={cn("rounded-xl border border-border bg-bg/40", className)}
      aria-labelledby={`sumber-proses-${metric}`}
    >
      <div className="border-b border-border px-3 py-2.5">
        <h3
          id={`sumber-proses-${metric}`}
          className="text-sm font-semibold text-fg"
        >
          Sumber & pemrosesan
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {m.label} · kredit ganda (sumber asli + pengolah)
        </p>
      </div>

      <div className="space-y-3 px-3 py-3 text-[12px] leading-relaxed">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Diproses oleh
          </p>
          <p className="mt-0.5 text-fg">
            {DATA_SOURCES.processorName}
            <span className="text-muted-foreground">
              {" "}
              · dataset app {DATA_SOURCES.updatedAt}
            </span>
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sumber asli
          </p>
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 font-medium text-fg hover:text-accent"
          >
            {primary.name}
            <ExternalLink className="size-3 shrink-0" aria-hidden />
          </a>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {primary.year} · {reliabilityLabel(primary.reliability)} ·{" "}
            {primary.updateCadence}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Pemrosesan
          </p>
          <p className="mt-0.5 text-muted-foreground">{primary.processingNote}</p>
        </div>

        {!compact && all.length > 1 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Sumber terkait
            </p>
            <ul className="mt-1 space-y-1">
              {all
                .filter((s) => s.id !== primary.id)
                .map((s) => (
                  <li key={s.id} className="text-[11px] text-muted-foreground">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-fg/90 hover:text-accent"
                    >
                      {s.shortName}
                    </a>
                    {" · "}
                    {s.year}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg border border-border/80 bg-surface px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Sitasi
          </p>
          <p className="mt-1 text-[11px] leading-snug text-fg">
            Diproses oleh {DATA_SOURCES.processorName} dari {primary.shortName} (
            {primary.year}). {primary.citation}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {DATA_SOURCES.dualCreditNote}
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated text-xs font-medium text-fg transition-colors hover:bg-muted active:scale-[0.99] sm:min-h-9"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-success" aria-hidden />
                Disalin
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-accent" aria-hidden />
                Salin sitasi
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Freshness + dual-credit helpers for public UI (not owner-only).
 */
import {
  DATA_SOURCES,
  dualCreditLine,
  metricLastIngestedAt,
  metricUpdateCadence,
  primarySourceForMetric,
  reliabilityLabel,
  type MetricKey,
} from "@/data/province-stats";
import { DATA_SLA_DAYS, daysSince } from "@/data/monitoring";

export type FreshnessTone = "ok" | "warn" | "critical";

export type GlobalFreshness = {
  iso: string;
  days: number;
  tone: FreshnessTone;
  label: string;
  title: string;
};

export type MetricFreshness = {
  iso: string;
  days: number;
  year: string;
  cadence: string;
  tone: FreshnessTone;
  dualCredit: string;
  reliability: string;
  shortName: string;
};

function toneFromDays(
  days: number,
  sla: { warn: number; critical: number },
): FreshnessTone {
  if (days >= sla.critical) return "critical";
  if (days >= sla.warn) return "warn";
  return "ok";
}

export function globalFreshness(now = new Date()): GlobalFreshness {
  const iso = DATA_SOURCES.updatedAt;
  const days = daysSince(iso, now);
  const tone = toneFromDays(days, DATA_SLA_DAYS.global);
  const label =
    days <= 0 ? "Hari ini" : days === 1 ? "1 hari" : `${days} hari`;
  return {
    iso,
    days,
    tone,
    label,
    title: `Dataset app diperbarui ${iso} (${label} lalu). SLA: peringatan ${DATA_SLA_DAYS.global.warn}h / kritis ${DATA_SLA_DAYS.global.critical}h.`,
  };
}

export function metricFreshness(
  metric: MetricKey,
  now = new Date(),
): MetricFreshness {
  const src = primarySourceForMetric(metric);
  const iso = metricLastIngestedAt(metric);
  const days = daysSince(iso, now);
  const tone = toneFromDays(days, DATA_SLA_DAYS.global);
  return {
    iso,
    days,
    year: src.year,
    cadence: metricUpdateCadence(metric),
    tone,
    dualCredit: dualCreditLine(metric),
    reliability: reliabilityLabel(src.reliability),
    shortName: src.shortName,
  };
}

export function freshnessToneClass(tone: FreshnessTone): string {
  switch (tone) {
    case "critical":
      return "border-danger/40 bg-danger/10 text-danger";
    case "warn":
      return "border-warn/40 bg-warn/10 text-warn";
    default:
      return "border-border bg-surface-elevated text-muted-foreground";
  }
}

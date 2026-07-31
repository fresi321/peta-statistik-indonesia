/**
 * Owner monitoring — what to watch and how alerts are raised.
 *
 * Categories:
 * 1. Freshness   — data age vs SLA (days)
 * 2. Coverage    — province / entity completeness vs national standard
 * 3. Integrity   — GeoJSON keys ↔ stats, empty lists, invalid numbers
 * 4. Quality     — estimated vs official metric mix
 * 5. Attribution — sources & disclaimer present
 * 6. Ops         — manual review cadence, geo layer age note
 */

import { ENTITIES_BY_GEO, getEntities } from "@/data/province-entities";
import {
  DATA_SOURCES,
  METRICS,
  PROVINCES,
  PROVINCE_BY_GEO,
  type MetricKey,
} from "@/data/province-stats";

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertCategory =
  | "freshness"
  | "coverage"
  | "integrity"
  | "quality"
  | "attribution"
  | "ops";

export type MonitorAlert = {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  detail: string;
  action: string;
  /** Suggested owner task */
  metricKeys?: MetricKey[];
};

export type MonitorCheck = {
  id: string;
  label: string;
  category: AlertCategory;
  description: string;
  status: "ok" | "warn" | "fail";
  summary: string;
};

/** SLA: days before a domain is considered stale */
export const DATA_SLA_DAYS = {
  /** Global DATA_SOURCES.updatedAt */
  global: { warn: 90, critical: 180 },
  /** Official survey-style releases (IPM, kemiskinan) */
  officialAnnual: { warn: 400, critical: 550 },
  /** Population / mid-year estimates */
  population: { warn: 200, critical: 400 },
  /** Sector estimates & catalogs */
  catalog: { warn: 120, critical: 240 },
  /** Owner should re-open dashboard at least every N days */
  ownerReview: { warn: 14, critical: 45 },
} as const;

/** National administrative reality (post-2022 Papua splits) */
export const NATIONAL_PROVINCE_COUNT = 38;
/** Current map layer feature count */
export const MAP_LAYER_PROVINCE_COUNT = 34;

export type FreshnessMeta = {
  updatedAt: string;
  daysSinceUpdate: number;
  nextReviewHint: string;
};

export function daysSince(isoDate: string, now = new Date()): number {
  const d = new Date(isoDate + (isoDate.length === 10 ? "T00:00:00Z" : ""));
  if (Number.isNaN(d.getTime())) return 9999;
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function freshnessMeta(now = new Date()): FreshnessMeta {
  const updatedAt = DATA_SOURCES.updatedAt;
  const days = daysSince(updatedAt, now);
  const next = new Date(now);
  next.setDate(next.getDate() + Math.max(0, DATA_SLA_DAYS.global.warn - days));
  return {
    updatedAt,
    daysSinceUpdate: days,
    nextReviewHint: next.toISOString().slice(0, 10),
  };
}

function severityFromAge(
  days: number,
  sla: { warn: number; critical: number },
): AlertSeverity | null {
  if (days >= sla.critical) return "critical";
  if (days >= sla.warn) return "warning";
  return null;
}

/** Run all monitors — pure, safe for client + server */
export function runMonitoring(opts?: {
  now?: Date;
  lastOwnerReviewAt?: string | null;
  geoFeatureKeys?: string[] | null;
}): {
  alerts: MonitorAlert[];
  checks: MonitorCheck[];
  score: number;
  generatedAt: string;
  freshness: FreshnessMeta;
} {
  const now = opts?.now ?? new Date();
  const alerts: MonitorAlert[] = [];
  const checks: MonitorCheck[] = [];
  const freshness = freshnessMeta(now);

  // --- 1. Global freshness ---
  {
    const sev = severityFromAge(freshness.daysSinceUpdate, DATA_SLA_DAYS.global);
    if (sev) {
      alerts.push({
        id: "freshness-global",
        severity: sev,
        category: "freshness",
        title: "Dataset inti perlu diperbarui",
        detail: `DATA_SOURCES.updatedAt = ${freshness.updatedAt} (${freshness.daysSinceUpdate} hari lalu). SLA: peringatan ${DATA_SLA_DAYS.global.warn}h / kritis ${DATA_SLA_DAYS.global.critical}h.`,
        action:
          "Tarik rilis terbaru BPS (IPM, penduduk, PDRB, kemiskinan, padi), update CORE di province-stats.ts, lalu naikkan updatedAt.",
      });
    }
    checks.push({
      id: "chk-freshness-global",
      label: "Kesegaran data global",
      category: "freshness",
      description: "Umur dataset vs SLA 90/180 hari",
      status: sev === "critical" ? "fail" : sev === "warning" ? "warn" : "ok",
      summary: `${freshness.daysSinceUpdate} hari sejak ${freshness.updatedAt}`,
    });
  }

  // --- Per-source reliability mix ---
  {
    const estimated = DATA_SOURCES.sources.filter(
      (s) => s.reliability === "estimated",
    ).length;
    const total = DATA_SOURCES.sources.length;
    const ratio = estimated / Math.max(1, total);
    if (ratio > 0.35) {
      alerts.push({
        id: "quality-estimated-share",
        severity: "warning",
        category: "quality",
        title: "Banyak sumber masih estimasi",
        detail: `${estimated}/${total} entri sumber berlabel estimated (~${Math.round(ratio * 100)}%).`,
        action:
          "Prioritaskan penggantian katalog kendaraan/fasilitas dengan tabel BPS/Kemenkes resmi bila tersedia.",
      });
    }
    checks.push({
      id: "chk-estimated-share",
      label: "Porsi sumber estimasi",
      category: "quality",
      description: "Rasio sumber model vs resmi",
      status: ratio > 0.45 ? "fail" : ratio > 0.35 ? "warn" : "ok",
      summary: `${estimated}/${total} estimated`,
    });
  }

  // --- 2. Coverage: 34 vs 38 ---
  {
    const n = PROVINCES.length;
    const gap = NATIONAL_PROVINCE_COUNT - n;
    if (gap > 0) {
      alerts.push({
        id: "coverage-province-gap",
        severity: "warning",
        category: "coverage",
        title: `Layer peta ${n} provinsi (nasional ${NATIONAL_PROVINCE_COUNT})`,
        detail: DATA_SOURCES.coverageNote,
        action:
          "Saat layer GeoJSON 38 provinsi tersedia, pecah unit Papua hasil pemekaran 2022 dan isi statistik terpisah.",
      });
    }
    checks.push({
      id: "chk-province-count",
      label: "Jumlah provinsi di app",
      category: "coverage",
      description: `Target layer ${MAP_LAYER_PROVINCE_COUNT}; nasional ${NATIONAL_PROVINCE_COUNT}`,
      status: n < MAP_LAYER_PROVINCE_COUNT ? "fail" : gap > 0 ? "warn" : "ok",
      summary: `${n} di data · gap nasional ${gap}`,
    });
  }

  // --- Entity catalog coverage ---
  {
    const missing: string[] = [];
    const thin: string[] = [];
    for (const p of PROVINCES) {
      const e = getEntities(p.geoKey);
      if (!e) {
        missing.push(p.name);
        continue;
      }
      if (e.universities.items.length === 0) thin.push(`${p.name}/PT`);
      if (e.hospitals.items.length === 0) thin.push(`${p.name}/RS`);
      if (e.attractions.items.length === 0) thin.push(`${p.name}/wisata`);
    }
    if (missing.length) {
      alerts.push({
        id: "coverage-entities-missing",
        severity: "critical",
        category: "coverage",
        title: "Katalog nama hilang untuk beberapa provinsi",
        detail: missing.join(", "),
        action: "Isi entri di province-entities.ts untuk geoKey terkait.",
      });
    }
    if (thin.length) {
      alerts.push({
        id: "coverage-entities-thin",
        severity: "warning",
        category: "coverage",
        title: "Katalog nama kosong di beberapa bidang",
        detail: thin.slice(0, 12).join("; ") + (thin.length > 12 ? "…" : ""),
        action: "Lengkapi daftar PT/RS/destinasi yang kosong.",
      });
    }
    const entityKeys = Object.keys(ENTITIES_BY_GEO).length;
    checks.push({
      id: "chk-entity-coverage",
      label: "Cakupan katalog nama",
      category: "coverage",
      description: "Setiap provinsi punya PT, RS, destinasi, komoditas",
      status: missing.length ? "fail" : thin.length ? "warn" : "ok",
      summary: `${entityKeys} katalog · hilang ${missing.length} · tipis ${thin.length}`,
    });
  }

  // --- 3. Integrity: stats keys ---
  {
    const dup = new Set<string>();
    const seen = new Set<string>();
    for (const p of PROVINCES) {
      if (seen.has(p.geoKey)) dup.add(p.geoKey);
      seen.add(p.geoKey);
    }
    if (dup.size) {
      alerts.push({
        id: "integrity-dup-keys",
        severity: "critical",
        category: "integrity",
        title: "geoKey duplikat di statistik",
        detail: [...dup].join(", "),
        action: "Perbaiki CORE di province-stats.ts agar geoKey unik.",
      });
    }

    const badNumbers: string[] = [];
    for (const p of PROVINCES) {
      if (!(p.population > 0)) badNumbers.push(`${p.name}:population`);
      if (!(p.area > 0)) badNumbers.push(`${p.name}:area`);
      if (!(p.hdi > 0 && p.hdi <= 100)) badNumbers.push(`${p.name}:hdi`);
      if (p.poverty < 0 || p.poverty > 100) badNumbers.push(`${p.name}:poverty`);
    }
    if (badNumbers.length) {
      alerts.push({
        id: "integrity-bad-numbers",
        severity: "critical",
        category: "integrity",
        title: "Nilai statistik tidak valid",
        detail: badNumbers.slice(0, 20).join("; "),
        action: "Koreksi angka di CORE / expand().",
      });
    }
    checks.push({
      id: "chk-integrity-numbers",
      label: "Validitas angka inti",
      category: "integrity",
      description: "Populasi, luas, IPM, kemiskinan dalam rentang wajar",
      status: badNumbers.length || dup.size ? "fail" : "ok",
      summary:
        badNumbers.length || dup.size
          ? `${badNumbers.length} invalid · ${dup.size} dup`
          : `${PROVINCES.length} provinsi OK`,
    });
  }

  // --- GeoJSON vs stats alignment (optional keys from client fetch) ---
  if (opts?.geoFeatureKeys) {
    const geoSet = new Set(opts.geoFeatureKeys);
    const statsKeys = PROVINCES.map((p) => p.geoKey);
    const missingInStats = opts.geoFeatureKeys.filter((k) => !PROVINCE_BY_GEO[k]);
    const missingInGeo = statsKeys.filter((k) => !geoSet.has(k));
    if (missingInStats.length || missingInGeo.length) {
      alerts.push({
        id: "integrity-geo-mismatch",
        severity: "critical",
        category: "integrity",
        title: "GeoJSON tidak selaras dengan statistik",
        detail: `Tanpa stats: ${missingInStats.join(", ") || "—"} · Tanpa geometri: ${missingInGeo.join(", ") || "—"}`,
        action: "Samakan Propinsi di GeoJSON dengan geoKey di province-stats.ts.",
      });
    }
    checks.push({
      id: "chk-geo-align",
      label: "Selaras GeoJSON ↔ data",
      category: "integrity",
      description: "Setiap polygon punya statistik & sebaliknya",
      status:
        missingInStats.length || missingInGeo.length ? "fail" : "ok",
      summary: `geo ${opts.geoFeatureKeys.length} · stats ${statsKeys.length}`,
    });
  } else {
    checks.push({
      id: "chk-geo-align",
      label: "Selaras GeoJSON ↔ data",
      category: "integrity",
      description: "Dicek saat layer peta termuat",
      status: "warn",
      summary: "Belum diverifikasi (buka dashboard setelah load peta)",
    });
  }

  // --- 4. Attribution ---
  {
    const hasAttr = Boolean(DATA_SOURCES.requiredAttribution?.includes("BPS"));
    const hasSources = DATA_SOURCES.sources.length >= 5;
    if (!hasAttr || !hasSources) {
      alerts.push({
        id: "attribution-missing",
        severity: "critical",
        category: "attribution",
        title: "Atribusi sumber tidak lengkap",
        detail: "requiredAttribution atau daftar sources kosong/lemah.",
        action: "Lengkapi DATA_SOURCES di province-stats.ts.",
      });
    }
    checks.push({
      id: "chk-attribution",
      label: "Atribusi BPS & sitasi",
      category: "attribution",
      description: "Wajib untuk publikasi data pihak ketiga",
      status: hasAttr && hasSources ? "ok" : "fail",
      summary: `${DATA_SOURCES.sources.length} sumber · atribusi ${hasAttr ? "ada" : "hilang"}`,
    });
  }

  // --- Metrics without primary source mapping ---
  {
    const unmapped: MetricKey[] = [];
    for (const m of METRICS) {
      const hit = DATA_SOURCES.sources.some((s) =>
        (s.fields as readonly MetricKey[]).includes(m.key),
      );
      if (!hit) unmapped.push(m.key);
    }
    if (unmapped.length) {
      alerts.push({
        id: "attribution-unmapped-metrics",
        severity: "warning",
        category: "attribution",
        title: "Indikator tanpa entri sumber",
        detail: unmapped.join(", "),
        action: "Tambahkan fields[] di DATA_SOURCES.sources untuk indikator ini.",
        metricKeys: unmapped,
      });
    }
    checks.push({
      id: "chk-metric-sources",
      label: "Pemetaan sumber per indikator",
      category: "attribution",
      description: "Setiap MetricKey punya setidaknya 1 sumber",
      status: unmapped.length ? "warn" : "ok",
      summary:
        unmapped.length === 0
          ? `${METRICS.length} indikator terpetakan`
          : `${unmapped.length} belum terpetakan`,
    });
  }

  // --- 5. Owner review cadence ---
  {
    const last = opts?.lastOwnerReviewAt;
    if (!last) {
      alerts.push({
        id: "ops-no-review",
        severity: "info",
        category: "ops",
        title: "Belum ada catatan review owner",
        detail: "Tandai “Sudah direview” di dashboard setelah memeriksa alert.",
        action: "Klik tombol tandai review di panel Owner.",
      });
      checks.push({
        id: "chk-owner-review",
        label: "Jadwal review owner",
        category: "ops",
        description: `Review manual tiap ≤${DATA_SLA_DAYS.ownerReview.warn} hari`,
        status: "warn",
        summary: "Belum pernah ditandai",
      });
    } else {
      const age = daysSince(last.slice(0, 10), now);
      const sev = severityFromAge(age, DATA_SLA_DAYS.ownerReview);
      if (sev) {
        alerts.push({
          id: "ops-review-stale",
          severity: sev === "critical" ? "warning" : "info",
          category: "ops",
          title: "Review owner sudah lama",
          detail: `Review terakhir ${last.slice(0, 10)} (${age} hari lalu).`,
          action: "Buka ulang checklist monitoring dan tandai review.",
        });
      }
      checks.push({
        id: "chk-owner-review",
        label: "Jadwal review owner",
        category: "ops",
        description: `Review manual tiap ≤${DATA_SLA_DAYS.ownerReview.warn} hari`,
        status: sev === "critical" ? "fail" : sev === "warning" ? "warn" : "ok",
        summary: `${age} hari sejak review`,
      });
    }
  }

  // Score 0–100
  let score = 100;
  for (const a of alerts) {
    if (a.severity === "critical") score -= 18;
    else if (a.severity === "warning") score -= 8;
    else score -= 2;
  }
  score = Math.max(0, Math.min(100, score));

  // Sort alerts: critical first
  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    alerts,
    checks,
    score,
    generatedAt: now.toISOString(),
    freshness,
  };
}

export function alertCounts(alerts: MonitorAlert[]) {
  return {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
    total: alerts.length,
  };
}

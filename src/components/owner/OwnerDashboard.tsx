import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Info,
  LogOut,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import {
  DATA_SLA_DAYS,
  NATIONAL_PROVINCE_COUNT,
  alertCounts,
  runMonitoring,
  type MonitorAlert,
  type MonitorCheck,
} from "@/data/monitoring";
import { DATA_SOURCES, PROVINCES } from "@/data/province-stats";
import {
  acknowledgeAlert,
  clearAcknowledgedAlerts,
  clearOwnerSession,
  getAcknowledgedAlerts,
  getLastOwnerReview,
  markOwnerReview,
  readOwnerSession,
} from "@/lib/owner/session";
import { ownerVerify } from "@/lib/owner/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OwnerDashboard() {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [demo, setDemo] = useState(false);
  const [geoKeys, setGeoKeys] = useState<string[] | null>(null);
  const [reviewAt, setReviewAt] = useState<string | null>(null);
  const [acks, setAcks] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = readOwnerSession();
    if (!s) {
      setAuthorized(false);
      setReady(true);
      return;
    }
    void ownerVerify({ data: { token: s.token } }).then((r) => {
      if (!r.ok) {
        clearOwnerSession();
        setAuthorized(false);
      } else {
        setAuthorized(true);
        setDemo(Boolean(r.demo));
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    setReviewAt(getLastOwnerReview());
    setAcks(getAcknowledgedAlerts());
  }, [tick]);

  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/geo/indonesia-provinces.json");
        const g = await res.json();
        const keys = (g.features as { properties?: { Propinsi?: string } }[]).map(
          (f) => String(f.properties?.Propinsi ?? ""),
        );
        if (!cancelled) setGeoKeys(keys);
      } catch {
        if (!cancelled) setGeoKeys([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authorized]);

  const report = useMemo(
    () =>
      runMonitoring({
        lastOwnerReviewAt: reviewAt,
        geoFeatureKeys: geoKeys,
      }),
    [reviewAt, geoKeys, tick],
  );

  const counts = alertCounts(report.alerts);
  const openAlerts = report.alerts.filter((a) => !acks.includes(a.id));

  const onReview = useCallback(() => {
    markOwnerReview();
    clearAcknowledgedAlerts();
    setTick((t) => t + 1);
  }, []);

  const onAck = useCallback((id: string) => {
    acknowledgeAlert(id);
    setTick((t) => t + 1);
  }, []);

  const logout = () => {
    clearOwnerSession();
    window.location.href = "/owner/login";
  };

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted-foreground">
        Memuat sesi owner…
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-4">
        <p className="text-sm text-muted-foreground">Sesi owner tidak valid.</p>
        <Button asChild>
          <Link to="/owner/login">Masuk lagi</Link>
        </Button>
      </div>
    );
  }

  const scoreColor =
    report.score >= 80
      ? "text-success"
      : report.score >= 55
        ? "text-warn"
        : "text-danger";

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-elevated">
              <Shield className="size-4 text-accent" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-sm font-semibold sm:text-base">
                Owner Monitoring
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Peta Statistik Indonesia · panel khusus admin
              </p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {demo && (
              <Badge variant="secondary" className="text-[10px]">
                PIN demo aktif
              </Badge>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => setTick((t) => t + 1)}
            >
              <RefreshCw className="size-3.5" />
              Muat ulang cek
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/">Ke peta publik</Link>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={logout}>
              <LogOut className="size-3.5" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Score + summary */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Skor kesehatan data"
            value={`${report.score}`}
            hint="0–100 (lebih tinggi lebih baik)"
            valueClass={scoreColor}
          />
          <StatCard
            label="Alert terbuka"
            value={String(openAlerts.length)}
            hint={`${counts.critical} kritis · ${counts.warning} peringatan · ${counts.info} info`}
          />
          <StatCard
            label="Umur dataset"
            value={`${report.freshness.daysSinceUpdate}h`}
            hint={`Update: ${report.freshness.updatedAt} · SLA warn ${DATA_SLA_DAYS.global.warn}h`}
          />
          <StatCard
            label="Provinsi di app"
            value={String(PROVINCES.length)}
            hint={`Layer peta · nasional ${NATIONAL_PROVINCE_COUNT} (pasca-2022)`}
          />
        </section>

        <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Review owner</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Terakhir ditandai:{" "}
                {reviewAt
                  ? new Date(reviewAt).toLocaleString("id-ID")
                  : "belum pernah"}
                . Disarankan ≤ {DATA_SLA_DAYS.ownerReview.warn} hari.
              </p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={onReview}>
              <ClipboardCheck className="size-3.5" />
              Tandai sudah direview
            </Button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {DATA_SOURCES.coverageNote}
          </p>
        </section>

        {/* Alerts */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Peringatan aktif</h2>
            <span className="text-[11px] text-muted-foreground">
              {openAlerts.length} perlu perhatian · {acks.length} diabaikan sesi ini
            </span>
          </div>
          {openAlerts.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-6 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-success" />
              Tidak ada alert terbuka. Sistem sehat relatif terhadap aturan saat
              ini.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {openAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} onAck={() => onAck(a.id)} />
              ))}
            </ul>
          )}
        </section>

        {/* Checklist */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">Checklist monitor</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {report.checks.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-elevated/60 p-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-fg">Yang dipantau</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>
              <strong>Kesegaran data</strong> — umur DATA_SOURCES vs SLA 90/180
              hari
            </li>
            <li>
              <strong>Cakupan wilayah</strong> — 34 di layer vs 38 nasional;
              katalog nama per provinsi
            </li>
            <li>
              <strong>Integritas</strong> — angka valid, geoKey unik, selaras
              GeoJSON
            </li>
            <li>
              <strong>Kualitas</strong> — porsi sumber estimasi vs resmi
            </li>
            <li>
              <strong>Atribusi</strong> — sitasi BPS & pemetaan sumber indikator
            </li>
            <li>
              <strong>Ops</strong> — frekuensi review manual owner
            </li>
          </ol>
          <p className="mt-3">
            PIN produksi: set env <code className="text-fg">OWNER_DASHBOARD_PIN</code>.
            Sesi owner terpisah dari login pengunjung (Google/X).
          </p>
          <p className="mt-1 text-[10px]">
            Laporan dibuat {new Date(report.generatedAt).toLocaleString("id-ID")}
          </p>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: string;
  hint: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-2xl font-semibold tabular-nums text-fg",
          valueClass,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function AlertCard({
  alert,
  onAck,
}: {
  alert: MonitorAlert;
  onAck: () => void;
}) {
  const Icon =
    alert.severity === "critical"
      ? XCircle
      : alert.severity === "warning"
        ? AlertTriangle
        : Info;
  const tone =
    alert.severity === "critical"
      ? "border-danger/40 bg-danger/5"
      : alert.severity === "warning"
        ? "border-warn/40 bg-warn/5"
        : "border-border bg-surface";

  return (
    <li className={cn("rounded-xl border px-4 py-3", tone)}>
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            alert.severity === "critical"
              ? "text-danger"
              : alert.severity === "warning"
                ? "text-warn"
                : "text-accent",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-fg">{alert.title}</p>
            <Badge variant="secondary" className="text-[10px] capitalize">
              {alert.severity}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {alert.category}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {alert.detail}
          </p>
          <p className="mt-2 text-xs text-fg">
            <span className="font-medium text-accent">Tindakan: </span>
            {alert.action}
          </p>
          <div className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={onAck}>
              Abaikan sementara
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

function CheckRow({ check }: { check: MonitorCheck }) {
  const icon =
    check.status === "ok" ? (
      <CheckCircle2 className="size-3.5 text-success" />
    ) : check.status === "warn" ? (
      <AlertTriangle className="size-3.5 text-warn" />
    ) : (
      <XCircle className="size-3.5 text-danger" />
    );
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{check.label}</p>
        <p className="text-[11px] text-muted-foreground">{check.description}</p>
        <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
          {check.summary}
        </p>
      </div>
    </div>
  );
}

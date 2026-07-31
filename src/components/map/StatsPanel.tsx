import { ExternalLink, MapPin, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EntityListSection } from "@/components/map/EntityList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  entityListForCategory,
  entityListForMetric,
  getEntities,
} from "@/data/province-entities";
import {
  DATA_SOURCES,
  METRIC_BY_KEY,
  PROVINCES,
  getCategory,
  getMetricValue,
  getSourcesForMetric,
  metricRange,
  metricsForCategory,
  normalize,
  primarySourceForMetric,
  reliabilityLabel,
  type CategoryKey,
  type MetricKey,
  type ProvinceStats,
} from "@/data/province-stats";
import { CHART_COLORS } from "@/lib/map-colors";
import { cn } from "@/lib/utils";

interface StatsPanelProps {
  province: ProvinceStats | null;
  metric: MetricKey;
  category?: CategoryKey;
  onClose: () => void;
  className?: string;
}

function shortName(name: string) {
  return name
    .replace("Kep. ", "")
    .replace("Nusa Tenggara ", "NT")
    .replace("Kalimantan ", "Kal. ")
    .replace("Sulawesi ", "Sul. ")
    .replace("Sumatera ", "Sum. ")
    .replace("Daerah Istimewa ", "DI ")
    .replace("DKI ", "");
}

function iconForTitle(title: string): "university" | "hospital" | "attraction" | "commodity" | "default" {
  if (title.includes("Perguruan")) return "university";
  if (title.includes("Rumah sakit")) return "hospital";
  if (title.includes("Destinasi")) return "attraction";
  if (title.includes("Komoditas")) return "commodity";
  return "default";
}

export function StatsPanel({
  province,
  metric,
  category = "demografi",
  onClose,
  className,
}: StatsPanelProps) {
  if (!province) {
    return (
      <aside
        className={cn(
          "flex h-full flex-col border-l border-border bg-surface/95 backdrop-blur-sm",
          className,
        )}
      >
        <EmptyPanel />
      </aside>
    );
  }

  const m = METRIC_BY_KEY[metric];
  const cat = getCategory(category);
  const catMetrics = metricsForCategory(category);
  const value = getMetricValue(province, metric);
  const range = metricRange(metric);
  const src = primarySourceForMetric(metric);
  const allSrc = getSourcesForMetric(metric);
  const entities = getEntities(province.geoKey);
  const primaryList =
    entities &&
    (entityListForMetric(entities, metric) ||
      entityListForCategory(entities, category));
  // Always offer the four catalogs when available
  const extraLists =
    entities &&
    [
      { title: "Perguruan tinggi", list: entities.universities, key: "universities" },
      { title: "Rumah sakit utama", list: entities.hospitals, key: "hospitals" },
      { title: "Destinasi unggulan", list: entities.attractions, key: "attractions" },
      { title: "Komoditas unggulan", list: entities.commodities, key: "commodities" },
    ].filter((x) => !primaryList || x.title !== primaryList.title);

  const rank =
    [...PROVINCES]
      .sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))
      .findIndex((p) => p.geoKey === province.geoKey) + 1;

  const peers = PROVINCES.filter((p) => p.region === province.region)
    .map((p) => ({
      name: shortName(p.name),
      full: p.name,
      value: getMetricValue(p, metric),
      self: p.geoKey === province.geoKey,
    }))
    .sort((a, b) => b.value - a.value);

  const nationalAvg =
    PROVINCES.reduce((s, p) => s + getMetricValue(p, metric), 0) /
    PROVINCES.length;

  const vsNational = value - nationalAvg;
  const better =
    (m.higherIsBetter && vsNational >= 0) ||
    (!m.higherIsBetter && vsNational <= 0);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-border bg-surface/95 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{province.region}</Badge>
            <Badge variant="secondary">{cat.short}</Badge>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-fg">
            {province.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            Ibu kota {province.capital}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Tutup panel"
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="panel-scroll flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {m.label}
          </p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums tracking-tight text-fg">
            {m.format(value)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{reliabilityLabel(src.reliability)}</Badge>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              {src.shortName}
              <ExternalLink className="size-3" />
            </a>
            <span className="text-[11px] text-muted-foreground">{src.year}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">
              Peringkat #{rank} / {PROVINCES.length}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                better ? "text-success" : "text-warn",
              )}
            >
              {better ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {m.higherIsBetter
                ? vsNational >= 0
                  ? "di atas"
                  : "di bawah"
                : vsNational <= 0
                  ? "lebih baik dari"
                  : "lebih tinggi dari"}{" "}
              rata-rata nasional
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>{m.format(range.min)}</span>
              <span>skala nasional</span>
              <span>{m.format(range.max)}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent/80"
                style={{
                  width: `${normalize(value, range.min, range.max) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {primaryList && (
          <EntityListSection
            title={primaryList.title}
            list={primaryList.list}
            icon={iconForTitle(primaryList.title)}
          />
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Indikator {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {catMetrics.map((cm) => (
              <div
                key={cm.key}
                className={cn(
                  "rounded-xl border px-3 py-2.5",
                  cm.key === metric
                    ? "border-accent/40 bg-accent/10"
                    : "border-border bg-bg/60",
                )}
              >
                <p className="text-[11px] font-medium text-muted-foreground">
                  {cm.short}
                </p>
                <p className="mt-1 font-mono text-sm font-medium tabular-nums text-fg">
                  {cm.format(getMetricValue(province, cm.key))}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-5" />

        <div>
          <h3 className="text-sm font-medium text-fg">
            Perbandingan wilayah — {province.region}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {m.label} antar provinsi se-kawasan
          </p>
          <div className="mt-3 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={peers}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: CHART_COLORS.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v))
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={88}
                  tick={{ fill: CHART_COLORS.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: CHART_COLORS.cursor }}
                  contentStyle={{
                    background: CHART_COLORS.tooltipBg,
                    border: `1px solid ${CHART_COLORS.tooltipBorder}`,
                    borderRadius: 10,
                    fontSize: 12,
                    color: CHART_COLORS.tooltipText,
                  }}
                  formatter={(val: number) => [m.format(val), m.short]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as { full?: string })?.full ?? ""
                  }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {peers.map((entry) => (
                    <Cell
                      key={entry.full}
                      fill={entry.self ? CHART_COLORS.barSelf : CHART_COLORS.barPeer}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {extraLists && extraLists.length > 0 && (
          <>
            <Separator className="my-5" />
            <p className="text-xs font-medium text-muted-foreground">
              Katalog nama wilayah
            </p>
            {extraLists.map((x) => (
              <EntityListSection
                key={x.key}
                title={x.title}
                list={x.list}
                icon={iconForTitle(x.title)}
              />
            ))}
          </>
        )}

        <Separator className="my-5" />

        <section aria-labelledby="sumber-indikator">
          <h3 id="sumber-indikator" className="text-sm font-medium text-fg">
            Sumber data indikator
          </h3>
          <ul className="mt-2 space-y-2">
            {allSrc.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border bg-bg/50 px-3 py-2"
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-fg hover:text-accent"
                >
                  {s.name}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {s.year} · {reliabilityLabel(s.reliability)}
                </p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  {s.citation}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {DATA_SOURCES.requiredAttribution}
          </p>
        </section>
      </div>
    </aside>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-elevated">
        <MapPin className="size-5 text-accent" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-fg">
        Pilih wilayah
      </h2>
      <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
        Klik provinsi untuk melihat angka, daftar nama PT/RS/destinasi, dan
        sumber data.
      </p>
      <p className="mt-4 max-w-[240px] text-[11px] leading-relaxed text-muted-foreground">
        {DATA_SOURCES.requiredAttribution}
      </p>
    </div>
  );
}

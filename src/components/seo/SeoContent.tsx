import { Link } from "@tanstack/react-router";
import {
  CATEGORIES,
  DATA_SOURCES,
  METRICS,
  PROVINCES,
  reliabilityLabel,
} from "@/data/province-stats";
import { formatNumber } from "@/lib/utils";

export function SeoContent() {
  const ranked = [...PROVINCES].sort((a, b) => b.population - a.population);

  return (
    <section
      id="konten-statistik"
      aria-labelledby="seo-heading"
      className="border-t border-border bg-bg"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Data wilayah Indonesia · {DATA_SOURCES.updatedAt} ·{" "}
            {PROVINCES.length} provinsi (nasional 38)
          </p>
          <h2
            id="seo-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl"
          >
            Statistik per Provinsi di Indonesia
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {DATA_SOURCES.requiredAttribution} Peta multi-kategori: demografi,
            ekonomi, pertanian, kendaraan, pariwisata, kesehatan (termasuk
            stunting), pendidikan, bencana & iklim, serta pemilu.
          </p>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <article
              key={c.key}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <h3 className="text-sm font-semibold text-fg">{c.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {c.description}. Indikator:{" "}
                {c.metrics
                  .map((k) => METRICS.find((m) => m.key === k)?.short)
                  .filter(Boolean)
                  .join(", ")}
                .
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10" id="sumber-data">
          <h3 className="text-lg font-semibold text-fg">
            Sumber data & pemrosesan
          </h3>
          <p className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-fg">
            {DATA_SOURCES.requiredAttribution}{" "}
            <strong>{DATA_SOURCES.dualCreditNote}</strong>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Diproses oleh {DATA_SOURCES.processorName} · diperbarui{" "}
            {DATA_SOURCES.updatedAt} · lisensi kemasan {DATA_SOURCES.licenseName}.{" "}
            {DATA_SOURCES.coverageNote}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Di peta interaktif tersedia unduh CSV/JSON, tabel aksesibel, dan
            salin sitasi per indikator. Metadata sumber:{" "}
            <a
              href="/data/indicators-meta.json"
              className="text-accent underline-offset-2 hover:underline"
            >
              indicators-meta.json
            </a>
            .
          </p>
          <ul className="mt-4 space-y-3">
            {DATA_SOURCES.sources.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                <a
                  href={s.url}
                  className="text-sm font-semibold text-fg underline-offset-2 hover:text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.name}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.year} · {reliabilityLabel(s.reliability)} ·{" "}
                  {s.updateCadence} · kolom: {s.fields.join(", ")}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-fg/80">Sitasi: </span>
                  {s.citation}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-fg/80">Pemrosesan: </span>
                  {s.processingNote}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {DATA_SOURCES.disclaimer}
          </p>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-fg">
            Daftar provinsi & ringkasan data
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {ranked.length} wilayah · diurutkan populasi · sumber penduduk/IPM/PDRB:
            BPS
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Tabel statistik provinsi Indonesia. Sumber: Badan Pusat
                Statistik (BPS).
              </caption>
              <thead className="bg-surface-elevated text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    #
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Provinsi
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Ibu kota
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Wilayah
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Populasi
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    IPM
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    PDRB/kapita
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((p, i) => (
                  <tr
                    key={p.geoKey}
                    className="border-t border-border/80 odd:bg-surface/40"
                  >
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-fg">
                      <a
                        href="#peta"
                        className="hover:text-accent hover:underline"
                      >
                        {p.name}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.capital}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {p.region}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-fg">
                      {formatNumber(p.population)}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-fg">
                      {p.hdi.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-fg">
                      Rp {formatNumber(p.gdpPerCapita)} jt
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Sumber tabel: {DATA_SOURCES.requiredAttribution}
          </p>
        </div>

        <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Peta Statistik Indonesia.{" "}
            {DATA_SOURCES.requiredAttribution}
          </p>
          <p className="mt-2">
            <Link
              to="/owner/login"
              className="text-muted-foreground/70 hover:text-accent hover:underline"
            >
              Area owner
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}

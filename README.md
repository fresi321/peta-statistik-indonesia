# Peta Statistik Indonesia

Peta interaktif statistik per provinsi di Indonesia — demografi, ekonomi (UMP, inflasi, APBD), pertanian, pariwisata, kesehatan, pendidikan.

## Fitur

- Choropleth map 34 provinsi (skala biru → merah)
- Multi-kategori & pencarian indikator
- Panel detail + katalog nama (PT, RS, destinasi)
- Unduh data CSV/JSON dengan atribusi sumber
- Area owner `/owner` untuk monitoring data
- SEO + mode terang

## Stack

React 19, TypeScript, Vite, TanStack Start/Router, Tailwind CSS, Leaflet, Zustand/Zod (template).

## Menjalankan

```bash
npm install
npm run dev
```

App dev server: `http://localhost:8080`

```bash
npm run build
npm run typecheck
```

## Sumber data

Utama: **Badan Pusat Statistik (BPS)** dan rujukan resmi (UMP, DJPK, dll.).  
Beberapa indikator diestimasi untuk visualisasi. Lihat atribusi di UI dan `src/data/province-stats.ts`.

## Owner dashboard

- Path: `/owner/login`
- Demo PIN (sandbox): set env `OWNER_DASHBOARD_PIN` di produksi

## Lisensi data

Hormati ketentuan BPS dan sumber resmi saat menayangkan ulang. Sertakan atribusi.

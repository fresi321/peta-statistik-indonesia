/**
 * Full entity stubs for provinces missing from the original catalog.
 */
import type { ProvinceEntities } from "@/data/province-entities";

const notePddikti =
  "Katalog kurasi publik (nama PT terkenal/terdaftar). Bukan salinan penuh PDDikti.";
const noteKemenkes =
  "RS rujukan/utama yang dikenal publik. Bukan daftar izin lengkap Kemenkes.";
const noteKomoditas =
  "Komoditas unggulan daerah (BPS/pertanian & perikanan).";

function list<T extends { name: string }>(
  items: T[],
  opts?: { total?: number; sourceNote?: string },
) {
  return {
    items,
    total: opts?.total ?? items.length,
    sourceNote: opts?.sourceNote,
  };
}

export const MISSING_PROVINCE_ENTITIES: Record<string, ProvinceEntities> = {
  RIAU: {
    geoKey: "RIAU",
    universities: list(
      [
        { name: "Universitas Riau (UNRI)", type: "Negeri", city: "Pekanbaru" },
        { name: "UIN Sultan Syarif Kasim Riau", type: "Negeri (Kemenag)", city: "Pekanbaru" },
        { name: "Politeknik Caltex Riau", type: "Swasta", city: "Pekanbaru" },
        { name: "Universitas Islam Riau", type: "Swasta", city: "Pekanbaru" },
        { name: "Universitas Lancang Kuning", type: "Swasta", city: "Pekanbaru" },
        { name: "Poltekkes Kemenkes Riau", type: "Negeri", city: "Pekanbaru" },
      ],
      { total: 45, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Arifin Achmad", type: "RSUD Provinsi", city: "Pekanbaru" },
        { name: "RS Awal Bros Pekanbaru", type: "Swasta", city: "Pekanbaru" },
        { name: "RS Eka Hospital Pekanbaru", type: "Swasta", city: "Pekanbaru" },
        { name: "RSUD Dumai", type: "RSUD", city: "Dumai" },
      ],
      { total: 55, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Minyak & gas", type: "Energi" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  JAMBI: {
    geoKey: "JAMBI",
    universities: list(
      [
        { name: "Universitas Jambi (UNJA)", type: "Negeri", city: "Jambi" },
        { name: "UIN Sulthan Thaha Saifuddin", type: "Negeri (Kemenag)", city: "Jambi" },
        { name: "Universitas Batanghari", type: "Swasta", city: "Jambi" },
        { name: "STIKES Baiturrahim", type: "Swasta", city: "Jambi" },
        { name: "Poltekkes Kemenkes Jambi", type: "Negeri", city: "Jambi" },
      ],
      { total: 28, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Raden Mattaher", type: "RSUD Provinsi", city: "Jambi" },
        { name: "RS Siloam / Mayapada Jambi", type: "Swasta", city: "Jambi" },
        { name: "RSUD Bungo", type: "RSUD", city: "Bungo" },
      ],
      { total: 32, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Batubara", type: "Tambang" },
        { name: "Pinang & pinang rempah", type: "Perkebunan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  BENGKULU: {
    geoKey: "BENGKULU",
    universities: list(
      [
        { name: "Universitas Bengkulu (UNIB)", type: "Negeri", city: "Bengkulu" },
        { name: "UINFAS Bengkulu", type: "Negeri (Kemenag)", city: "Bengkulu" },
        { name: "Universitas Dehasen", type: "Swasta", city: "Bengkulu" },
        { name: "Poltekkes Kemenkes Bengkulu", type: "Negeri", city: "Bengkulu" },
      ],
      { total: 18, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. M. Yunus", type: "RSUD Provinsi", city: "Bengkulu" },
        { name: "RS Bhayangkara Bengkulu", type: "TNI/Polri", city: "Bengkulu" },
        { name: "RSUD Curup", type: "RSUD", city: "Rejang Lebong" },
      ],
      { total: 20, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Kopi", type: "Perkebunan" },
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Batu bara", type: "Tambang" },
        { name: "Perikanan laut", type: "Perikanan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  LAMPUNG: {
    geoKey: "LAMPUNG",
    universities: list(
      [
        { name: "Universitas Lampung (UNILA)", type: "Negeri", city: "Bandar Lampung" },
        { name: "UIN Raden Intan", type: "Negeri (Kemenag)", city: "Bandar Lampung" },
        { name: "Institut Teknologi Sumatera (ITERA)", type: "Negeri", city: "Lampung Selatan" },
        { name: "Universitas Bandar Lampung", type: "Swasta", city: "Bandar Lampung" },
        { name: "Universitas Malahayati", type: "Swasta", city: "Bandar Lampung" },
        { name: "Poltekkes Kemenkes Tanjungkarang", type: "Negeri", city: "Bandar Lampung" },
      ],
      { total: 55, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. H. Abdul Moeloek", type: "RSUD Provinsi", city: "Bandar Lampung" },
        { name: "RS Bumi Waras", type: "Swasta", city: "Bandar Lampung" },
        { name: "RSUD Menggala", type: "RSUD", city: "Tulang Bawang" },
      ],
      { total: 48, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Kopi robusta", type: "Perkebunan" },
        { name: "Lada", type: "Perkebunan" },
        { name: "Udang & perikanan", type: "Perikanan" },
        { name: "Padi & singkong", type: "Pangan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  BANTEN: {
    geoKey: "BANTEN",
    universities: list(
      [
        { name: "Universitas Sultan Ageng Tirtayasa (Untirta)", type: "Negeri", city: "Serang" },
        { name: "UIN Sultan Maulana Hasanuddin", type: "Negeri (Kemenag)", city: "Serang" },
        { name: "Universitas Pamulang", type: "Swasta", city: "Tangerang Selatan" },
        { name: "Universitas Pelita Harapan", type: "Swasta", city: "Tangerang" },
        { name: "Swiss German University", type: "Swasta", city: "Tangerang" },
        { name: "Politeknik Negeri Media Kreatif / jejaring", type: "Negeri", city: "Tangerang" },
      ],
      { total: 80, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Banten / RSUD dr. Dradjat Prawiranegara", type: "RSUD Provinsi", city: "Serang" },
        { name: "RS Siloam Lippo Village", type: "Swasta", city: "Tangerang" },
        { name: "RS Mayapada Tangerang", type: "Swasta", city: "Tangerang" },
        { name: "RSUD Kabupaten Tangerang", type: "RSUD", city: "Tangerang" },
      ],
      { total: 70, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Industri manufaktur", type: "Industri" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Padi", type: "Pangan" },
        { name: "Kelapa", type: "Perkebunan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  BALI: {
    geoKey: "BALI",
    universities: list(
      [
        { name: "Universitas Udayana", type: "Negeri", city: "Badung / Denpasar" },
        { name: "ISI Denpasar", type: "Negeri", city: "Denpasar" },
        { name: "Universitas Pendidikan Ganesha", type: "Negeri", city: "Singaraja" },
        { name: "Politeknik Negeri Bali", type: "Negeri", city: "Badung" },
        { name: "Universitas Warmadewa", type: "Swasta", city: "Denpasar" },
        { name: "Universitas Dhyana Pura", type: "Swasta", city: "Badung" },
        { name: "ITB Stikom Bali", type: "Swasta", city: "Denpasar" },
      ],
      { total: 50, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Prof. dr. I.G.N.G. Ngoerah", type: "RSUP", city: "Denpasar" },
        { name: "RSUD Wangaya", type: "RSUD", city: "Denpasar" },
        { name: "BIMC / Siloam Bali", type: "Swasta", city: "Badung" },
        { name: "RSUD Tabanan", type: "RSUD", city: "Tabanan" },
      ],
      { total: 55, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Pariwisata & MICE", type: "Jasa" },
        { name: "Kerajinan & fashion", type: "Industri" },
        { name: "Kopi Kintamani", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  GORONTALO: {
    geoKey: "GORONTALO",
    universities: list(
      [
        { name: "Universitas Negeri Gorontalo (UNG)", type: "Negeri", city: "Gorontalo" },
        { name: "Universitas Gorontalo", type: "Swasta", city: "Gorontalo" },
        { name: "IAIN Sultan Amai Gorontalo", type: "Negeri (Kemenag)", city: "Gorontalo" },
        { name: "Poltekkes Kemenkes Gorontalo", type: "Negeri", city: "Gorontalo" },
      ],
      { total: 16, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Prof. Dr. H. Aloei Saboe", type: "RSUD Provinsi", city: "Gorontalo" },
        { name: "RSUD Otanaha", type: "RSUD", city: "Gorontalo" },
        { name: "RS Bhayangkara Gorontalo", type: "TNI/Polri", city: "Gorontalo" },
      ],
      { total: 14, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Jagung", type: "Pangan" },
        { name: "Kelapa", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Tebu", type: "Perkebunan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  MALUKU: {
    geoKey: "MALUKU",
    universities: list(
      [
        { name: "Universitas Pattimura (Unpatti)", type: "Negeri", city: "Ambon" },
        { name: "IAIN Ambon", type: "Negeri (Kemenag)", city: "Ambon" },
        { name: "Universitas Darussalam Ambon", type: "Swasta", city: "Ambon" },
        { name: "Poltekkes Kemenkes Maluku", type: "Negeri", city: "Ambon" },
      ],
      { total: 20, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. M. Haulussy", type: "RSUD Provinsi", city: "Ambon" },
        { name: "RS Al Fatah Ambon", type: "Swasta", city: "Ambon" },
        { name: "RSUD Tual", type: "RSUD", city: "Tual" },
      ],
      { total: 22, sourceNote: noteKemenkes },
    ),
    attractions: list([], { total: 0 }),
    commodities: list(
      [
        { name: "Pala & rempah", type: "Perkebunan" },
        { name: "Perikanan tuna", type: "Perikanan" },
        { name: "Cengkeh", type: "Perkebunan" },
        { name: "Sagu", type: "Pangan" },
      ],
      { sourceNote: noteKomoditas },
    ),
  },
};

/**
 * Named catalogs per province — PT, RS, destinasi, komoditas.
 * Destinasi digabung dari tourism-destinations.ts via getEntities().
 */

import { MISSING_PROVINCE_ENTITIES } from "@/data/missing-province-entities";
import { ATTRACTIONS_BY_GEO } from "@/data/tourism-destinations";

export type EntityItem = {
  name: string;
  type?: string;
  city?: string;
};

export type EntityList = {
  items: EntityItem[];
  total?: number;
  sourceNote?: string;
};

export type ProvinceEntities = {
  geoKey: string;
  universities: EntityList;
  hospitals: EntityList;
  attractions: EntityList;
  commodities: EntityList;
};

const notePddikti = "Katalog kurasi publik (nama PT). Bukan salinan penuh PDDikti.";
const noteKemenkes = "RS rujukan/utama kurasi publik. Bukan daftar izin lengkap.";
const noteKomoditas = "Komoditas unggulan daerah (kurasi).";
const noteWisata =
  "Destinasi unggulan kurasi publik (pariwisata daerah / media).";

function list(
  items: EntityItem[],
  opts?: { total?: number; sourceNote?: string },
): EntityList {
  return {
    items,
    total: opts?.total ?? items.length,
    sourceNote: opts?.sourceNote,
  };
}

const BASE: Record<string, ProvinceEntities> = {
  "ACEH": {
    geoKey: "ACEH",
    universities: list(
      [
        { name: "Universitas Syiah Kuala", type: "Negeri", city: "Banda Aceh" },
        { name: "UIN Ar-Raniry", type: "Negeri (Kemenag)", city: "Banda Aceh" },
        { name: "Universitas Malikussaleh", type: "Negeri", city: "Lhokseumawe" },
        { name: "Universitas Teuku Umar", type: "Negeri", city: "Meulaboh" },
        { name: "Poltekkes Kemenkes Aceh", type: "Negeri", city: "Banda Aceh" },
        { name: "Universitas Abulyatama", type: "Swasta", city: "Aceh Besar" },
        { name: "Universitas Muhammadiyah Aceh", type: "Swasta", city: "Banda Aceh" },
        { name: "STAIN Gajah Putih Takengon", type: "Negeri (Kemenag)", city: "Takengon" },
        { name: "Politeknik Negeri Lhokseumawe", type: "Negeri", city: "Lhokseumawe" },
        { name: "Universitas Serambi Mekkah", type: "Swasta", city: "Banda Aceh" },
        { name: "STIKES Muhammadiyah Lhokseumawe", type: "Swasta", city: "Lhokseumawe" },
        { name: "Akademi Keperawatan Kesdam Iskandar Muda", type: "Swasta", city: "Banda Aceh" },
        { name: "STIE Lhokseumawe", type: "Swasta", city: "Lhokseumawe" }
      ],
      { total: 13, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. Zainoel Abidin", type: "RSUD Provinsi", city: "Banda Aceh" },
        { name: "RSUD Cut Meutia", type: "RSUD", city: "Lhokseumawe" },
        { name: "RSUD Meuraxa", type: "RSUD", city: "Banda Aceh" },
        { name: "RS Kesdam Iskandar Muda", type: "TNI", city: "Banda Aceh" },
        { name: "RS Bhayangkara Banda Aceh", type: "Polri", city: "Banda Aceh" }
      ],
      { total: 40, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kopi Gayo", type: "Perkebunan" },
        { name: "Nilam", type: "Perkebunan" },
        { name: "Perikanan tuna", type: "Perikanan" },
        { name: "Kelapa sawit", type: "Perkebunan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SUMATERA UTARA": {
    geoKey: "SUMATERA UTARA",
    universities: list(
      [
        { name: "Universitas Sumatera Utara", type: "Negeri", city: "Medan" },
        { name: "UIN Sumatera Utara", type: "Negeri (Kemenag)", city: "Medan" },
        { name: "Universitas Negeri Medan", type: "Negeri", city: "Medan" },
        { name: "Politeknik Negeri Medan", type: "Negeri", city: "Medan" },
        { name: "Universitas Muhammadiyah Sumatera Utara", type: "Swasta", city: "Medan" },
        { name: "Universitas HKBP Nommensen", type: "Swasta", city: "Medan" }
      ],
      { total: 120, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP H. Adam Malik", type: "RSUP", city: "Medan" },
        { name: "RSUD Pirngadi", type: "RSUD", city: "Medan" },
        { name: "RS Murni Teguh", type: "Swasta", city: "Medan" },
        { name: "RS Columbia Asia Medan", type: "Swasta", city: "Medan" }
      ],
      { total: 120, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Kopi", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SUMATERA BARAT": {
    geoKey: "SUMATERA BARAT",
    universities: list(
      [
        { name: "Universitas Andalas", type: "Negeri", city: "Padang" },
        { name: "Universitas Negeri Padang", type: "Negeri", city: "Padang" },
        { name: "UIN Imam Bonjol", type: "Negeri (Kemenag)", city: "Padang" },
        { name: "Politeknik Negeri Padang", type: "Negeri", city: "Padang" },
        { name: "Universitas Bung Hatta", type: "Swasta", city: "Padang" }
      ],
      { total: 55, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. M. Djamil", type: "RSUP", city: "Padang" },
        { name: "RSUD Dr. Rasidin", type: "RSUD", city: "Padang" },
        { name: "RS Semen Padang", type: "Swasta", city: "Padang" }
      ],
      { total: 45, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Batu bara", type: "Tambang" },
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Kakao", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SUMATERA SELATAN": {
    geoKey: "SUMATERA SELATAN",
    universities: list(
      [
        { name: "Universitas Sriwijaya", type: "Negeri", city: "Palembang" },
        { name: "UIN Raden Fatah", type: "Negeri (Kemenag)", city: "Palembang" },
        { name: "Politeknik Negeri Sriwijaya", type: "Negeri", city: "Palembang" },
        { name: "Universitas Muhammadiyah Palembang", type: "Swasta", city: "Palembang" }
      ],
      { total: 70, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. Mohammad Hoesin", type: "RSUP", city: "Palembang" },
        { name: "RSUD Siti Fatimah", type: "RSUD", city: "Palembang" },
        { name: "RS Charitas", type: "Swasta", city: "Palembang" }
      ],
      { total: 60, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Batu bara", type: "Tambang" },
        { name: "Padi", type: "Pangan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "BANGKA BELITUNG": {
    geoKey: "BANGKA BELITUNG",
    universities: list(
      [
        { name: "Universitas Bangka Belitung", type: "Negeri", city: "Pangkal Pinang" },
        { name: "Poltekkes Kemenkes Pangkalpinang", type: "Negeri", city: "Pangkal Pinang" },
        { name: "STIE IBEK", type: "Swasta", city: "Pangkal Pinang" }
      ],
      { total: 12, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Depati Hamzah", type: "RSUD Provinsi", city: "Pangkal Pinang" },
        { name: "RSUD Depati Bahrin", type: "RSUD", city: "Sungailiat" }
      ],
      { total: 16, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Timah", type: "Tambang" },
        { name: "Lada", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Kelapa sawit", type: "Perkebunan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KEPULAUAN RIAU": {
    geoKey: "KEPULAUAN RIAU",
    universities: list(
      [
        { name: "Universitas Maritim Raja Ali Haji", type: "Negeri", city: "Tanjung Pinang" },
        { name: "Politeknik Negeri Batam", type: "Negeri", city: "Batam" },
        { name: "Universitas Internasional Batam", type: "Swasta", city: "Batam" },
        { name: "Universitas Batam", type: "Swasta", city: "Batam" }
      ],
      { total: 22, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Embung Fatimah", type: "RSUD", city: "Batam" },
        { name: "RS Awal Bros Batam", type: "Swasta", city: "Batam" },
        { name: "RSUD Tanjung Pinang", type: "RSUD", city: "Tanjung Pinang" }
      ],
      { total: 28, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Elektronik & manufaktur", type: "Industri" },
        { name: "Pariwisata", type: "Jasa" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Galangan kapal", type: "Industri" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "DKI JAKARTA": {
    geoKey: "DKI JAKARTA",
    universities: list(
      [
        { name: "Universitas Indonesia", type: "Negeri", city: "Jakarta / Depok" },
        { name: "Universitas Negeri Jakarta", type: "Negeri", city: "Jakarta" },
        { name: "UIN Syarif Hidayatullah", type: "Negeri (Kemenag)", city: "Jakarta" },
        { name: "Institut Teknologi PLN / ITSB jejaring", type: "Swasta", city: "Jakarta" },
        { name: "Universitas Trisakti", type: "Swasta", city: "Jakarta" },
        { name: "Binus University", type: "Swasta", city: "Jakarta" },
        { name: "Universitas Katolik Indonesia Atma Jaya", type: "Swasta", city: "Jakarta" }
      ],
      { total: 300, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUPN Dr. Cipto Mangunkusumo", type: "RSUP", city: "Jakarta" },
        { name: "RSUP Fatmawati", type: "RSUP", city: "Jakarta" },
        { name: "RS Pondok Indah", type: "Swasta", city: "Jakarta" },
        { name: "RS Siloam", type: "Swasta", city: "Jakarta" },
        { name: "RS Harapan Kita", type: "RS Khusus", city: "Jakarta" }
      ],
      { total: 180, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Jasa keuangan", type: "Jasa" },
        { name: "Perdagangan", type: "Jasa" },
        { name: "Industri kreatif", type: "Jasa" },
        { name: "Pariwisata MICE", type: "Jasa" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "JAWA BARAT": {
    geoKey: "JAWA BARAT",
    universities: list(
      [
        { name: "Institut Teknologi Bandung", type: "Negeri", city: "Bandung" },
        { name: "Universitas Padjadjaran", type: "Negeri", city: "Bandung / Sumedang" },
        { name: "Universitas Pendidikan Indonesia", type: "Negeri", city: "Bandung" },
        { name: "UIN Sunan Gunung Djati", type: "Negeri (Kemenag)", city: "Bandung" },
        { name: "IPB University", type: "Negeri", city: "Bogor" },
        { name: "Universitas Telkom", type: "Swasta", city: "Bandung" }
      ],
      { total: 400, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. Hasan Sadikin", type: "RSUP", city: "Bandung" },
        { name: "RSUD Kota Bandung", type: "RSUD", city: "Bandung" },
        { name: "RS Santosa", type: "Swasta", city: "Bandung" },
        { name: "RS Pondok Indah / jejaring Jabar", type: "Swasta", city: "Bogor" }
      ],
      { total: 250, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Teh", type: "Perkebunan" },
        { name: "Padi", type: "Pangan" },
        { name: "Industri tekstil", type: "Industri" },
        { name: "Hortikultura", type: "Pangan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "JAWA TENGAH": {
    geoKey: "JAWA TENGAH",
    universities: list(
      [
        { name: "Universitas Diponegoro", type: "Negeri", city: "Semarang" },
        { name: "Universitas Negeri Semarang", type: "Negeri", city: "Semarang" },
        { name: "UIN Walisongo", type: "Negeri (Kemenag)", city: "Semarang" },
        { name: "Universitas Sebelas Maret", type: "Negeri", city: "Solo" },
        { name: "Universitas Jenderal Soedirman", type: "Negeri", city: "Purwokerto" }
      ],
      { total: 250, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. Kariadi", type: "RSUP", city: "Semarang" },
        { name: "RSUD Dr. Moewardi", type: "RSUD", city: "Solo" },
        { name: "RS Telogorejo", type: "Swasta", city: "Semarang" }
      ],
      { total: 200, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Padi", type: "Pangan" },
        { name: "Tembakau", type: "Perkebunan" },
        { name: "Tekstil & furniture", type: "Industri" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "DI YOGYAKARTA": {
    geoKey: "DI YOGYAKARTA",
    universities: list(
      [
        { name: "Universitas Gadjah Mada", type: "Negeri", city: "Yogyakarta" },
        { name: "Universitas Negeri Yogyakarta", type: "Negeri", city: "Yogyakarta" },
        { name: "UIN Sunan Kalijaga", type: "Negeri (Kemenag)", city: "Yogyakarta" },
        { name: "ISI Yogyakarta", type: "Negeri", city: "Yogyakarta" },
        { name: "Universitas Islam Indonesia", type: "Swasta", city: "Yogyakarta" },
        { name: "Universitas Atma Jaya Yogyakarta", type: "Swasta", city: "Yogyakarta" }
      ],
      { total: 100, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. Sardjito", type: "RSUP", city: "Yogyakarta" },
        { name: "RSUD Jogja", type: "RSUD", city: "Yogyakarta" },
        { name: "RS Panti Rapih", type: "Swasta", city: "Yogyakarta" }
      ],
      { total: 40, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Pariwisata & pendidikan", type: "Jasa" },
        { name: "Kerajinan", type: "Industri" },
        { name: "Padi", type: "Pangan" },
        { name: "Kakao & hortikultura", type: "Perkebunan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "JAWA TIMUR": {
    geoKey: "JAWA TIMUR",
    universities: list(
      [
        { name: "Institut Teknologi Sepuluh Nopember", type: "Negeri", city: "Surabaya" },
        { name: "Universitas Airlangga", type: "Negeri", city: "Surabaya" },
        { name: "Universitas Brawijaya", type: "Negeri", city: "Malang" },
        { name: "Universitas Negeri Surabaya", type: "Negeri", city: "Surabaya" },
        { name: "UIN Sunan Ampel", type: "Negeri (Kemenag)", city: "Surabaya" },
        { name: "Universitas Negeri Malang", type: "Negeri", city: "Malang" }
      ],
      { total: 350, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. Soetomo", type: "RSUD", city: "Surabaya" },
        { name: "RSUP Dr. Sardjito jejaring / RSUD Saiful Anwar", type: "RSUD", city: "Malang" },
        { name: "RS Siloam Surabaya", type: "Swasta", city: "Surabaya" },
        { name: "RS Adi Husada", type: "Swasta", city: "Surabaya" }
      ],
      { total: 280, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Padi", type: "Pangan" },
        { name: "Tembakau", type: "Perkebunan" },
        { name: "Gula", type: "Perkebunan" },
        { name: "Perikanan & garam", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "NUSA TENGGARA BARAT": {
    geoKey: "NUSA TENGGARA BARAT",
    universities: list(
      [
        { name: "Universitas Mataram", type: "Negeri", city: "Mataram" },
        { name: "UIN Mataram", type: "Negeri (Kemenag)", city: "Mataram" },
        { name: "Universitas Muhammadiyah Mataram", type: "Swasta", city: "Mataram" }
      ],
      { total: 35, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Provinsi NTB", type: "RSUD Provinsi", city: "Mataram" },
        { name: "RSUD Risa Sentra Medika", type: "RSUD", city: "Mataram" }
      ],
      { total: 28, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Tembakau", type: "Perkebunan" },
        { name: "Jagung", type: "Pangan" },
        { name: "Pariwisata", type: "Jasa" },
        { name: "Mutiara", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "NUSA TENGGARA TIMUR": {
    geoKey: "NUSA TENGGARA TIMUR",
    universities: list(
      [
        { name: "Universitas Nusa Cendana", type: "Negeri", city: "Kupang" },
        { name: "UIN Kupang / IAKN", type: "Negeri", city: "Kupang" },
        { name: "Universitas Muhammadiyah Kupang", type: "Swasta", city: "Kupang" }
      ],
      { total: 30, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Prof. Dr. W. Z. Johannes", type: "RSUD Provinsi", city: "Kupang" },
        { name: "RSUD Komodo Labuan Bajo", type: "RSUD", city: "Manggarai Barat" }
      ],
      { total: 30, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Jagung", type: "Pangan" },
        { name: "Ternak sapi", type: "Peternakan" },
        { name: "Rumput laut", type: "Perikanan" },
        { name: "Pariwisata Komodo", type: "Jasa" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KALIMANTAN BARAT": {
    geoKey: "KALIMANTAN BARAT",
    universities: list(
      [
        { name: "Universitas Tanjungpura", type: "Negeri", city: "Pontianak" },
        { name: "Poltekkes Kemenkes Pontianak", type: "Negeri", city: "Pontianak" },
        { name: "Universitas Muhammadiyah Pontianak", type: "Swasta", city: "Pontianak" }
      ],
      { total: 40, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. Soedarso", type: "RSUD Provinsi", city: "Pontianak" },
        { name: "RS Antonius Pontianak", type: "Swasta", city: "Pontianak" }
      ],
      { total: 35, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Lada", type: "Perkebunan" },
        { name: "Kayu", type: "Hutan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KALIMANTAN TENGAH": {
    geoKey: "KALIMANTAN TENGAH",
    universities: list(
      [
        { name: "Universitas Palangka Raya", type: "Negeri", city: "Palangka Raya" },
        { name: "IAIN Palangka Raya", type: "Negeri (Kemenag)", city: "Palangka Raya" },
        { name: "Universitas Muhammadiyah Palangkaraya", type: "Swasta", city: "Palangka Raya" }
      ],
      { total: 18, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Doris Sylvanus", type: "RSUD Provinsi", city: "Palangka Raya" },
        { name: "RSUD dr. Murjani", type: "RSUD", city: "Sampit" }
      ],
      { total: 22, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Batubara", type: "Tambang" },
        { name: "Rotan", type: "Hutan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KALIMANTAN SELATAN": {
    geoKey: "KALIMANTAN SELATAN",
    universities: list(
      [
        { name: "Universitas Lambung Mangkurat", type: "Negeri", city: "Banjarmasin / Banjarbaru" },
        { name: "UIN Antasari", type: "Negeri (Kemenag)", city: "Banjarmasin" },
        { name: "Politeknik Negeri Banjarmasin", type: "Negeri", city: "Banjarmasin" }
      ],
      { total: 35, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Ulin", type: "RSUD Provinsi", city: "Banjarmasin" },
        { name: "RS Suaka Insan", type: "Swasta", city: "Banjarmasin" }
      ],
      { total: 35, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Batubara", type: "Tambang" },
        { name: "Karet", type: "Perkebunan" },
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Intan", type: "Tambang" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KALIMANTAN TIMUR": {
    geoKey: "KALIMANTAN TIMUR",
    universities: list(
      [
        { name: "Universitas Mulawarman", type: "Negeri", city: "Samarinda" },
        { name: "Institut Teknologi Kalimantan", type: "Negeri", city: "Balikpapan" },
        { name: "Politeknik Negeri Samarinda", type: "Negeri", city: "Samarinda" },
        { name: "Universitas Balikpapan", type: "Swasta", city: "Balikpapan" }
      ],
      { total: 40, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD A.W. Sjahranie", type: "RSUD Provinsi", city: "Samarinda" },
        { name: "RSUD Dr. Kanujoso Djatiwibowo", type: "RSUD", city: "Balikpapan" },
        { name: "RS Pertamina Balikpapan", type: "Swasta", city: "Balikpapan" }
      ],
      { total: 45, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Batubara", type: "Tambang" },
        { name: "Minyak & gas", type: "Energi" },
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Kayu", type: "Hutan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "KALIMANTAN UTARA": {
    geoKey: "KALIMANTAN UTARA",
    universities: list(
      [
        { name: "Universitas Kaltara", type: "Negeri", city: "Tanjung Selor" },
        { name: "STAI Kaltara", type: "Swasta", city: "Tanjung Selor" }
      ],
      { total: 8, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD R. Aj. A. D. Andi Tjatjoe", type: "RSUD Provinsi", city: "Tanjung Selor" },
        { name: "RSUD Tarakan", type: "RSUD", city: "Tarakan" }
      ],
      { total: 10, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Batubara", type: "Tambang" },
        { name: "Kelapa sawit", type: "Perkebunan" },
        { name: "Minyak & gas", type: "Energi" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SULAWESI UTARA": {
    geoKey: "SULAWESI UTARA",
    universities: list(
      [
        { name: "Universitas Sam Ratulangi", type: "Negeri", city: "Manado" },
        { name: "Universitas Negeri Manado", type: "Negeri", city: "Tondano" },
        { name: "Politeknik Negeri Manado", type: "Negeri", city: "Manado" },
        { name: "Universitas Katolik De La Salle", type: "Swasta", city: "Manado" }
      ],
      { total: 30, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Prof. Dr. R. D. Kandou", type: "RSUP", city: "Manado" },
        { name: "RSUD Bitung", type: "RSUD", city: "Bitung" }
      ],
      { total: 30, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kelapa", type: "Perkebunan" },
        { name: "Cengkeh", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Pariwisata selam", type: "Jasa" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SULAWESI TENGAH": {
    geoKey: "SULAWESI TENGAH",
    universities: list(
      [
        { name: "Universitas Tadulako", type: "Negeri", city: "Palu" },
        { name: "UIN Datokarama", type: "Negeri (Kemenag)", city: "Palu" },
        { name: "Universitas Muhammadiyah Palu", type: "Swasta", city: "Palu" }
      ],
      { total: 22, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Undata", type: "RSUD Provinsi", city: "Palu" },
        { name: "RS Anutapura", type: "RSUD", city: "Palu" }
      ],
      { total: 25, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Nikel", type: "Tambang" },
        { name: "Kelapa", type: "Perkebunan" },
        { name: "Kakao", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SULAWESI SELATAN": {
    geoKey: "SULAWESI SELATAN",
    universities: list(
      [
        { name: "Universitas Hasanuddin", type: "Negeri", city: "Makassar" },
        { name: "Universitas Negeri Makassar", type: "Negeri", city: "Makassar" },
        { name: "UIN Alauddin", type: "Negeri (Kemenag)", city: "Makassar" },
        { name: "Politeknik Negeri Ujung Pandang", type: "Negeri", city: "Makassar" },
        { name: "Universitas Muslim Indonesia", type: "Swasta", city: "Makassar" }
      ],
      { total: 120, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUP Dr. Wahidin Sudirohusodo", type: "RSUP", city: "Makassar" },
        { name: "RSUD Labuang Baji", type: "RSUD", city: "Makassar" },
        { name: "RS Siloam Makassar", type: "Swasta", city: "Makassar" }
      ],
      { total: 90, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Padi", type: "Pangan" },
        { name: "Kakao", type: "Perkebunan" },
        { name: "Rumput laut", type: "Perikanan" },
        { name: "Nikel (region)", type: "Tambang" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SULAWESI TENGGARA": {
    geoKey: "SULAWESI TENGGARA",
    universities: list(
      [
        { name: "Universitas Halu Oleo", type: "Negeri", city: "Kendari" },
        { name: "IAIN Kendari", type: "Negeri (Kemenag)", city: "Kendari" },
        { name: "Universitas Muhammadiyah Kendari", type: "Swasta", city: "Kendari" }
      ],
      { total: 25, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Bahteramas", type: "RSUD Provinsi", city: "Kendari" },
        { name: "RSUD Kota Kendari", type: "RSUD", city: "Kendari" }
      ],
      { total: 22, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Nikel", type: "Tambang" },
        { name: "Kakao", type: "Perkebunan" },
        { name: "Rumput laut", type: "Perikanan" },
        { name: "Kelapa", type: "Perkebunan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "SULAWESI BARAT": {
    geoKey: "SULAWESI BARAT",
    universities: list(
      [
        { name: "Universitas Sulawesi Barat", type: "Negeri", city: "Majene" },
        { name: "Universitas Tomakaka", type: "Swasta", city: "Mamuju" },
        { name: "STIE Muhammadiyah Mamuju", type: "Swasta", city: "Mamuju" }
      ],
      { total: 10, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Provinsi Sulawesi Barat", type: "RSUD Provinsi", city: "Mamuju" },
        { name: "RSUD Majene", type: "RSUD", city: "Majene" },
        { name: "RSUD Polewali Mandar", type: "RSUD", city: "Polewali" }
      ],
      { total: 14, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Kakao", type: "Perkebunan" },
        { name: "Kelapa", type: "Perkebunan" },
        { name: "Jagung", type: "Pangan" },
        { name: "Perikanan laut", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "MALUKU UTARA": {
    geoKey: "MALUKU UTARA",
    universities: list(
      [
        { name: "Universitas Khairun", type: "Negeri", city: "Ternate" },
        { name: "IAIN Ternate", type: "Negeri (Kemenag)", city: "Ternate" },
        { name: "Universitas Muhammadiyah Maluku Utara", type: "Swasta", city: "Ternate" }
      ],
      { total: 12, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dr. H. Chasan Boesoirie", type: "RSUD Provinsi", city: "Ternate" },
        { name: "RSUD Tobelo", type: "RSUD", city: "Halmahera Utara" }
      ],
      { total: 14, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Nikel", type: "Tambang" },
        { name: "Cengkeh", type: "Perkebunan" },
        { name: "Pala", type: "Perkebunan" },
        { name: "Perikanan", type: "Perikanan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "PAPUA BARAT": {
    geoKey: "PAPUA BARAT",
    universities: list(
      [
        { name: "Universitas Papua", type: "Negeri", city: "Manokwari" },
        { name: "STAIN Sorong / IAIN", type: "Negeri (Kemenag)", city: "Sorong" },
        { name: "Universitas Muhammadiyah Papua Barat", type: "Swasta", city: "Sorong" }
      ],
      { total: 10, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Manokwari", type: "RSUD Provinsi", city: "Manokwari" },
        { name: "RSUD Sele Be Solu", type: "RSUD", city: "Sorong" }
      ],
      { total: 16, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Minyak & gas", type: "Energi" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Pariwisata Raja Ampat", type: "Jasa" },
        { name: "Hasil hutan", type: "Hutan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
  "PAPUA": {
    geoKey: "PAPUA",
    universities: list(
      [
        { name: "Universitas Cenderawasih", type: "Negeri", city: "Jayapura" },
        { name: "UIN Jayapura / IAIN", type: "Negeri (Kemenag)", city: "Jayapura" },
        { name: "Universitas Ottow Geissler", type: "Swasta", city: "Jayapura" },
        { name: "Poltekkes Kemenkes Jayapura", type: "Negeri", city: "Jayapura" }
      ],
      { total: 15, sourceNote: notePddikti },
    ),
    hospitals: list(
      [
        { name: "RSUD Dok II Jayapura", type: "RSUD Provinsi", city: "Jayapura" },
        { name: "RS Dian Harapan", type: "Swasta", city: "Jayapura" },
        { name: "RSUD Mimika", type: "RSUD", city: "Timika" }
      ],
      { total: 30, sourceNote: noteKemenkes },
    ),
    attractions: list([], { sourceNote: noteWisata }),
    commodities: list(
      [
        { name: "Tembaga & emas", type: "Tambang" },
        { name: "Hasil hutan", type: "Hutan" },
        { name: "Perikanan", type: "Perikanan" },
        { name: "Sagu", type: "Pangan" }
      ],
      { sourceNote: noteKomoditas },
    ),
  },
};

export const ENTITIES_BY_GEO: Record<string, ProvinceEntities> = {
  ...MISSING_PROVINCE_ENTITIES,
  ...BASE,
};

export function getEntities(geoKey: string): ProvinceEntities | null {
  const base = ENTITIES_BY_GEO[geoKey];
  const attractions = ATTRACTIONS_BY_GEO[geoKey];
  if (!base && !attractions) return null;
  if (!base) {
    return {
      geoKey,
      universities: list([]),
      hospitals: list([]),
      attractions: attractions!,
      commodities: list([]),
    };
  }
  return {
    ...base,
    attractions: attractions ?? base.attractions,
  };
}

export function entityCount(
  e: ProvinceEntities | null,
  key: keyof Pick<
    ProvinceEntities,
    "universities" | "hospitals" | "attractions" | "commodities"
  >,
): number {
  if (!e) return 0;
  const list = e[key];
  return list.total ?? list.items.length;
}

export function entityListForMetric(
  e: ProvinceEntities,
  metric: string,
): { title: string; list: EntityList } | null {
  switch (metric) {
    case "universities":
    case "schools":
    case "literacy":
      return { title: "Perguruan tinggi", list: e.universities };
    case "hospitals":
    case "clinicCount":
      return { title: "Rumah sakit utama", list: e.hospitals };
    case "touristArrivals":
    case "hotels":
    case "attractions":
      return { title: "Destinasi unggulan", list: e.attractions };
    case "riceProduction":
    case "farmland":
    case "livestock":
    case "fishery":
      return { title: "Komoditas unggulan", list: e.commodities };
    default:
      return null;
  }
}

export function entityListForCategory(
  e: ProvinceEntities,
  category: string,
): { title: string; list: EntityList } | null {
  switch (category) {
    case "pendidikan":
      return { title: "Perguruan tinggi", list: e.universities };
    case "kesehatan":
      return { title: "Rumah sakit utama", list: e.hospitals };
    case "pariwisata":
      return { title: "Destinasi unggulan", list: e.attractions };
    case "pertanian":
      return { title: "Komoditas unggulan", list: e.commodities };
    default:
      return null;
  }
}

/**
 * ═══ TEMA — chrome yang diturunkan dari langit ═══
 *
 * `waktu.ts` memutuskan seperti apa DUNIA-nya: langit, laut, pasir, cahaya.
 * Berkas ini memutuskan seperti apa CHROME-nya: tombol, panel, keterangan —
 * barang-barang kecil yang duduk di atas dunia itu.
 *
 * Aturannya satu, dan sama dengan aturan yang berlaku di seluruh proyek ini:
 * chrome tidak memilih warnanya sendiri. Ia mengambilnya dari apa yang ada di
 * belakangnya.
 *
 *
 * ── TIGA ZONA ──
 *
 * Yang di belakang chrome bukan "langit" begitu saja. Layar ini punya tiga
 * ketinggian dengan latar yang berbeda-beda, dan tiap chrome tahu ia duduk di
 * mana:
 *
 *   atas   — pojok kanan atas: settings, tombol suara     → langit paling atas
 *   aksi   — tengah layar: tombol besar yang ditekan Olen → langit tengah
 *   bawah  — dasar layar: "keep going"                    → PASIR, bukan langit
 *
 * Zona bawah itu yang paling sering salah dikira. Tombol "keep going" duduk di
 * dasar layar, dan di dasar layar yang ada bukan langit melainkan pasir —
 * #EBD5AC di siang hari. Putih di atas pasir itu rasionya 1,43 : 1.
 *
 *
 * ── SATU TINTA, KACA YANG BERUBAH ──
 *
 * Ada dua cara membuat tulisan terbaca di atas latar yang berganti-ganti:
 * membalik warna tulisannya, atau mengubah lapisan di bawahnya.
 *
 * Yang dipakai di sini cara kedua. Tulisan chrome SELALU putih; yang bergeser
 * adalah kacanya — terang di atas langit malam, gelap di atas pasir siang.
 * Alasannya bukan teknis melainkan watak: tulisan yang berbalik jadi biru tua
 * di siang hari lalu putih lagi di malam hari membuat halamannya terasa
 * seperti dua halaman berbeda. Kaca yang menggelap waktu cahayanya menguat
 * justru masuk akal — begitulah kacamata hitam bekerja.
 *
 * Panel settings sudah memakai cara ini sejak awal (`rgba(14,42,64,.58)`,
 * dipasang karena putih transparan tidak terbaca di tiga dari empat waktu).
 * Yang berubah sekarang: opasitasnya tidak lagi ditebak, dan aturannya berlaku
 * untuk semua chrome, bukan cuma panel itu.
 *
 *
 * ── SATU PENGECUALIAN, DISENGAJA ──
 *
 * Nama "Olen" yang besar di tengah layar TIDAK ikut aturan ini. Rasionya
 * memang rendah di langit siang, dan itu dibiarkan: ukurannya 15rem, ia dibaca
 * sebagai bentuk bukan sebagai teks, dan menggelapkannya akan mengubah satu-
 * satunya hal di layar yang benar-benar berupa gambar. Aturan kontras ada
 * untuk barang yang harus DIPAKAI. Nama itu tidak dipakai, ia dilihat.
 *
 * Pengecualian ditulis di sini supaya jadi keputusan, bukan kelalaian.
 */

// Sengaja jalur relatif, bukan alias `@/`. Berkas ini harus bisa dijalankan
// langsung oleh node untuk memeriksa angkanya (lihat periksa-kontras.ts), dan
// node tidak tahu apa-apa soal alias di tsconfig.
import { PALET, type Waktu, URUT } from "../components/v2/waktu.ts";
import { kontras, tumpuk, rgba } from "./warna.ts";

/** warna kaca gelap — sama dengan yang sudah dipakai panel settings */
export const LAPIS = "#0E2A40";
export const TINTA = "#FFFFFF";

/** ambang untuk chrome bertulisan kecil */
const TARGET = 4.5;
/** kaca terang paling tipis yang masih terlihat sebagai kaca */
const KACA_TIPIS = 0.16;

export type Zona = "atas" | "aksi" | "bawah";

export type Rias = {
  /** `rgba(...)` siap pakai untuk background */
  kaca: string;
  /** `rgba(...)` untuk border 1px */
  tepi: string;
  /** `rgba(...)` untuk keadaan hover */
  kacaSorot: string;
  /** rasio kontras tulisan putih yang tercapai */
  rasio: number;
  /** true kalau kacanya gelap (di atas latar terang) */
  gelap: boolean;
};

/**
 * Kaca paling tipis yang masih membuat tulisan putih terbaca di atas `latar`.
 *
 * Kaca putih hanya menolong kalau latarnya memang sudah gelap — menebalkannya
 * justru memperburuk, karena ia menerangkan latar yang harus tetap gelap. Jadi
 * kaca putih cuma dicoba sekali, di ketebalan paling tipis. Kalau di situ pun
 * gagal, tidak ada gunanya mencoba yang lebih tebal: hasilnya pasti lebih
 * buruk. Yang dipakai lalu kaca gelap, dipekatkan sedikit demi sedikit sampai
 * cukup dan berhenti di situ.
 */
export function riasDi(latar: string): Rias {
  const terang = tumpuk(TINTA, KACA_TIPIS, latar);
  const rTerang = kontras(TINTA, terang);
  if (rTerang >= TARGET) {
    return {
      kaca: rgba(TINTA, KACA_TIPIS),
      kacaSorot: rgba(TINTA, KACA_TIPIS + 0.12),
      tepi: rgba(TINTA, 0.5),
      rasio: +rTerang.toFixed(2),
      gelap: false,
    };
  }

  for (let a = 0.3; a <= 0.86 + 1e-9; a += 0.02) {
    const dasar = tumpuk(LAPIS, a, latar);
    const r = kontras(TINTA, dasar);
    if (r >= TARGET) {
      return {
        kaca: rgba(LAPIS, +a.toFixed(2)),
        kacaSorot: rgba(LAPIS, +Math.min(0.9, a + 0.1).toFixed(2)),
        tepi: rgba(TINTA, 0.28),
        rasio: +r.toFixed(2),
        gelap: true,
      };
    }
  }

  // tidak akan terjadi dengan palet mana pun yang ada sekarang, tapi kalau
  // suatu saat ada langit yang lebih terang dari putih 86% — ini jaringnya
  const dasar = tumpuk(LAPIS, 0.86, latar);
  return {
    kaca: rgba(LAPIS, 0.86),
    kacaSorot: rgba(LAPIS, 0.9),
    tepi: rgba(TINTA, 0.28),
    rasio: +kontras(TINTA, dasar).toFixed(2),
    gelap: true,
  };
}

/** apa yang sebenarnya ada di belakang tiap zona, pada waktu tertentu */
export function latarZona(w: Waktu, z: Zona): string {
  const p = PALET[w];
  if (z === "atas") return p.langit[0];
  if (z === "aksi") return p.langit[2];
  return p.pasir.dry; // di dasar layar yang ada pasir, bukan langit
}

/**
 * Dihitung sekali waktu modul dimuat, bukan tiap render.
 * Empat waktu × tiga zona = dua belas hitungan. Selesai sebelum React bangun.
 */
export const RIAS: Record<Waktu, Record<Zona, Rias>> = Object.fromEntries(
  URUT.map((w) => [
    w,
    {
      atas: riasDi(latarZona(w, "atas")),
      aksi: riasDi(latarZona(w, "aksi")),
      bawah: riasDi(latarZona(w, "bawah")),
    },
  ])
) as Record<Waktu, Record<Zona, Rias>>;

/**
 * Panel settings punya aturannya sendiri.
 *
 * Isinya bukan satu kata di dalam pil melainkan teks kecil berbaris-baris,
 * dan ia harus bisa dibaca lama, bukan sekilas. Jadi targetnya lebih tinggi:
 * 7 : 1, bukan 4,5.
 *
 * Latarnya diambil dari dua pita langit teratas — itu yang benar-benar ada di
 * belakangnya. Sempat kupatok ke latar paling terang yang ada di palet (buih
 * ombak, #FFFFFF), dengan pikiran "kalau yang tersulit lolos, semuanya lolos".
 * Itu salah arah: buih tidak pernah ada di pojok kanan atas, dan hasilnya
 * panel yang jauh lebih pekat daripada yang perlu — menutupi langit yang jadi
 * alasan halaman ini ada, demi keadaan yang tidak pernah terjadi.
 */
export function riasPanel(w: Waktu): Rias {
  const p = PALET[w];
  const calon = [p.langit[0], p.langit[1]];
  // yang paling terang = yang paling sulit; kalau itu lolos, yang lain lolos
  let terberat = calon[0];
  let ratio = kontras(TINTA, terberat);
  for (const c of calon) {
    const r = kontras(TINTA, c);
    if (r < ratio) {
      ratio = r;
      terberat = c;
    }
  }
  for (let a = 0.4; a <= 0.92 + 1e-9; a += 0.02) {
    const dasar = tumpuk(LAPIS, a, terberat);
    const r = kontras(TINTA, dasar);
    if (r >= 7) {
      return {
        kaca: rgba(LAPIS, +a.toFixed(2)),
        kacaSorot: rgba(LAPIS, +Math.min(0.95, a + 0.08).toFixed(2)),
        tepi: rgba(TINTA, 0.22),
        rasio: +r.toFixed(2),
        gelap: true,
      };
    }
  }
  return riasDi(terberat);
}

export const PANEL: Record<Waktu, Rias> = Object.fromEntries(
  URUT.map((w) => [w, riasPanel(w)])
) as Record<Waktu, Rias>;

/**
 * Semua itu, jadi satu kumpulan CSS custom property.
 * Ditulis ke elemen `.op` oleh `Tema.tsx`; CSS tinggal memakai `var(--ch-…)`
 * dan tidak perlu tahu apa pun soal waktu.
 */
export function variabelTema(w: Waktu): Record<string, string> {
  const r = RIAS[w];
  const p = PANEL[w];
  return {
    "--ch-atas-kaca": r.atas.kaca,
    "--ch-atas-sorot": r.atas.kacaSorot,
    "--ch-atas-tepi": r.atas.tepi,

    "--ch-aksi-kaca": r.aksi.kaca,
    "--ch-aksi-sorot": r.aksi.kacaSorot,
    "--ch-aksi-tepi": r.aksi.tepi,

    "--ch-bawah-kaca": r.bawah.kaca,
    "--ch-bawah-sorot": r.bawah.kacaSorot,
    "--ch-bawah-tepi": r.bawah.tepi,

    "--ch-panel-kaca": p.kaca,
    "--ch-panel-tepi": p.tepi,
  };
}

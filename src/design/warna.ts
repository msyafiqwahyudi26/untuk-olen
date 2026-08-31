/**
 * ═══ WARNA — hitungan, bukan selera ═══
 *
 * Kenapa berkas ini ada.
 *
 * Semua chrome halaman — tombol, keterangan, panah "keep going" — berwarna
 * putih. Itu keputusan yang benar waktu langitnya cuma satu: siang, biru.
 * Sekarang langitnya empat, dan di pagi serta golden hour bagian BAWAH langit
 * hampir putih (#FDEBDC, #FFD9A0). Tombol "keep going" duduk persis di situ.
 *
 * Putih di atas #FFD9A0 punya rasio kontras 1,34 : 1.
 * Ambang minimum untuk teks kecil adalah 4,5 : 1.
 *
 * Selama ini tidak kelihatan gawat karena tiap tombol memakai
 * `text-shadow: 0 1px 10px rgba(9,62,102,.35)` — sebuah lapisan gelap yang
 * dipasang karena "kelihatan lebih enak", tanpa pernah dihitung. Itu tambalan
 * yang kebetulan menolong, dan tambalan yang kebetulan menolong akan berhenti
 * menolong di langit kelima.
 *
 * Jadi warna chrome TIDAK ditulis sebagai nilai tetap. Ia diturunkan dari
 * langit di belakangnya — persis aturan yang sama yang dipakai untuk sirip
 * paus: kalau sebuah angka bisa diturunkan dari angka lain, turunkan.
 *
 * Berkas ini murni matematika. Tidak tahu apa-apa soal React, waktu, atau
 * pantai — jadi bisa dijalankan sendiri untuk diperiksa:
 *
 *     node --experimental-strip-types src/design/periksa-kontras.ts
 */

export type Rgb = [number, number, number];

/** "#RRGGBB" → [0–255, 0–255, 0–255] */
export function keRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const p = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(p.slice(0, 2), 16),
    parseInt(p.slice(2, 4), 16),
    parseInt(p.slice(4, 6), 16),
  ];
}

export function keHex([r, g, b]: Rgb): string {
  const d = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`.toUpperCase();
}

/**
 * Satu kanal sRGB (0–1) → cahaya linear.
 *
 * Ini bagian yang paling sering dilewatkan orang: nilai di "#7FA8D8" BUKAN
 * jumlah cahaya, melainkan angka yang sudah dibengkokkan supaya cocok dengan
 * cara mata bekerja. Merata-ratakan RGB mentah untuk menebak "terang atau
 * gelap" memberi jawaban yang salah justru di warna-warna tengah — dan warna
 * tengah persis yang jadi masalah di sini (langit pagi).
 */
function linear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Luminansi relatif WCAG, 0 (hitam) sampai 1 (putih). */
export function luminansi(hex: string): number {
  const [r, g, b] = keRgb(hex).map((v) => linear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rasio kontras WCAG antara dua warna buram. 1 = sama persis, 21 = hitam-putih. */
export function kontras(a: string, b: string): number {
  const la = luminansi(a);
  const lb = luminansi(b);
  const [t, r] = la > lb ? [la, lb] : [lb, la];
  return (t + 0.05) / (r + 0.05);
}

/**
 * Warna `atas` dengan opasitas `alfa` di depan warna `bawah`, jadi satu warna
 * buram.
 *
 * Dicampur di ruang sRGB, bukan linear — karena begitulah browser mencampur
 * `background: rgba(...)` di atas latar buram. Kalau dicampur di ruang linear
 * hasil hitungannya akan lebih terang daripada yang benar-benar tampil, dan
 * seluruh gunanya berkas ini hilang.
 */
export function tumpuk(atas: string, alfa: number, bawah: string): string {
  const a = keRgb(atas);
  const b = keRgb(bawah);
  return keHex([
    a[0] * alfa + b[0] * (1 - alfa),
    a[1] * alfa + b[1] * (1 - alfa),
    a[2] * alfa + b[2] * (1 - alfa),
  ] as Rgb);
}

/** Dari dua pilihan tinta, mana yang lebih terbaca di atas `latar`. */
export function tintaTerbaik(latar: string, pilihan: [string, string]): string {
  return kontras(pilihan[0], latar) >= kontras(pilihan[1], latar) ? pilihan[0] : pilihan[1];
}

export type Kaca = {
  /** opasitas lapisan kaca putih, 0–1 */
  alfa: number;
  /** warna tulisan di atasnya */
  tinta: string;
  /** rasio kontras yang benar-benar tercapai */
  rasio: number;
  /** true kalau target tidak tercapai walau kaca sudah dipekatkan sampai batas */
  kurang: boolean;
};

/**
 * Cari lapisan kaca paling TIPIS yang masih membuat tulisan terbaca di atas
 * `langit`.
 *
 * Kenapa "paling tipis": kaca ada untuk membuat tombol terbaca, bukan untuk
 * menutupi pemandangan. Tiap persen tambahan menghapus sedikit langit yang
 * jadi alasan halaman ini dibuat. Jadi dicari dari yang paling tipis ke atas,
 * dan berhenti begitu cukup — bukan dipatok di satu nilai yang aman untuk
 * semua keadaan.
 *
 * Cara kerjanya: kaca putih menerangkan latar. Di langit gelap, kaca tipis
 * sudah cukup dan tintanya putih. Di langit terang, kaca dipekatkan sampai
 * cukup terang untuk memakai tinta biru tua — dan justru di situlah tinta
 * berbalik dengan sendirinya, tanpa perlu daftar "waktu mana pakai warna apa".
 */
export function kacaSecukupnya(
  langit: string,
  tinta: [string, string],
  target = 4.5,
  batas = 0.52,
  mulai = 0.14,
  langkah = 0.02
): Kaca {
  let terbaik: Kaca | null = null;

  for (let a = mulai; a <= batas + 1e-9; a += langkah) {
    const dasar = tumpuk("#FFFFFF", a, langit);
    const t = tintaTerbaik(dasar, tinta);
    const r = kontras(t, dasar);
    if (r >= target) return { alfa: +a.toFixed(2), tinta: t, rasio: +r.toFixed(2), kurang: false };
    if (!terbaik || r > terbaik.rasio) {
      terbaik = { alfa: +a.toFixed(2), tinta: t, rasio: +r.toFixed(2), kurang: true };
    }
  }

  return terbaik!;
}

/**
 * Kalau kaca saja tidak cukup, ini jalan keluarnya: lapisan GELAP, bukan
 * terang. Dipakai panel settings, yang harus terbaca di keempat waktu
 * sekaligus dan karenanya tidak boleh bergantung pada langit tertentu.
 *
 * Mengembalikan opasitas paling kecil yang membuat tulisan putih mencapai
 * target di atas langit paling TERANG yang mungkin ada di belakangnya.
 */
export function lapisSecukupnya(
  langitTerang: string,
  lapis: string,
  target = 7,
  batas = 0.9
): number {
  for (let a = 0.3; a <= batas + 1e-9; a += 0.02) {
    const dasar = tumpuk(lapis, a, langitTerang);
    if (kontras("#FFFFFF", dasar) >= target) return +a.toFixed(2);
  }
  return batas;
}

/** `#RRGGBB` + alfa → `rgba(r, g, b, a)` untuk ditulis ke CSS. */
export function rgba(hex: string, alfa: number): string {
  const [r, g, b] = keRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${+alfa.toFixed(3)})`;
}

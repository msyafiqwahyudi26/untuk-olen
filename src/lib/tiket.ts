/**
 * ═══ TIKET MASUK ═══
 *
 * Sesudah PIN benar, Olen tidak boleh ditanyai lagi tiap membuka halaman.
 * Jadi ia dibekali tiket: sebaris teks berisi tanggal kedaluwarsa berikut
 * tanda tangan atasnya.
 *
 *
 * ── KENAPA TANDA TANGAN, BUKAN "sudah_masuk=1" ──
 *
 * Kue kering datang dari peramban, dan peramban dikendalikan siapa pun yang
 * memegangnya. Kue bertuliskan `sudah_masuk=1` bisa diketik sendiri oleh
 * siapa saja dalam sepuluh detik lewat konsol. Yang membuat tiket ini tidak
 * bisa dipalsukan adalah HMAC: tanpa tahu rahasianya, tanda tangan untuk
 * tanggal mana pun tidak bisa dihitung.
 *
 *
 * ── KENAPA BERKAS INI TIDAK MENYENTUH BASIS DATA ──
 *
 * Gerbangnya (`src/proxy.ts`) berjalan di runtime Edge, yang TIDAK punya
 * `node:sqlite`. Jadi pemeriksaan tiap permintaan tidak boleh bertanya ke
 * basis data sama sekali. Berkas ini karena itu memakai Web Crypto saja —
 * tersedia sama persis di Edge maupun Node, sehingga gerbang dan API
 * memverifikasi dengan kode yang SAMA. Dua salinan logika tanda tangan yang
 * sedikit berbeda adalah cara klasik melubangi gerbang tanpa sadar.
 */

const teks = new TextEncoder();

/** Umur tiket. Ini hadiah, bukan perbankan — jangan usir Olen tiap minggu. */
export const UMUR_TIKET_HARI = 120;

function keHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function kunciTanda(rahasia: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    teks.encode(rahasia),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Membuat tiket yang berlaku sampai `UMUR_TIKET_HARI` ke depan. */
export async function buatTiket(rahasia: string): Promise<string> {
  const sampai = Date.now() + UMUR_TIKET_HARI * 24 * 60 * 60 * 1000;
  const isi = String(sampai);
  const tanda = await crypto.subtle.sign("HMAC", await kunciTanda(rahasia), teks.encode(isi));
  return `${isi}.${keHex(tanda)}`;
}

/**
 * Benar hanya kalau tanda tangannya cocok DAN belum kedaluwarsa.
 *
 * Urutannya penting: tanggal diperiksa SESUDAH tanda tangan. Kalau dibalik,
 * penyerang bisa membedakan "tanggalnya salah bentuk" dari "tanda tangannya
 * salah" hanya dari kecepatan jawaban.
 */
export async function tiketSah(rahasia: string, tiket: string | undefined | null): Promise<boolean> {
  if (!tiket) return false;
  const pisah = tiket.split(".");
  if (pisah.length !== 2) return false;
  const [isi, tandaHex] = pisah;
  if (!/^\d+$/.test(isi) || !/^[0-9a-f]{64}$/.test(tandaHex)) return false;

  const tanda = new Uint8Array(
    (tandaHex.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)),
  );

  /* crypto.subtle.verify membandingkan dalam waktu tetap. Membandingkan
   * string tanda tangan dengan === akan bocor lewat waktu. */
  const cocok = await crypto.subtle.verify(
    "HMAC",
    await kunciTanda(rahasia),
    tanda,
    teks.encode(isi),
  );
  if (!cocok) return false;

  return Number(isi) > Date.now();
}

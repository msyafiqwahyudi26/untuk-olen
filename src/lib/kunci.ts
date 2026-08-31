import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { db } from "./db";

/**
 * ═══ KUNCI — PIN empat angka ═══
 *
 * Olen memasukkan empat angka untuk membuka, dan bisa menggantinya sendiri
 * dari Pengaturan.
 *
 *
 * ── SATU HAL YANG HARUS JUJUR DISEBUT ──
 *
 * PIN empat angka hanya punya 10.000 kemungkinan. Mesin mencobanya habis
 * dalam hitungan detik. Jadi yang benar-benar menjaga pintu ini BUKAN
 * panjangnya PIN, melainkan penundaan di bawah — dan itu berarti penundaan
 * itu bukan hiasan yang boleh dilonggarkan kalau terasa mengganggu.
 *
 * Empat angka tetap dipilih karena ini hadiah, bukan perbankan: yang
 * membukanya satu anak yang harus merasa sedang membuka buku hariannya,
 * bukan sedang login ke bank. Konsekuensinya diterima dengan sadar, dan
 * ditambal di tempat yang tepat.
 *
 * Tiga percobaan pertama bebas — orang memang salah pencet. Sesudah itu
 * penundaannya berlipat dua tiap kali, sampai maksimum 15 menit. Mencoba
 * 10.000 kemungkinan dengan aturan ini memakan waktu bertahun-tahun.
 *
 *
 * ── KENAPA MASIH DI-HASH KALAU CUMA 4 ANGKA ──
 *
 * Terhadap penyerang yang sudah memegang berkas basis datanya, scrypt atas
 * 10.000 kemungkinan tidak menolong banyak; ia akan menemukannya. Gunanya
 * lain: siapa pun yang KEBETULAN membuka `olen.db` — cadangan, salinan
 * pindahan, sesi kerja — tidak melihat PIN Olen tertulis polos di layar.
 * Itu perlindungan yang berbeda, dan tetap layak dipasang.
 */

const N = 16384;
const PANJANG = 32;

const scryptAsync = (pin: string, garam: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(pin, garam, PANJANG, { N }, (e, k) => (e ? reject(e) : resolve(k))),
  );

type BarisKunci = {
  sidik: string;
  garam: string;
  gagal: number;
  tunggu_sampai: number;
};

function baris(): BarisKunci | null {
  const r = db().prepare("SELECT sidik, garam, gagal, tunggu_sampai FROM kunci WHERE id = 1").get();
  return r ? ({ ...(r as object) } as BarisKunci) : null;
}

export const adaKunci = () => baris() !== null;

/** Empat angka, tidak kurang tidak lebih. */
export const bentukSah = (pin: string) => /^\d{4}$/.test(pin);

export async function pasangKunci(pin: string): Promise<void> {
  if (!bentukSah(pin)) throw new Error("PIN harus empat angka.");
  const garam = randomBytes(16);
  const sidik = await scryptAsync(pin, garam);
  db()
    .prepare(
      `INSERT INTO kunci (id, sidik, garam, gagal, tunggu_sampai) VALUES (1, ?, ?, 0, 0)
       ON CONFLICT(id) DO UPDATE SET sidik = excluded.sidik, garam = excluded.garam,
                                     gagal = 0, tunggu_sampai = 0`,
    )
    .run(sidik.toString("hex"), garam.toString("hex"));
}

/**
 * Penundaan sesudah gagal. Tiga percobaan pertama bebas.
 * gagal 4 → 2 dtk, 5 → 4, 6 → 8 ... dibatasi 15 menit.
 */
function jedaDetik(gagal: number): number {
  if (gagal < 4) return 0;
  return Math.min(2 ** (gagal - 3), 900);
}

export type HasilPeriksa =
  | { ok: true }
  | { ok: false; tungguDetik: number };

export async function periksaKunci(pin: string): Promise<HasilPeriksa> {
  const b = baris();
  /* Tidak ada kunci sama sekali = pintu terkunci mati, bukan terbuka lebar.
   * Gagalnya harus ke arah yang aman. */
  if (!b) return { ok: false, tungguDetik: 0 };

  const sisa = Math.ceil((b.tunggu_sampai - Date.now()) / 1000);
  if (sisa > 0) return { ok: false, tungguDetik: sisa };

  if (!bentukSah(pin)) return { ok: false, tungguDetik: 0 };

  const dicoba = await scryptAsync(pin, Buffer.from(b.garam, "hex"));
  const benar = timingSafeEqual(dicoba, Buffer.from(b.sidik, "hex"));

  if (benar) {
    db().prepare("UPDATE kunci SET gagal = 0, tunggu_sampai = 0 WHERE id = 1").run();
    return { ok: true };
  }

  const gagal = b.gagal + 1;
  const jeda = jedaDetik(gagal);
  db()
    .prepare("UPDATE kunci SET gagal = ?, tunggu_sampai = ? WHERE id = 1")
    .run(gagal, jeda > 0 ? Date.now() + jeda * 1000 : 0);
  return { ok: false, tungguDetik: jeda };
}

/** Ganti PIN. Yang lama tetap harus benar — kalau tidak, siapa pun yang
 *  sempat memakai perangkat Olen yang sudah terbuka bisa menguncinya. */
export async function ubahKunci(lama: string, baru: string): Promise<HasilPeriksa> {
  if (!bentukSah(baru)) return { ok: false, tungguDetik: 0 };
  const hasil = await periksaKunci(lama);
  if (!hasil.ok) return hasil;
  await pasangKunci(baru);
  return { ok: true };
}

/**
 * Rahasia penanda tangan tiket. Wajib ada — kalau kosong, seluruh gerbang
 * kehilangan arti, jadi lebih baik aplikasinya menolak jalan daripada jalan
 * sambil terbuka.
 */
export function rahasia(): string {
  const r = process.env.OLEN_RAHASIA;
  if (!r || r.length < 32) {
    throw new Error("OLEN_RAHASIA belum diisi (minimal 32 karakter). Lihat .env.local.");
  }
  return r;
}

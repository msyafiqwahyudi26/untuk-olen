/**
 * ═══ PASANG PIN ═══
 *
 *     node scripts/set-kunci.mjs 1234
 *
 * Dipakai sekali oleh yang membuatkan halaman ini, SEBELUM alamatnya dibuka
 * ke luar. Sesudah itu Olen mengganti sendiri dari Pengaturan dan skrip ini
 * tidak diperlukan lagi.
 *
 *
 * ── KENAPA TIDAK ADA "buat PIN saat pertama dibuka" ──
 *
 * Karena siapa pun yang kebetulan sampai duluan akan jadi yang menentukan
 * PIN-nya. Halaman yang menunggu untuk dikunci adalah halaman yang terbuka.
 * Tanpa baris di tabel `kunci`, gerbang menolak semua orang — termasuk yang
 * berniat memasang PIN lewat peramban. Itu disengaja.
 *
 *
 * ── PERHATIAN: angka di bawah harus SAMA dengan src/lib/kunci.ts ──
 *
 * Skrip ini menulis sidik jari; `periksaKunci()` yang membacanya. Kalau N
 * atau panjangnya berbeda, PIN yang benar akan selalu ditolak — dan gagalnya
 * terlihat seperti "PIN saya salah", bukan seperti kekeliruan konfigurasi.
 * Kalau salah satu diubah, ubah keduanya, lalu pasang ulang PIN-nya.
 */

import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import path from "node:path";

const N = 16384;
const PANJANG = 32;

const pin = process.argv[2];
if (!/^\d{4}$/.test(pin ?? "")) {
  console.error("Pakai: node scripts/set-kunci.mjs <empat angka>");
  process.exit(1);
}

const jalur = process.env.OLEN_DB ?? path.join(process.cwd(), "data", "olen.db");
const d = new DatabaseSync(jalur);

d.exec(`
  CREATE TABLE IF NOT EXISTS kunci (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    sidik         TEXT    NOT NULL,
    garam         TEXT    NOT NULL,
    gagal         INTEGER NOT NULL DEFAULT 0,
    tunggu_sampai INTEGER NOT NULL DEFAULT 0
  );
`);

const garam = randomBytes(16);
const sidik = scryptSync(pin, garam, PANJANG, { N });

d.prepare(
  `INSERT INTO kunci (id, sidik, garam, gagal, tunggu_sampai) VALUES (1, ?, ?, 0, 0)
   ON CONFLICT(id) DO UPDATE SET sidik = excluded.sidik, garam = excluded.garam,
                                 gagal = 0, tunggu_sampai = 0`,
).run(sidik.toString("hex"), garam.toString("hex"));

console.log(`PIN dipasang di ${jalur}. Tabel notes tidak disentuh.`);

/**
 * ═══ PINTU ═══
 *
 * Bagian mana dari kapsul ini yang sudah boleh dibuka Olen.
 *
 *
 * ── KENAPA ADA ──
 *
 * 31 Agustus 2026: turunan laut sudah tayang dan Olen sudah bisa masuk,
 * padahal narasinya masih separuh jadi dan sebagian medianya belum diunggah.
 * Yaya: "dia gabisa scroll dulu dong kayak tutup dulu karna belum sempurna."
 *
 * Menghapus kodenya bukan jawaban: pekerjaannya masih jalan dan tiap hari
 * di-deploy. Yang dibutuhkan saklar, bukan penghapusan.
 *
 *
 * ── KENAPA BAWAANNYA TERTUTUP ──
 *
 * `!== "1"` dan bukan `=== "0"`. Bedanya menentukan apa yang terjadi kalau
 * variabelnya lupa dipasang, salah eja, atau hilang waktu pindah server:
 *
 *   dengan `=== "0"`   lupa pasang  ->  TERBUKA. Olen masuk ke yang belum jadi.
 *   dengan `!== "1"`   lupa pasang  ->  tertutup. Yaya lihat pintunya masih
 *                                       terkunci, lalu memasangnya.
 *
 * Gagal ke arah yang aman. Yang salah harus terlihat oleh Yaya, bukan oleh
 * Olen.
 *
 *
 * ── KENAPA `NEXT_PUBLIC_` ──
 *
 * Nilainya dipanggang saat build, jadi mengubahnya berarti build ulang. Itu
 * DISENGAJA: satu-satunya orang yang boleh membuka pintu ini adalah orang
 * yang bisa men-deploy. Kalau dibaca saat berjalan (misalnya dari basis
 * data), ia jadi tombol yang bisa tertekan tanpa ada yang meninjau isinya
 * lebih dulu.
 *
 * Cara membuka: pasang `NEXT_PUBLIC_LAUT=1` di `.env.local`, lalu build ulang
 * dan `pm2 restart untuk-olen`.
 */

export const LAUT_TERBUKA = process.env.NEXT_PUBLIC_LAUT === "1";

/** Yang dibaca Olen kalau ia menekan tombolnya saat masih tertutup. */
export const PESAN_LAUT_TERTUTUP =
  "Bagian ini belum siap, Olen. Kakak masih ngerjain. Nanti kakak kabarin kalau udah bisa dibuka.";

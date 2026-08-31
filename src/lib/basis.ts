/**
 * ═══ BASIS ═══
 *
 * Halaman ini tidak lagi tinggal di akar domain. Ia dipasang di
 * `arcc-hivee.cloud/len`, jadi setiap alamat mutlak harus diawali `/len`.
 *
 * Next sudah mengurus ini sendiri untuk `<Link>`, `next/image`, dan
 * `/_next/*`. Yang TIDAK diurusnya adalah alamat yang kita tulis sendiri
 * sebagai teks: `<source src="/audio/beach.m4a">`, `<img src={`/memori/${x}`}>`.
 * Semuanya diam-diam jadi 404 begitu basePath dipasang — tanpa galat, tanpa
 * peringatan build. Suaranya cuma tidak berbunyi dan fotonya cuma kosong.
 *
 * Karena itu setiap alamat semacam itu melewati `aset()`. Kalau kelak
 * pemasangannya pindah, satu angka di sini yang berubah, bukan sepuluh
 * tempat yang harus dicari ulang.
 *
 * Nilainya datang dari NEXT_PUBLIC_BASE supaya ikut terbawa ke peramban;
 * `basePath` di next.config.ts tidak bisa dibaca dari kode klien.
 */

export const BASIS = process.env.NEXT_PUBLIC_BASE ?? "";

/** "/audio/beach.m4a" → "/len/audio/beach.m4a" */
export const aset = (jalur: string) => `${BASIS}${jalur.startsWith("/") ? jalur : `/${jalur}`}`;

/** Nama kue kering tiket masuk. Dipakai gerbang dan API, jadi satu tempat. */
export const KUE_TIKET = "len_tiket";

/**
 * Kue dibatasi ke jalur pemasangan, bukan "/". Di akar domain yang sama ada
 * aplikasi lain (arcc-hivee); tiket masuk Olen tidak ada urusannya dengan
 * aplikasi itu dan tidak perlu ikut terkirim ke sana.
 */
export const JALUR_KUE = BASIS || "/";

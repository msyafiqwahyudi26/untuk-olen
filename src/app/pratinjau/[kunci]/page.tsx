import { notFound } from "next/navigation";
import PratinjauLaut from "./PratinjauLaut";

/**
 * ═══ PRATINJAU TURUNAN LAUT ═══
 *
 * Alamat rahasia supaya Yaya bisa melihat layar yang masih digarap, tanpa
 * membuka pintunya untuk Olen.
 *
 *
 * ── KENAPA KUNCINYA DI ALAMAT, DAN DIPERIKSA DI SERVER ──
 *
 * Seluruh situs ini sudah di balik PIN, dan Olen tahu PIN-nya. Jadi "di
 * balik PIN" bukan pembatas apa pun di sini: yang membedakan Yaya dari Olen
 * harus sesuatu yang cuma Yaya punya.
 *
 * Kuncinya dibaca dari `PRATINJAU_KUNCI`, dan SENGAJA tanpa awalan
 * `NEXT_PUBLIC_`. Variabel ber-`NEXT_PUBLIC_` dipanggang ke dalam JavaScript
 * yang diunduh peramban, jadi siapa pun yang membuka berkasnya bisa
 * membacanya. Yang ini tinggal di server dan tidak pernah ikut terkirim.
 *
 * `notFound()`, bukan halaman "akses ditolak". Halaman penolakan memberi
 * tahu bahwa ada sesuatu di alamat itu; 404 tidak memberi tahu apa-apa.
 *
 *
 * ── KENAPA TIDAK PERLU BUILD ULANG ──
 *
 * Karena dibaca di server saat permintaan datang, mengganti kuncinya cukup
 * menyunting `.env.local` lalu `pm2 restart untuk-olen`. Bandingkan dengan
 * `NEXT_PUBLIC_LAUT` di `src/lib/pintu.ts`, yang memang HARUS build ulang:
 * itu disengaja, karena membuka pintu untuk Olen adalah keputusan yang
 * pantas melewati satu langkah lebih.
 *
 *
 * ── HUBUNGANNYA DENGAN PINTU ──
 *
 * Halaman ini TIDAK melihat `LAUT_TERBUKA` sama sekali. Ia jalan sendiri.
 * Jadi pintu untuk Olen bisa tetap terkunci selama berminggu-minggu
 * sementara Yaya terus meninjau di sini.
 */

export const dynamic = "force-dynamic";

export default async function Halaman({ params }: { params: Promise<{ kunci: string }> }) {
  const { kunci } = await params;
  const benar = process.env.PRATINJAU_KUNCI;

  /* Kalau kuncinya belum dipasang di server, halaman ini TIDAK ADA. Gagal ke
     arah aman: lupa memasang berarti tertutup, bukan terbuka untuk semua. */
  if (!benar || benar.length < 8 || kunci !== benar) notFound();

  return <PratinjauLaut />;
}

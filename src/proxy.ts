import { NextResponse, type NextRequest } from "next/server";
import { KUE_TIKET } from "@/lib/basis";
import { tiketSah } from "@/lib/tiket";

/**
 * ═══ GERBANG ═══
 *
 * Di Next 16 berkas ini bernama `proxy.ts`; sebelumnya `middleware.ts`.
 * Keduanya masih dikenali, tapi yang baru yang dipakai.
 *
 *
 * ── YANG PALING MUDAH TERLEWAT ──
 *
 * Layar PIN yang cuma menyembunyikan halaman TIDAK menjaga apa pun. Foto dan
 * rekaman suara Olen tinggal di `public/`, dan Next menyajikan isi `public/`
 * sebagai berkas statis — tanpa melewati satu pun komponen React. Artinya
 * `arcc-hivee.cloud/len/memori/senyum-2024.jpg` bisa diambil siapa saja yang
 * menebak namanya, sekalipun halamannya terkunci rapat.
 *
 * Karena itu gerbang ini duduk di depan SEMUA permintaan, bukan di depan
 * halaman. Yang dilewatkan cuma yang memang harus lewat supaya layar PIN-nya
 * sendiri bisa tampil.
 *
 *
 * ── KENAPA TIDAK BERTANYA KE BASIS DATA ──
 *
 * Berkas ini berjalan di runtime Edge, yang tidak punya `node:sqlite`.
 * Memaksanya ke sana akan gagal saat build, bukan saat jalan. Jadi
 * pemeriksaannya murni tanda tangan (lihat `src/lib/tiket.ts`) — dan itu
 * kebetulan juga yang paling cepat: tidak ada satu pun pembacaan disk untuk
 * tiap gambar yang diminta.
 */

const BEBAS = [
  "/masuk",           // layar PIN itu sendiri
  "/api/kunci",       // tempat PIN dikirim
  "/favicon.ico",
];

export const config = {
  /*
   * "/" DITULIS TERPISAH, dan itu bukan kelebihan.
   *
   * Next mengompilasi matcher dengan path-to-regexp, bukan sebagai regex
   * mentah. Di sana `/((?!…).*)` terbaca sebagai parameter WAJIB, dan
   * parameter wajib tidak pernah cocok dengan nilai kosong. Akibatnya pola
   * kedua menjaga setiap alamat KECUALI satu: akarnya sendiri.
   *
   * Ini ketahuan saat diuji, bukan saat ditulis. Gerbangnya tampak lengkap —
   * /v2, /design, foto, audio, semuanya 401 atau dialihkan — sementara
   * halaman depan menyajikan dirinya utuh kepada siapa pun. Justru halaman
   * yang paling mungkin dibuka orang asing yang paling mungkin terlewat,
   * karena kita menguji yang "dalam" dan menganggap yang "luar" pasti ikut.
   *
   * `_next/static` dan `_next/image` sengaja dikecualikan: keduanya dipanggil
   * puluhan kali per halaman, dan memverifikasi HMAC untuk tiap potongan JS
   * tidak menjaga apa pun (isinya kode, bukan isi pribadi) sambil
   * memperlambat semuanya.
   */
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BEBAS.some((j) => pathname === j || pathname.startsWith(`${j}/`))) {
    return NextResponse.next();
  }

  const rahasia = process.env.OLEN_RAHASIA;
  /* Tanpa rahasia, tidak ada tiket yang bisa dipercaya. Menutup semuanya
   * adalah satu-satunya jawaban yang benar; membuka semuanya karena
   * "konfigurasinya belum siap" persis kesalahan yang bikin data bocor. */
  if (!rahasia || rahasia.length < 32) {
    return new NextResponse("Gerbang belum disiapkan.", { status: 503 });
  }

  if (await tiketSah(rahasia, req.cookies.get(KUE_TIKET)?.value)) {
    return NextResponse.next();
  }

  /* Permintaan berkas (gambar, audio, JSON) tidak boleh dialihkan ke halaman
   * PIN — pengalihan itu akan tersaji sebagai gambar rusak atau JSON tak
   * terbaca. Jawaban yang jujur untuk keduanya adalah 401. */
  const inginHalaman = req.headers.get("accept")?.includes("text/html");
  if (!inginHalaman) {
    return new NextResponse("Terkunci.", { status: 401 });
  }

  const tujuan = req.nextUrl.clone();
  tujuan.pathname = "/masuk";
  /* Simpan yang tadi hendak dibuka, supaya sesudah PIN benar ia mendarat di
   * tempat yang dituju, bukan dilempar ke beranda. */
  tujuan.search = pathname === "/" ? "" : `?ke=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(tujuan);
}

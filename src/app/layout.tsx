import type { Metadata, Viewport } from "next";
import { Baloo_2, Comfortaa, Nunito } from "next/font/google";
import "./globals.css";
/* Design system. Urutannya penting: token dulu (nilai), lalu ui (bentuk yang
   memakai nilai itu), baru CSS tiap halaman (penempatan) yang dimuat sendiri
   oleh halamannya. */
import "@/design/tokens.css";
import "@/design/ui.css";

/*
 * ═══ HURUF ═══
 *
 * Dimuat lewat `next/font`, BUKAN `@import url(...)` di dalam CSS.
 *
 * Bukan soal gaya. Sampai 31 Agustus 2026 tokens.css memuatnya dengan
 * `@import url('https://fonts.googleapis.com/...')`, dan itu TIDAK PERNAH
 * BEKERJA: pipeline CSS Next 16 membuang baris itu, dan kata "googleapis"
 * tidak muncul satu kali pun di seluruh hasil build. Jadi selama berbulan-
 * bulan seluruh situs tampil dengan huruf cadangan sistem — Georgia untuk
 * judul, Segoe UI untuk badan — sementara kodenya terbaca seolah memakai
 * Fraunces dan Outfit. Tidak ada galat, tidak ada peringatan; build sukses
 * tiap kali. Yang menangkapnya cuma menghitung kemunculan "googleapis" di
 * berkas yang benar-benar tersaji.
 *
 * `next/font` menyalin berkas hurufnya ke domain sendiri saat build, jadi
 * ia tidak bisa hilang diam-diam: kalau gagal, build-nya yang gagal.
 *
 * Keduanya huruf VARIABEL, jadi `weight` sengaja tidak disebut — satu berkas
 * memuat seluruh rentang bobot (Fredoka 300..700, Nunito 200..1000). Menulis
 * daftar bobot justru memaksa Next mengunduh berkas statis satu per satu.
 */
const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-kartun",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-cerita",
  display: "swap",
});
/*
 * Huruf ketiga, khusus jurnal.
 *
 * Yaya: "font tulisan pake yang dreamy yang melengkung lengkung yang agak
 * lebih tebel."
 *
 * Comfortaa dibangun hampir seluruhnya dari busur lingkaran: tidak ada satu
 * pun ujung yang lurus, dan huruf seperti a, e, g melengkung penuh. Baloo
 * bulat tapi tetap punya batang lurus, jadi ia terbaca gemuk, bukan
 * melengkung. Bedanya persis yang diminta.
 *
 * Dipakai HANYA di jurnal. Turunan laut tetap Baloo, karena di sana yang
 * dibutuhkan ketegasan kutipan, bukan kelembutan.
 */
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-lengkung",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Len",
  description: "Sebuah tempat untuk mengingat.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#010610",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${nunito.variable} ${comfortaa.variable}`}>
      <head>
        {/* Kalau JavaScript mati atau gagal dimuat, semua yang menunggu
            animasi masuk tetap harus terbaca. */}
        <noscript>
          <style>{`.sr,.sr-l,.sr-r,.fade-in{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      {/*
        suppressHydrationWarning HANYA di <body>, dan bukan untuk menyembunyikan
        bug kita sendiri.
        Ekstensi Bitdefender di Chrome Yaya menyuntikkan atribut ke <body> dan
        ke setiap <div> (`bis_skin_checked`, `bis_register`, `__processed_…`)
        SEBELUM React sempat hidrasi. React membandingkan HTML server dengan
        DOM klien, menemukan atribut yang tidak pernah ia tulis, lalu melapor
        "hydration mismatch" — setiap kali halaman dibuka, dengan jejak tumpukan
        sepanjang layar.
        Akibatnya bukan cuma berisik: peringatan palsu yang muncul terus membuat
        peringatan SUNGGUHAN jadi tidak terlihat. Cakupannya sengaja sesempit
        mungkin — hanya <body>, jadi ketidakcocokan di dalam komponen tetap
        dilaporkan seperti biasa.
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

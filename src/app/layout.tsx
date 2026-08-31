import type { Metadata, Viewport } from "next";
import "./globals.css";
/* Design system. Urutannya penting: token dulu (nilai), lalu ui (bentuk yang
   memakai nilai itu), baru CSS tiap halaman (penempatan) yang dimuat sendiri
   oleh halamannya. */
import "@/design/tokens.css";
import "@/design/ui.css";

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
    <html lang="id">
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

import type { NextConfig } from "next";

/**
 * Dipasang di `arcc-hivee.cloud/len`, satu domain bersama aplikasi lain
 * (arcc-hivee) yang duduk di akar. `basePath` yang membuat Next menaruh
 * `/_next/*` miliknya di bawah `/len` juga, sehingga aset kedua aplikasi
 * tidak saling menimpa.
 *
 * NEXT_PUBLIC_BASE di `.env.local` harus SAMA dengan nilai ini. Yang ini
 * dipakai Next sendiri; yang itu dipakai kode klien untuk alamat yang kita
 * tulis sebagai teks (lihat src/lib/basis.ts). Kalau keduanya berbeda,
 * halamannya tetap terbuka tapi foto dan suaranya diam-diam 404.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/len",

  /**
   * Next 16 menolak permintaan ke /_next/* di mode dev kalau datang dari origin
   * selain localhost — hasilnya 403 dan halaman tidak pernah ter-hydrate.
   * Ini hanya berlaku untuk `next dev`; `next build && next start` tidak terpengaruh.
   */
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.loca.lt",
  ],
};

export default nextConfig;

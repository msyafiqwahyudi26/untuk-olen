import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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

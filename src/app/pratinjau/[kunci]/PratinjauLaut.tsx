"use client";

import { useState } from "react";
import Turunan from "@/components/v2/Turunan";
import { PALET, type Waktu } from "@/components/v2/waktu";
import "@/app/v2/v2.css";

/**
 * Pembungkus tipis. Turunan butuh `waktu` (warna air di permukaan) dan
 * `onNaik`; di perjalanan sungguhan keduanya datang dari Perjalanan.tsx.
 *
 * Di sini `onNaik` sengaja tidak ke mana-mana: pratinjau ini cuma untuk
 * melihat turunannya, dan memasang seluruh Perjalanan berarti ikut memasang
 * layar pembuka berikut gerbangnya. Sebagai gantinya tombol waktu di pojok
 * supaya ketiga suasana bisa diperiksa tanpa menunggu jam berganti.
 */
export default function PratinjauLaut() {
  const [waktu, setWaktu] = useState<Waktu>("siang");

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "max(0.8rem, env(safe-area-inset-top))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 90,
          display: "flex",
          gap: "0.4rem",
          padding: "0.35rem",
          borderRadius: "999px",
          background: "rgba(4,16,32,0.72)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        {(Object.keys(PALET) as Waktu[]).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWaktu(w)}
            style={{
              minHeight: 32,
              padding: "0.3rem 0.8rem",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              font: "inherit",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: waktu === w ? "#04101f" : "rgba(255,255,255,0.8)",
              background: waktu === w ? "rgba(244,228,176,0.9)" : "transparent",
            }}
          >
            {w}
          </button>
        ))}
      </div>
      <Turunan waktu={waktu} onNaik={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { PALET, type Waktu } from "./waktu";
import {
  DASAR,
  HUNI,
  cahayaDi,
  hadirDi,
  keruhDi,
  pijarDi,
  suhuDi,
  warnaAirDi,
} from "./kedalaman";
import { LumbaLumba, Paus, Terumbu, UburUbur } from "./laut/makhluk";
import "./turunan.css";

/**
 * ═══ TURUNAN — dari permukaan ke laut dalam ═══
 *
 * Layar kedua. Dua keputusan besar, keduanya sudah dibahas dan disepakati:
 *
 *
 * ── 1. Kenapa 2D, padahal layar pembukanya 3D ──
 *
 * Isi layar ini teks: kutipan percakapan, tulisan Olen. Di dalam kanvas WebGL
 * teks tidak bisa diblok, tidak kena Ctrl+F, tidak terbaca pembaca layar, dan
 * huruf­nya digambar lebih buruk. Yang justru jadi inti kapsul ini akan jadi
 * bagian yang paling menderita kalau dipaksa 3D.
 *
 * Dan yang menentukan: SCROLL ITU SUMBU KEDALAMAN. Yaya minta turunannya
 * menerus tanpa tahap, dan posisi gulir memetakan kedalaman secara menerus
 * tanpa celah, dengan momentum jari yang sudah dikenal semua orang. Di 3D hal
 * yang sama menuntut kamera dianimasikan sendiri, dan itu justru lebih mudah
 * membuat orang pusing.
 *
 * `kedalaman.ts` tidak tahu apa-apa soal ini. Kalau kelak layar ini jadi 3D,
 * berkas itu tetap berlaku apa adanya.
 *
 *
 * ── 2. Kenapa TIDAK ADA setState waktu menggulir ──
 *
 * Menggulir memancarkan puluhan peristiwa per detik. Menyimpan kedalaman di
 * useState berarti React me-render ulang seluruh layar sebanyak itu — persis
 * cacat yang membuat paus tersendat sampai 31 Agustus, waktu `setSpout`
 * dipanggil di dalam `useFrame`.
 *
 * Jadi kedalaman ditulis langsung ke DOM sebagai custom property CSS, dan CSS
 * yang memakainya. React merender layar ini SEKALI, lalu tidak lagi. Yang
 * bergerak cuma angka di dalam gaya.
 */

/** Tinggi lintasan gulir. 100vh pertama dipakai bingkai yang menempel. */
const TINGGI_VH = 560;

/** Marine snow: serpihan yang terus turun, jadi terlihat NAIK saat kita turun.
 *  Sebarannya tetap dan ditulis tangan — `Math.random()` saat render membuat
 *  server dan peramban menghasilkan susunan berbeda, dan React melaporkannya
 *  sebagai hydration mismatch. */
const SALJU = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 37) % 100,
  ukur: 1 + (i % 4) * 0.6,
  lama: 9 + (i % 7) * 2.4,
  tunda: (i % 11) * 1.3,
  jauh: 0.25 + ((i * 13) % 70) / 100,
}));

/** Di mana tiap penghuni berdiri di layar. Bukan acak: yang jauh lebih kecil
 *  dan lebih pucat, yang dekat lebih besar — itu yang membuat air terbaca
 *  punya ruang, bukan cuma warna. */
const TEMPAT = {
  terumbu: [
    { x: 4, bawah: -2, ukur: 0.9, jauh: 0.35 },
    { x: 62, bawah: -4, ukur: 1.25, jauh: 0.8 },
    { x: 84, bawah: -3, ukur: 0.7, jauh: 0.25 },
  ],
  lumba: [
    { x: 12, atas: 26, ukur: 0.55, jauh: 0.3 },
    { x: 58, atas: 46, ukur: 0.9, jauh: 0.7 },
  ],
  paus: [{ x: -6, atas: 34, ukur: 1, jauh: 0.55 }],
  ubur: [
    { x: 16, atas: 18, ukur: 0.5, jauh: 0.35 },
    { x: 48, atas: 52, ukur: 0.85, jauh: 0.75 },
    { x: 78, atas: 30, ukur: 0.62, jauh: 0.5 },
    { x: 34, atas: 70, ukur: 0.4, jauh: 0.25 },
  ],
};

export default function Turunan({ waktu, onNaik }: { waktu: Waktu; onNaik: () => void }) {
  const akar = useRef<HTMLDivElement>(null);
  const bacaan = useRef<HTMLParagraphElement>(null);
  const suhuEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = akar.current;
    if (!el) return;

    const permukaan = PALET[waktu].laut.shallow;
    const cahayaAtas = cahayaDi(0);
    let rafId = 0;
    let menunggu = false;

    const gambar = () => {
      menunggu = false;
      const bisaGulir = document.documentElement.scrollHeight - window.innerHeight;
      const maju = bisaGulir > 0 ? Math.min(1, Math.max(0, window.scrollY / bisaGulir)) : 0;
      const d = maju * DASAR;

      const g = el.style;
      g.setProperty("--air", warnaAirDi(d, permukaan));
      g.setProperty("--terang", String(cahayaDi(d) / cahayaAtas));
      g.setProperty("--keruh", String(keruhDi(d)));
      g.setProperty("--pijar", String(pijarDi(d)));
      for (const p of HUNI) g.setProperty(`--ada-${p.kunci}`, String(hadirDi(p, d)));

      /* Teks diperbarui lewat textContent, bukan lewat state. Alasannya sama
         dengan seluruh berkas ini: satu angka berubah, bukan satu layar. */
      if (bacaan.current) bacaan.current.textContent = `${Math.round(d)} m`;
      if (suhuEl.current) suhuEl.current.textContent = `${suhuDi(d).toFixed(1)}°`;
    };

    const onGulir = () => {
      if (menunggu) return;
      menunggu = true;
      rafId = requestAnimationFrame(gambar);
    };

    gambar();
    window.addEventListener("scroll", onGulir, { passive: true });
    window.addEventListener("resize", onGulir);
    return () => {
      window.removeEventListener("scroll", onGulir);
      window.removeEventListener("resize", onGulir);
      cancelAnimationFrame(rafId);
    };
  }, [waktu]);

  return (
    <div ref={akar} className="tr" style={{ height: `${TINGGI_VH}vh` }}>
      <div className="tr-tetap">
        {/* air */}
        <div className="tr-air" />

        {/* cahaya yang menembus dari permukaan; memudar sendiri karena
            kekuatannya diikat ke --terang */}
        <div className="tr-sinar" aria-hidden />

        {/* serpihan yang naik melewati kita */}
        <div className="tr-salju" aria-hidden>
          {SALJU.map((s, i) => (
            <span
              key={i}
              style={{
                left: `${s.x}%`,
                width: s.ukur,
                height: s.ukur,
                animationDuration: `${s.lama}s`,
                animationDelay: `-${s.tunda}s`,
                opacity: s.jauh,
              }}
            />
          ))}
        </div>

        {/* penghuni. Opasitasnya CSS variable, jadi tidak ada render ulang. */}
        <div className="tr-huni" aria-hidden>
          {TEMPAT.terumbu.map((t, i) => (
            <div key={`tk${i}`} className="mk mk-terumbu" style={taruh(t)}>
              <Terumbu />
            </div>
          ))}
          {TEMPAT.paus.map((t, i) => (
            <div key={`ps${i}`} className="mk mk-paus hanyut" style={taruh(t)}>
              <Paus />
            </div>
          ))}
          {TEMPAT.lumba.map((t, i) => (
            <div key={`ll${i}`} className="mk mk-lumba hanyut" style={taruh(t)}>
              <LumbaLumba />
            </div>
          ))}
          {TEMPAT.ubur.map((t, i) => (
            <div key={`uu${i}`} className="mk mk-ubur denyut" style={taruh(t)}>
              <UburUbur />
            </div>
          ))}
        </div>

        {/* bacaan kedalaman */}
        <div className="tr-baca">
          <p ref={bacaan} className="tr-meter">
            0 m
          </p>
          <p className="tr-suhu">
            <span ref={suhuEl}>29.0°</span>
          </p>
        </div>

        <button type="button" className="tr-naik" onClick={onNaik}>
          kembali ke permukaan
        </button>
      </div>
    </div>
  );
}

/** Satu tempat → gaya CSS. Yang jauh digambar lebih kecil dan lebih pucat;
 *  keduanya diturunkan dari satu angka `jauh`, bukan disetel terpisah. */
function taruh(t: {
  x: number;
  atas?: number;
  bawah?: number;
  ukur: number;
  jauh: number;
}): React.CSSProperties {
  return {
    left: `${t.x}%`,
    ...(t.atas !== undefined ? { top: `${t.atas}%` } : {}),
    ...(t.bawah !== undefined ? { bottom: `${t.bawah}%` } : {}),
    // @ts-expect-error custom property
    "--ukur": t.ukur * (0.55 + t.jauh * 0.75),
    "--jauh": t.jauh,
  };
}

"use client";

import { useEffect, useRef } from "react";
import type { NoteRow } from "@/lib/db";
import NoteSpace from "@/components/NoteSpace";
import { PALET, type Waktu } from "./waktu";
import { PUNCAK, bintangDi, ketinggianDi, suhuUdaraDi, udaraDi, warnaLangitDi } from "./ketinggian";
import "./jurnal.css";

/**
 * ═══ JURNAL — naik ke langit ═══
 *
 * Arah kedua perjalanan. Turun ke laut menyimpan kenangan yang sudah ada;
 * naik ke langit tempat Olen menulis sendiri.
 *
 * Dibangun persis seperti `Turunan.tsx`, dan itu disengaja: satu angka dari
 * `ketinggian.ts` menggerakkan semuanya, tidak ada setState saat menggulir,
 * dan tidak ada satu pun warna langit yang dipatok di CSS. Dua perjalanan
 * yang setara sebaiknya juga sama cara kerjanya — orang berikutnya yang
 * membaca salah satunya sudah otomatis mengerti yang lain.
 *
 *
 * ── YANG DIPAKAI ULANG, BUKAN DIBANGUN ULANG ──
 *
 * `NoteSpace.tsx`, tabel `notes`, dan `api/notes/route.ts` sudah ada sejak
 * v1 dan sudah menyimpan tulisan Olen. HANDOVER.md menyebutnya terang-
 * terangan: dipakai lagi, jangan dibangun ulang. Membangun ruang tulis kedua
 * berarti ada dua tempat tulisan bisa berada, dan cepat atau lambat salah
 * satunya akan terlupakan berisi sesuatu.
 *
 *
 * ── KENAPA RUANG TULISNYA TIDAK DI PUNCAK ──
 *
 * Ia muncul di sekitar sepertiga perjalanan, bukan di ujung. Menaruhnya di
 * puncak berarti Olen harus menggulir seluruh langit dulu setiap kali ingin
 * menulis satu kalimat — dan yang paling sering dilakukan seharusnya yang
 * paling dekat dijangkau. Puncaknya biar jadi tempat, bukan syarat.
 */

/** Tinggi lintasan gulir. Lebih pendek daripada turunan laut: di sini ada
 *  teks yang dibaca dan ditulis, dan menggulir jauh sambil membaca melelahkan. */
const TINGGI_VH = 420;

/** Bintang, sebaran R2 sama seperti di langit pantai — merata, bukan acak.
 *  Alasannya panjang dan ada di `Bintang` pada OpeningScene.tsx. */
const PLASTIK = 1.32471795724474602596;
const BINTANG = Array.from({ length: 220 }, (_, i) => {
  const n = i + 1;
  const u = (0.5 + n / PLASTIK) % 1;
  const v = (0.5 + n / (PLASTIK * PLASTIK)) % 1;
  return {
    x: u * 100 + Math.sin(n * 7.13) * 1.4,
    y: v * 100 + Math.cos(n * 3.71) * 1.4,
    r: 0.8 + ((n * 13) % 5) * 0.34,
    kelip: 3 + ((n * 7) % 5) * 1.1,
    tunda: ((n * 11) % 13) * 0.42,
  };
});

export default function Jurnal({
  waktu,
  catatan,
  onTurun,
}: {
  waktu: Waktu;
  catatan: NoteRow[];
  onTurun: () => void;
}) {
  const akar = useRef<HTMLDivElement>(null);
  const bacaan = useRef<HTMLParagraphElement>(null);
  const suhuEl = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = akar.current;
    if (!el) return;

    /* Langit di ketinggian nol WAJIB sama dengan langit yang barusan
       ditinggalkan, kalau tidak akan ada kedipan warna tepat di detik
       pertama. `warnaLangitDi(0, ...)` mengembalikan warna ini apa adanya —
       sudah diuji di ketinggian.ts. */
    const permukaan = PALET[waktu].langit[1];
    let rafId = 0;
    let menunggu = false;

    const gambar = () => {
      menunggu = false;
      const bisaGulir = document.documentElement.scrollHeight - window.innerHeight;
      const maju = bisaGulir > 0 ? Math.min(1, Math.max(0, window.scrollY / bisaGulir)) : 0;
      const h = ketinggianDi(maju);

      const langit = warnaLangitDi(h, permukaan);
      document.documentElement.style.backgroundColor = langit;

      const g = el.style;
      g.setProperty("--langit", langit);
      g.setProperty("--bintang", String(bintangDi(h)));
      g.setProperty("--udara", String(udaraDi(h)));

      if (bacaan.current) {
        bacaan.current.textContent = h < 10 ? `${h.toFixed(1)} km` : `${Math.round(h)} km`;
      }
      if (suhuEl.current) suhuEl.current.textContent = `${suhuUdaraDi(h).toFixed(0)}°`;
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
      document.documentElement.style.backgroundColor = "";
    };
  }, [waktu]);

  return (
    <div ref={akar} className="jr" style={{ height: `${TINGGI_VH}vh` }}>
      <div className="jr-tetap">
        <div className="jr-langit" />

        <div className="jr-bintang" aria-hidden>
          {BINTANG.map((b, i) => (
            <span
              key={i}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.r,
                height: b.r,
                animationDuration: `${b.kelip}s`,
                animationDelay: `-${b.tunda}s`,
              }}
            />
          ))}
        </div>

        {/* Awan tipis yang tertinggal di bawah begitu kita naik. Kepekatannya
            terikat --udara, jadi ia menghilang sendiri tanpa ada yang
            mengatur kapan. */}
        <div className="jr-awan" aria-hidden />

        <div className="jr-baca">
          <p ref={bacaan} className="jr-km">
            0.0 km
          </p>
          <p className="jr-suhu">
            <span ref={suhuEl}>29°</span>
          </p>
        </div>

        <button type="button" className="jr-turun" onClick={onTurun}>
          kembali ke bumi
        </button>
      </div>

      {/* Isi yang digulir. Di luar bingkai yang menempel, jadi ia benar-benar
          bergerak melewati langitnya. */}
      <div className="jr-isi">
        <section className="jr-sambut">
          <h2 className="jr-judul serif">your sky</h2>
          <p className="jr-lede">
            anything you want to keep, keep it here. nobody else can see it.
          </p>
        </section>

        <section className="jr-tulis">
          <NoteSpace initial={catatan} />
        </section>
      </div>
    </div>
  );
}

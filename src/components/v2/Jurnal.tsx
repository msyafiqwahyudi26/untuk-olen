"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NoteRow } from "@/lib/db";
import NoteSpace from "@/components/NoteSpace";
import { PALET, type Waktu } from "./waktu";
import { bintangDi, ketinggianDi, suhuUdaraDi, udaraDi, warnaLangitDi } from "./ketinggian";
import "./jurnal.css";

/**
 * ═══ JURNAL — naik ke langit ═══
 *
 * Arah kedua perjalanan. Turun ke laut menyimpan kenangan yang sudah ada;
 * naik ke langit tempat Olen menulis sendiri.
 *
 *
 * ── GULIRNYA DIBALIK, DAN ITU BUKAN KEROMPOSAN ──
 *
 * Halaman ini berangkat dari DASAR lintasan gulir, dan naik berarti menggulir
 * KE ATAS. Versi pertama memakai arah biasa — gulir ke bawah untuk naik — dan
 * itu terasa salah begitu dicoba, dengan alasan yang sederhana: kalau kita
 * benar-benar naik, yang ada di bawah kita harus JATUH ke bawah layar. Gulir
 * ke bawah membuat isinya naik, artinya kitalah yang turun.
 *
 * Ongkosnya satu: halaman harus dilempar ke dasar lintasan saat dibuka,
 * SEBELUM bingkai pertama tergambar, kalau tidak Olen melihat sekejap puncak
 * langit lalu terlempar ke bawah. Itu sebabnya pelemparannya di
 * useLayoutEffect terpisah, bukan menumpang di useEffect yang mengurus
 * pendengar gulir.
 *
 *
 * ── KENAPA SEPERTI BUKU ──
 *
 * Catatan lama ditampilkan bertanggal, satu halaman satu entri, bukan sebagai
 * daftar. Daftar mengundang orang membaca sekilas dari atas ke bawah; buku
 * mengundang berhenti di satu halaman. Yang ditulis di sini bukan tugas yang
 * perlu ditinjau ulang, melainkan hari-hari yang perlu dibaca satu per satu.
 *
 * `NoteSpace.tsx`, tabel `notes`, dan `api/notes/route.ts` DIPAKAI ULANG,
 * tidak dibangun ulang — HANDOVER.md menyebutnya terang-terangan. Yang
 * ditambahkan cuma dua prop kecil supaya daftar bawaannya bisa dimatikan dan
 * catatan baru dilaporkan ke sini.
 */

/** Tinggi lintasan gulir. */
const TINGGI_VH = 460;

/** Bintang, sebaran R2 — merata, bukan acak. Alasannya di `Bintang`
 *  pada OpeningScene.tsx. */
const PLASTIK = 1.32471795724474602596;
const BINTANG = Array.from({ length: 240 }, (_, i) => {
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

/**
 * Bintang jatuh.
 *
 * Empat saja, dan jedanya panjang — 14 sampai 26 detik. Bintang jatuh yang
 * lewat tiap dua detik berhenti jadi kejadian dan berubah jadi hiasan
 * bergerak; yang membuatnya berarti justru karena jarang, dan karena orang
 * sempat merasa hampir melewatkannya.
 */
const JATUH = [
  { x: 18, y: 12, panjang: 22, sudut: 32, putaran: 15, mulai: 3 },
  { x: 62, y: 6, panjang: 30, sudut: 26, putaran: 23, mulai: 11 },
  { x: 84, y: 24, panjang: 18, sudut: 38, putaran: 28, mulai: 7 },
  { x: 38, y: 30, panjang: 26, sudut: 29, putaran: 19, mulai: 17 },
];

/** "2026-08-30 19:38:36" → "30 Agustus 2026" */
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
function tanggalPanjang(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return s;
  return `${Number(m[3])} ${BULAN[Number(m[2]) - 1]} ${m[1]}`;
}

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
  const [tulisan, setTulisan] = useState<NoteRow[]>(catatan);

  /**
   * useLayoutEffect, BUKAN useEffect.
   *
   * Ia berjalan sesudah DOM tersusun tapi SEBELUM peramban menggambar, jadi
   * lemparan ke dasar lintasan tidak pernah terlihat. Dengan useEffect biasa,
   * Olen akan melihat satu bingkai berisi puncak langit lalu terlempar ke
   * bawah — kedipan pendek yang justru paling terasa karena terjadi tepat di
   * detik pertama.
   *
   * Aman dari peringatan SSR: layar ini baru dipasang sesudah Olen menekan
   * tombolnya, jadi ia tidak pernah dirender di server.
   */
  useLayoutEffect(() => {
    /* `instant`, bukan mulus: ini bukan perjalanan, ini menaruh Olen di titik
       berangkatnya. */
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
  }, []);

  useEffect(() => {
    const el = akar.current;
    if (!el) return;

    const permukaan = PALET[waktu].langit[1];
    let rafId = 0;
    let menunggu = false;

    const gambar = () => {
      menunggu = false;
      const bisaGulir = document.documentElement.scrollHeight - window.innerHeight;
      /* DIBALIK: di dasar lintasan (scrollY maksimum) kita di permukaan,
         di puncak lintasan (scrollY nol) kita di ketinggian penuh. */
      const maju = bisaGulir > 0 ? 1 - Math.min(1, Math.max(0, window.scrollY / bisaGulir)) : 0;
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

        {/* Bintang jatuh. Kepekatannya ikut --bintang, jadi ia tidak pernah
            melintas di langit siang yang masih terang — di sana ia memang
            tidak akan terlihat, dan menampilkannya justru merusak. */}
        <div className="jr-jatuh" aria-hidden>
          {JATUH.map((j, i) => (
            <span
              key={i}
              style={{
                left: `${j.x}%`,
                top: `${j.y}%`,
                width: `${j.panjang}vmin`,
                transform: `rotate(${j.sudut}deg)`,
                /* Durasinya SELURUH putaran, bukan lamanya melintas.
                   Keyframes-nya hanya terlihat di 8 persen pertama, jadi satu
                   putaran 15 detik memberi lintasan sekitar 1,2 detik lalu
                   sunyi 13,8 detik. Versi pertama memakai lamanya melintas
                   sebagai durasi, jadi bintangnya jatuh tiap 1,5 detik —
                   kebalikan dari yang tertulis di catatannya sendiri. */
                animationDuration: `${j.putaran}s`,
                animationDelay: `-${j.mulai}s`,
              }}
            />
          ))}
        </div>

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

      {/*
        Urutan DOM-nya terbalik dari biasanya, mengikuti arah gulirnya: yang
        paling atas di halaman adalah yang paling tinggi di langit, dan Olen
        berangkat dari yang paling bawah.
      */}
      <div className="jr-isi">
        {tulisan.length > 0 && (
          <section className="jr-buku" aria-label="Catatan sebelumnya">
            {tulisan.map((n) => (
              <article key={n.id} className="jr-halaman">
                <header className="jr-tanggal">{tanggalPanjang(n.created_at)}</header>
                <p className="jr-badan">{n.body}</p>
              </article>
            ))}
          </section>
        )}

        <section className="jr-tulis">
          <h2 className="jr-judul serif">hari ini</h2>
          <NoteSpace
            initial={[]}
            daftar={false}
            onTambah={(n) => setTulisan((t) => [n, ...t])}
          />
        </section>

        <section className="jr-sambut">
          <h2 className="jr-judul serif">sky notes</h2>
          <p className="jr-lede">
            anything you want to keep, keep it here. nobody else can see it.
          </p>
          <p className="jr-ajak" aria-hidden>
            scroll up
          </p>
        </section>
      </div>
    </div>
  );
}

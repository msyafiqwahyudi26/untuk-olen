"use client";

import { useEffect, useRef } from "react";
import { PALET, type Waktu } from "./waktu";
import { warnaAirDi } from "./kedalaman";
import { warnaLangitDi } from "./ketinggian";
import "./selam.css";

/**
 * ═══ SELAM — peralihan dari pantai ke bawah air ═══
 *
 * Sampai sekarang menekan "keep going" langsung mengganti layar dalam satu
 * bingkai. Yang terjadi bukan berpindah tempat melainkan halaman diganti, dan
 * itu persis yang dilaporkan: "patah, tidak ada transisi".
 *
 *
 * ── KENAPA AIRNYA NAIK, BUKAN LAYARNYA MEMUDAR ──
 *
 * Memudar itu bahasa halaman web: satu gambar hilang, gambar lain muncul.
 * Yang ingin dikatakan di sini bukan itu, melainkan "kamu masuk ke dalam
 * air". Jadi airnya yang naik menelan layar, dengan puncak berombak yang
 * bergerak menyamping — bukan garis lurus yang menyapu, karena garis lurus
 * terbaca sebagai tirai, bukan sebagai permukaan laut.
 *
 *
 * ── YANG MEMBUATNYA TIDAK TERLIHAT SEBAGAI DUA HALAMAN ──
 *
 * Warna tirai air ini BUKAN warna yang dipilih. Ia `warnaAirDi(0, permukaan)`
 * — persis warna yang dipakai layar turunan pada kedalaman nol, diambil dari
 * berkas yang sama.
 *
 * Akibatnya waktu tirai ini akhirnya memudar, tidak ada warna yang berubah:
 * yang di baliknya sudah warna yang sama. Yang terlihat cuma ombak dan buih
 * yang hilang, lalu ternyata kita sudah di dalam air. Kalau warnanya dipatok
 * di sini, akan ada kedipan tepat di detik terakhir — dan justru detik
 * terakhir yang paling diingat orang.
 *
 * Naik ke permukaan memakai tirai yang sama, dibalik arahnya.
 */

/**
 * Satu animasi untuk kedua arah, bukan dua.
 *
 * Turun dan naik sama-sama: air naik menelan layar, diam sejenak, lalu
 * memudar. Sempat saya buat versi "naik" yang membalik arahnya — air surut
 * dari layar penuh — dan itu keliru: pada arah naik, layar di baliknya sedang
 * gelap (laut dalam) sementara tirainya berwarna permukaan yang terang, jadi
 * tirai yang langsung tampil penuh akan berkedip putih di bingkai pertama.
 *
 * Dengan arah yang sama, tirai selalu MULAI dari nol dan tumbuh, jadi tidak
 * ada bingkai pertama yang mengejutkan. Dan artinya tetap terbaca: air naik
 * menutupi, lalu surut, dan ternyata kita sudah di permukaan.
 */
export default function Selam({
  waktu,
  jenis = "air",
  onTutup,
  onSelesai,
}: {
  waktu: Waktu;
  /**
   * "air"  — air naik dari bawah menelan layar. Untuk turun ke laut.
   * "awan" — awan turun dari atas menyelimuti. Untuk naik ke langit.
   *
   * Dua arah, dua bahan, dan itu bukan hiasan: yang menaikkan air dari bawah
   * untuk perjalanan KE ATAS akan membaca sebagai tenggelam, bukan terbang.
   * Arah datangnya tirai adalah satu-satunya hal yang memberi tahu ke mana
   * kita sedang bergerak, sebelum layar tujuannya sempat terlihat.
   */
  jenis?: "air" | "awan";
  /** Dipanggil saat layar tertutup PENUH dan diam. Tukar layarnya di sini. */
  onTutup: () => void;
  /** Dipanggil saat tirainya sudah habis memudar. Lepas komponennya di sini. */
  onSelesai: () => void;
}) {
  const tutup = useRef(onTutup);
  const selesai = useRef(onSelesai);
  tutup.current = onTutup;
  selesai.current = onSelesai;

  useEffect(() => {
    /* Sebagian orang pusing oleh gerak. Kalau sistemnya bilang begitu,
       peralihannya dilewati sama sekali — bukan dipercepat, karena gerak
       cepat justru lebih memusingkan daripada gerak lambat. */
    const diam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (diam) {
      tutup.current();
      selesai.current();
      return;
    }
    /* 1050 ms jatuh di tengah jeda diam animasinya (930–1170 ms), waktu layar
       tertutup penuh dan tidak ada apa pun yang bergerak. Di situlah layarnya
       ditukar, supaya pergantiannya tidak pernah terlihat. Kalau angka di
       selam.css diubah, angka ini ikut. */
    const a = window.setTimeout(() => tutup.current(), 1050);
    const b = window.setTimeout(() => selesai.current(), 1520);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  /* Warnanya BUKAN dipilih. Untuk turun ia warna air di kedalaman nol;
     untuk naik ia warna langit di ketinggian nol. Keduanya diambil dari
     berkas fisika yang sama dengan layar tujuannya, jadi saat tirai memudar
     tidak ada warna yang berubah — yang di baliknya sudah warna yang sama. */
  const warna =
    jenis === "awan"
      ? warnaLangitDi(0, PALET[waktu].langit[1])
      : warnaAirDi(0, PALET[waktu].laut.shallow);

  return (
    <div className={`sl sl-${jenis}`} style={{ ["--air-atas" as string]: warna }} aria-hidden>
      <div className="sl-badan">
        {/* Puncak berombak. Dua salinan bersebelahan supaya gesernya bisa
            berulang tanpa sambungan yang terlihat. */}
        {jenis === "awan" ? (
          <>
            {/* Tepi awan: gumpalan bulat, bukan gelombang sinus. Awan tidak
                punya puncak dan lembah yang berulang teratur; ia punya bongkah
                yang saling menumpuk, dan itulah yang membuat mata langsung
                membacanya sebagai awan alih-alih sebagai air terbalik. */}
            <svg className="sl-awan" viewBox="0 0 240 40" preserveAspectRatio="none">
              <path d="M0 0h240v18c-10 0-14 9-24 9s-14-11-25-11-15 12-26 12-15-10-26-10-14 11-25 11-15-12-26-12-14 10-24 10-15-9-24-9z" />
            </svg>
            <svg className="sl-awan sl-awan-2" viewBox="0 0 240 40" preserveAspectRatio="none">
              <path d="M0 0h240v14c-12 0-16 11-28 11s-16-13-29-13-17 12-29 12-17-10-29-10-16 12-28 12-17-13-29-13-16 11-28 11z" />
            </svg>
          </>
        ) : null}
        <svg className="sl-ombak" viewBox="0 0 240 24" preserveAspectRatio="none">
          <path d="M0 24V10c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0 20-6 30 0 20 6 30 0 20-6 30 0v14z" />
        </svg>
        <svg className="sl-ombak sl-ombak-2" viewBox="0 0 240 24" preserveAspectRatio="none">
          <path d="M0 24V12c12-7 24-5 36 2s24 5 36-2 24-5 36 2 24 5 36-2 24-5 36 2 24 5 36-2v10z" />
        </svg>
        {/* Garis buih tipis di bibir air. Yang membuat tepinya terbaca sebagai
            permukaan, bukan sebagai potongan. */}
        <span className="sl-buih" />
      </div>
    </div>
  );
}

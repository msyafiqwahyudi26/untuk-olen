"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Settings, { type Pengaturan } from "./Settings";
import Langit from "./Langit";
import { waktuSekarang, JAM_WAKIL } from "./waktu";
import { variabelTema } from "@/design/tema";
import { aset } from "@/lib/basis";

const OpeningScene = dynamic(() => import("./OpeningScene"), { ssr: false });

/**
 * ═══ Tata suara halaman ini ═══
 *
 * Tiga lapis, masing-masing punya tugas:
 *
 *   ombak   — nyala sejak halaman dibuka, terus-menerus, pelan. Ini latar
 *             ruangannya, bukan bagian dari cerita.
 *   lagu    — nyala saat tombol ditekan, naik pelan sendirian dulu.
 *   suara   — montase Olen, baru masuk setelah lagunya sempat berdiri.
 *
 * Urutan itu penting: kalau ketiganya menyala bersamaan, kalimat pertama
 * Olen tertimbun intro lagu dan momennya hilang. Jadi ada JEDA_SUARA detik
 * di mana yang terdengar cuma ombak dan piano, lalu suaranya masuk pelan
 * (berkasnya sendiri sudah punya fade 1,6 detik di awal), dan lagunya
 * mengalah ke belakang.
 *
 * Soal ombak yang nyala sendiri: browser melarang audio autoplay, dan itu
 * aturan yang benar. Yang bisa dilakukan adalah mencoba — kalau ditolak,
 * ombaknya menyala pada sentuhan pertama apa pun di halaman (gerak mouse,
 * klik, tombol, scroll). Dari sisi Olen, praktis selalu sudah menyala.
 *
 * Lagu ditaruh sendiri oleh Yaya. track-1 = Bundle of Joy (layar ini),
 * track-2 = Stuff We Did (layar berikutnya), track-3 = Runaway (piano).
 * Kalau berkasnya belum ada, halaman tetap jalan — cuma ombaknya saja.
 *
 * Ketiganya rekaman berhak cipta. Halaman ini tidak boleh dipublikasikan
 * ke internet — lihat DEPLOY.md.
 */

const OMBAK_TENANG = 0.34;   // ombak waktu tidak ada apa-apa
const OMBAK_MENGALAH = 0.12; // ombak waktu Olen bicara
const LAGU_UTAMA = 0.36;
const LAGU_MENGALAH = 0.09;
const JEDA_SUARA = 6.5;      // detik: lagu berdiri dulu, baru Olen masuk
export default function Opening() {
  const [quality, setQuality] = useState<"low" | "high" | null>(null);
  const [started, setStarted] = useState(false);
  const [voice, setVoice] = useState(false);
  const [bukaSet, setBukaSet] = useState(false);

  /**
   * Waktu awal SELALU "siang", bukan waktu sebenarnya.
   *
   * Server tidak tahu jam berapa di tempat Olen, jadi kalau nilai awalnya
   * dihitung dari `new Date()` maka HTML server dan HTML klien berbeda dan
   * React melapor hydration mismatch — yang asli, bukan ulah ekstensi.
   * Jam sebenarnya baru dibaca sesudah halaman hidup, di useEffect.
   */
  const [set, setSet] = useState<Pengaturan>({
    bisu: false,
    ombak: true,
    lagu: true,
    waktu: "siang",
    waktuOtomatis: true,
  });
  const muted = set.bisu;

  const seaRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Salah kalau berkas ombaknya tidak bisa dimuat sama sekali.
   *
   * Berkas audio TIDAK ikut git — sengaja: tiga lagunya berhak cipta dan
   * montasenya suara Olen. Akibatnya di server yang baru disiapkan,
   * `public/audio` cuma berisi keterangan dan halaman ini berjalan tanpa
   * satu pun bunyi.
   *
   * Sebelum ini tombol suara tetap menulis "sound on" dalam keadaan itu. Ia
   * berbohong, dan bohongnya mahal: yang membuka halaman menyangka
   * pemutarnya rusak lalu mencari sebabnya di tempat yang salah. Persis itu
   * yang terjadi 31 Agustus, dua kali — di HP lalu di laptop — sebelum
   * ketahuan bahwa berkasnya memang tidak pernah ada di sana.
   *
   * Yang berubah hanya keterangan tombolnya. Halamannya tetap berjalan penuh
   * tanpa suara, seperti dirancang semula.
   */
  const [adaSuara, setAdaSuara] = useState(true);

  /**
   * ── KENAPA onError DI <audio> TIDAK CUKUP ──
   *
   * Percobaan pertama memasang `onError` langsung di elemen <audio>. Itu
   * tidak pernah berbunyi, dan tombolnya tetap mengaku "sound on" di HP
   * meski berkasnya 404.
   *
   * Sebabnya ada di spesifikasi HTML: ketika sebuah <audio> memakai anak
   * <source>, kegagalan dilaporkan sebagai peristiwa `error` pada elemen
   * <source> yang gagal — BUKAN pada <audio>-nya. Dan `error` tidak
   * menggelembung. Jadi pendengar di induknya tidak akan pernah kena.
   *
   * Dua jalan dipakai bersama, karena masing-masing bocor sendirian:
   *
   *   1. Pendengar fase TANGKAP di <audio>. Fase tangkap turun dari akar ke
   *      sasaran, jadi ia melewati <audio> sebelum sampai ke <source> —
   *      bekerja walau peristiwanya tidak menggelembung.
   *   2. Pemeriksaan `networkState` sesudah dua detik. Kalau semua sumber
   *      habis, nilainya jadi NETWORK_NO_SOURCE. Ini jaring untuk hal yang
   *      gagal tanpa memancarkan error sama sekali, misalnya jenis berkas
   *      yang tidak didukung peramban.
   */
  useEffect(() => {
    const el = seaRef.current;
    if (!el) return;
    const periksa = () => {
      if (el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) setAdaSuara(false);
    };
    const gagal = () => setAdaSuara(false);
    el.addEventListener("error", gagal, true);
    const t = window.setTimeout(periksa, 2000);
    return () => {
      el.removeEventListener("error", gagal, true);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const small = window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency ?? 4;
    setQuality(small || cores <= 4 ? "low" : "high");
    setSet((p) => (p.waktuOtomatis ? { ...p, waktu: waktuSekarang() } : p));
  }, []);

  /**
   * Kalau mengikuti jam, langitnya ikut berpindah waktu Olen membiarkan
   * halaman terbuka lama — diperiksa tiap menit. Ini bukan sekadar kerapian:
   * halaman ini memang dimaksudkan untuk dibuka berkali-kali di jam berbeda.
   */
  useEffect(() => {
    if (!set.waktuOtomatis) return;
    const id = window.setInterval(() => {
      const w = waktuSekarang();
      setSet((p) => (p.waktuOtomatis && p.waktu !== w ? { ...p, waktu: w } : p));
    }, 60000);
    return () => window.clearInterval(id);
  }, [set.waktuOtomatis]);

  const ubahSet = useCallback((patch: Partial<Pengaturan>) => {
    setSet((p) => ({ ...p, ...patch }));
  }, []);

  /**
   * Jam pecahan yang menentukan letak matahari dan bulan di busurnya.
   *
   * Kalau mengikuti jam: jam sebenarnya, dengan menit — jadi keduanya
   * benar-benar merayap selama halaman dibuka, bukan diam di satu titik.
   * Kalau dipilih manual: jam wakil untuk waktu itu.
   *
   * Nilai awal SELALU jam wakil siang, bukan jam sebenarnya — alasannya sama
   * dengan `waktu` di atas: server tidak tahu jam berapa di tempat Olen.
   */
  const [jam, setJam] = useState(JAM_WAKIL.siang);
  useEffect(() => {
    const hitung = () => {
      if (!set.waktuOtomatis) return setJam(JAM_WAKIL[set.waktu]);
      const d = new Date();
      setJam(d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600);
    };
    hitung();
    const id = window.setInterval(hitung, 20000);
    return () => window.clearInterval(id);
  }, [set.waktuOtomatis, set.waktu]);

  /**
   * Pelan-pelan naik/turun, tidak pernah memotong tiba-tiba.
   *
   * `fades` mencatat permintaan terakhir untuk tiap elemen. Tanpa itu, dua
   * fade bisa jalan bersamaan dan yang paling lama menang: waktu ditekan
   * MULAI, musik di-fade naik ke 0.34 selama 3 detik, lalu suara Olen mulai
   * dan meminta turun ke 0.1 selama 1.2 detik. Fade 1.2 detik selesai duluan,
   * fade 3 detik terus menimpanya sampai habis — jadi musiknya tidak pernah
   * mengalah persis di kalimat pertama Olen.
   */
  const fades = useRef(new WeakMap<HTMLAudioElement, number>());
  const fade = useCallback((el: HTMLAudioElement | null, to: number, ms = 900) => {
    if (!el) return;
    const token = (fades.current.get(el) ?? 0) + 1;
    fades.current.set(el, token);
    const from = el.volume;
    const t0 = performance.now();
    const step = () => {
      if (fades.current.get(el) !== token) return; // sudah disusul permintaan baru
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }, []);

  /**
   * Ombak menyala sendiri sejak halaman dibuka.
   *
   * Dicoba langsung; kalau browser menolak (kebijakan autoplay), dipasang
   * satu penangkap sentuhan apa pun — gerak mouse, klik, tombol, scroll,
   * sentuh layar. Sekali kena, penangkapnya dilepas.
   */
  useEffect(() => {
    const sea = seaRef.current;
    if (!sea) return;
    let done = false;

    const nyalakan = () => {
      if (done || !sea.paused || !set.ombak || set.bisu) return;
      sea.volume = 0;
      void sea
        .play()
        .then(() => {
          done = true;
          fade(sea, OMBAK_TENANG, 3000);
        })
        .catch(() => {});
    };

    nyalakan();
    const ev: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"];
    const on = () => {
      nyalakan();
      if (done) ev.forEach((e) => window.removeEventListener(e, on));
    };
    ev.forEach((e) => window.addEventListener(e, on, { passive: true }));
    return () => ev.forEach((e) => window.removeEventListener(e, on));
  }, [fade, set.ombak, set.bisu]);

  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const start = useCallback(() => {
    const sea = seaRef.current;
    const music = musicRef.current;
    const v = voiceRef.current;
    if (!v) return;

    // ombak biasanya sudah jalan; kalau belum (autoplay ditolak dan ini
    // sentuhan pertama), tombol ini sekaligus yang menyalakannya
    if (sea && sea.paused) {
      sea.volume = 0;
      void sea.play().then(() => fade(sea, OMBAK_TENANG, 2500)).catch(() => {});
    }

    setStarted(true);

    if (music && set.lagu && !set.bisu) {
      music.volume = 0;
      void music.play().then(() => fade(music, LAGU_UTAMA, 4000)).catch(() => {});
    }

    // Jeda dulu. Ini bagian yang paling gampang dilewatkan dan paling
    // terasa: kalimat pertama Olen tidak boleh berebut dengan intro lagu.
    timer.current = window.setTimeout(() => {
      v.currentTime = 0;
      void v.play().then(() => setVoice(true)).catch(() => {});
    }, JEDA_SUARA * 1000);
  }, [fade, set.lagu, set.bisu]);

  const replayVoice = useCallback(() => {
    const v = voiceRef.current;
    if (!v) return;
    if (voice) {
      v.pause();
      v.currentTime = 0;
      setVoice(false);
    } else {
      v.currentTime = 0;
      void v.play().then(() => setVoice(true)).catch(() => {});
    }
  }, [voice]);

  /**
   * Satu tempat yang menerjemahkan pengaturan jadi keadaan tiap elemen audio.
   *
   * Sengaja satu effect, bukan tersebar di tiap sakelar: kalau tiap tombol
   * mengubah elemennya sendiri-sendiri, kombinasi seperti "bisu menyala lalu
   * ombak dimatikan lalu bisu dimatikan" akan meninggalkan keadaan yang tidak
   * konsisten. Di sini keadaan selalu diturunkan ulang dari nol.
   */
  useEffect(() => {
    const sea = seaRef.current;
    const music = musicRef.current;
    const v = voiceRef.current;
    [sea, music, v].forEach((el) => {
      if (el) el.muted = set.bisu;
    });
    if (sea) {
      if (!set.ombak || set.bisu) fade(sea, 0, 700);
      else fade(sea, voice ? OMBAK_MENGALAH : OMBAK_TENANG, 900);
    }
    if (music && started) {
      if (!set.lagu || set.bisu) fade(music, 0, 700);
      else fade(music, voice ? LAGU_MENGALAH : LAGU_UTAMA, 900);
    }
  }, [set.bisu, set.ombak, set.lagu, voice, started, fade]);

  const toggleMute = useCallback(() => {
    setSet((p) => ({ ...p, bisu: !p.bisu }));
  }, []);

  return (
    /*
     * Warna chrome ditulis ke sini sebagai custom property, bukan dipilih oleh
     * tiap tombol sendiri-sendiri. Nilainya diturunkan dari palet waktu — lihat
     * src/design/tema.ts, dan jalankan periksa-kontras.ts kalau paletnya
     * diubah.
     *
     * Ditulis sebagai style, bukan lewat useEffect: nilainya murni turunan dari
     * `set.waktu`, jadi HTML server dan HTML klien sama persis dan tidak ada
     * risiko hydration mismatch.
     */
    <section className="op" style={variabelTema(set.waktu) as React.CSSProperties}>
      <Langit waktu={set.waktu} />
      {quality && <OpeningScene quality={quality} waktu={set.waktu} jam={jam} />}

      {/* butiran halus di atas segalanya — supaya tidak terasa vektor datar */}
      <div className="op-grain" aria-hidden />

      <Settings buka={bukaSet} onBuka={setBukaSet} nilai={set} onUbah={ubahSet} />

      {/* Selalu ada, bukan cuma sesudah MULAI — ombaknya sudah berbunyi sejak
          halaman dibuka, jadi harus selalu ada cara mematikannya. */}
      {
        <button
          className={`ui-pil z-atas op-sound ui-masuk tunda-6${muted || !adaSuara ? "" : " on"}`}
          onClick={toggleMute}
          disabled={!adaSuara}
          aria-pressed={adaSuara ? !muted : undefined}
          aria-label={
            !adaSuara ? "No audio files on this server" : muted ? "Turn sound on" : "Turn sound off"
          }
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
            <path
              d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {muted || !adaSuara ? (
              <path d="M16 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <>
                <path d="M15.4 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M17.9 6.9a7.4 7.4 0 0 1 0 10.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            )}
          </svg>
          <span>{!adaSuara ? "no audio" : muted ? "muted" : "sound on"}</span>
        </button>
      }

      <div className="op-ui">
        <p className="ui-kicker ui-masuk tunda-1">Memories of</p>
        <h1 className="ui-nama op-nama ui-masuk tunda-2">Olen</h1>

        {!started ? (
          <>
            <button className="ui-pil ui-besar z-aksi op-aksi op-mulai" onClick={start}>
              <span className="op-wave" aria-hidden>
                <i /><i /><i /><i /><i />
              </span>
              The Memory of Voice
            </button>
            <p className="ui-catatan op-hint ui-masuk tunda-4">whenever you&rsquo;re ready</p>
          </>
        ) : (
          <>
            <button
              className={`ui-pil ui-besar z-aksi op-aksi ui-masuk tunda-3${voice ? " on" : ""}`}
              onClick={replayVoice}
            >
              <span className="op-wave" aria-hidden>
                <i /><i /><i /><i /><i />
              </span>
              {voice ? "listening" : "play it again"}
            </button>
            <p className="ui-catatan op-hint ui-masuk tunda-4">
              {voice
                ? "three years of your voice, folded into a minute"
                : "I kept every one of them, in the order they came"}
            </p>
          </>
        )}
      </div>

      {/* Pemantauannya ada di useEffect di atas, bukan di prop onError di
          sini — lihat catatan panjangnya. Ombak dipilih karena ia satu-satunya
          yang dimuat sejak halaman dibuka, jadi paling awal tahu apakah folder
          audionya terisi. */}
      <audio ref={seaRef} loop preload="auto">
        <source src={aset("/audio/beach.m4a")} type="audio/mp4" />
        <source src={aset("/audio/beach.opus")} type="audio/ogg; codecs=opus" />
      </audio>

      {/* Bundle of Joy — lagu yang diminta Yaya untuk layar pembuka. */}
      <audio ref={musicRef} loop preload="auto">
        <source src={aset("/audio/track-1.m4a")} type="audio/mp4" />
        <source src={aset("/audio/track-1.opus")} type="audio/ogg; codecs=opus" />
      </audio>

      <audio ref={voiceRef} preload="auto" onEnded={() => setVoice(false)} onPause={() => setVoice(false)}>
        <source src={aset("/audio/voice-of-olen.m4a")} type="audio/mp4" />
        <source src={aset("/audio/voice-of-olen.opus")} type="audio/ogg; codecs=opus" />
      </audio>

      {started && (
        <button
          className="ui-pil z-bawah op-next"
          /* Waktu ikut dibawa di dalam peristiwanya.
             Layar berikutnya perlu tahu warna laut di permukaan supaya
             turunannya berangkat dari air yang SEDANG terlihat, bukan dari
             warna tetap. Menitipkannya di sini jauh lebih murah daripada
             mengangkat seluruh state pengaturan keluar dari komponen ini. */
          onClick={() =>
            window.dispatchEvent(new CustomEvent("olen:next", { detail: { waktu: set.waktu } }))
          }
        >
          <span>keep going</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Opening from "./Opening";
import Turunan from "./Turunan";
import Selam from "./Selam";
import Jurnal from "./Jurnal";
import type { NoteRow } from "@/lib/db";
import { waktuSekarang, type Waktu } from "./waktu";

/**
 * ═══ PERJALANAN — yang memegang "kita sedang di mana" ═══
 *
 * `Opening.tsx` sudah memancarkan `CustomEvent("olen:next")` sejak tombol
 * "keep going" dibuat, dan sampai hari ini TIDAK ADA yang menangkapnya.
 * Tombolnya bisa ditekan dan tidak terjadi apa-apa. Berkas ini yang
 * menangkapnya.
 *
 *
 * ── kenapa lapisan terpisah, bukan state di dalam Opening ──
 *
 * Karena akan ada arah kedua. Rencananya bukan cuma turun ke laut tapi juga
 * naik ke langit berbintang tempat jurnal Olen. Kalau "sedang di layar mana"
 * disimpan di dalam Opening, layar pembuka jadi induk dari dua layar yang
 * sama besarnya dengan dirinya, dan yang berikutnya menyentuhnya harus
 * membaca seluruh Opening dulu untuk menambah satu tujuan.
 *
 *
 * ── kenapa layar pembuka TIDAK dilepas dari DOM ──
 *
 * Ia disembunyikan, bukan dibongkar. Melepasnya berarti kanvas WebGL-nya
 * dibuang dan seluruh pantai dibangun ulang setiap kali Olen kembali ke
 * permukaan: jeda satu dua detik, dan audionya mulai dari nol. Dengan
 * disembunyikan, "kembali ke permukaan" benar-benar terasa kembali ke tempat
 * yang sama, bukan memuat ulang tempat yang mirip.
 *
 * Ongkosnya nyata dan diterima sadar: satu kanvas 3D tetap hidup di belakang
 * layar. Karena itu `hidden` dipasang di elemennya — peramban berhenti
 * menggambar isi elemen yang tersembunyi, jadi yang tersisa cuma memori,
 * bukan pekerjaan tiap frame.
 */

type Layar = "pembuka" | "turun" | "naik";

/**
 * Empat perpindahan, dan tiap satu punya namanya sendiri.
 *
 * Sebelumnya "naik" dipakai untuk DUA hal berbeda — kembali dari laut dan
 * kembali dari langit — dan keduanya jatuh ke tirai air. Jadi turun dari
 * langit disambut air yang naik dari bawah, seolah kita menuju laut.
 *
 * Satu nama untuk dua tujuan adalah cara paling mudah untuk salah tanpa
 * ketahuan, karena kodenya tetap masuk akal dibaca sekilas.
 */
type Pindah = "ke-laut" | "dari-laut" | "ke-langit" | "dari-langit";

/** Tirai mana untuk perpindahan mana. Yang menyangkut langit pakai awan. */
const TIRAI: Record<Pindah, "air" | "awan"> = {
  "ke-laut": "air",
  "dari-laut": "air",
  "ke-langit": "awan",
  "dari-langit": "awan",
};

/** Layar tujuan tiap perpindahan. */
const TUJUAN: Record<Pindah, Layar> = {
  "ke-laut": "turun",
  "dari-laut": "pembuka",
  "ke-langit": "naik",
  "dari-langit": "pembuka",
};

export default function Perjalanan({ catatan }: { catatan: NoteRow[] }) {
  const [layar, setLayar] = useState<Layar>("pembuka");
  /* null = tidak sedang berpindah. Selama bukan null, tirainya terpasang di
     atas segalanya dan pergantian layarnya terjadi DI BALIKNYA. */
  const [selam, setSelam] = useState<Pindah | null>(null);
  /* Nilai awal tetap, jamnya dibaca sesudah terpasang — server tidak tahu jam
     Olen, dan membacanya saat render adalah hydration mismatch. Jebakan yang
     sudah tercatat di HANDOVER. */
  const [waktu, setWaktu] = useState<Waktu>("siang");

  useEffect(() => setWaktu(waktuSekarang()), []);

  useEffect(() => {
    const turun = (e: Event) => {
      const w = (e as CustomEvent<{ waktu?: Waktu }>).detail?.waktu;
      if (w) setWaktu(w);
      setSelam("ke-laut");
    };
    /* Arah kedua. Peristiwanya terpisah dari olen:next supaya tombol yang
       memancarkannya tidak perlu tahu apa pun soal layar tujuan. */
    const keLangit = (e: Event) => {
      const w = (e as CustomEvent<{ waktu?: Waktu }>).detail?.waktu;
      if (w) setWaktu(w);
      setSelam("ke-langit");
    };

    window.addEventListener("olen:next", turun);
    window.addEventListener("olen:up", keLangit);
    return () => {
      window.removeEventListener("olen:next", turun);
      window.removeEventListener("olen:up", keLangit);
    };
  }, []);

  /**
   * Dipanggil tirai air tepat di tengah jeda diamnya — waktu layar tertutup
   * penuh dan tidak ada apa pun yang bergerak. Di situlah layarnya ditukar,
   * supaya pergantiannya tidak pernah terlihat.
   *
   * Turunan memetakan gulir ke kedalaman, jadi ia harus berangkat dari
   * permukaan. Tanpa scrollTo, masuk kembali ke turunan akan mendarat di
   * kedalaman terakhir tanpa ada yang menyelaminya.
   */
  const tukar = (ke: Layar) => {
    setLayar(ke);
    window.scrollTo(0, 0);
  };

  const naik = () => setSelam("dari-laut");

  return (
    <>
      <div hidden={layar !== "pembuka"}>
        <Opening />
      </div>
      {layar === "turun" && <Turunan waktu={waktu} onNaik={naik} />}
      {layar === "naik" && (
        <Jurnal waktu={waktu} catatan={catatan} onTurun={() => setSelam("dari-langit")} />
      )}
      {selam && (
        <Selam
          waktu={waktu}
          jenis={TIRAI[selam]}
          onTutup={() => tukar(TUJUAN[selam])}
          onSelesai={() => setSelam(null)}
        />
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BASIS } from "@/lib/basis";
import "./masuk.css";

/**
 * ═══ GEMBOK — empat angka ═══
 *
 * Ini pintu depan, dan pintu depan menentukan perasaan orang sebelum melihat
 * apa pun. Jadi ia sengaja TIDAK terlihat seperti formulir login: tanpa kotak
 * isian, tanpa tombol "Masuk", tanpa kata "sandi". Empat titik yang terisi
 * satu per satu, seperti gembok buku harian.
 *
 *
 * ── HAL-HAL KECIL YANG MENENTUKAN ──
 *
 * **Terkirim sendiri di angka keempat.** Tidak ada tombol konfirmasi. Empat
 * angka sudah cukup jadi pernyataan "saya selesai"; menambah satu ketukan
 * lagi cuma birokrasi.
 *
 * **Salah = titiknya bergetar, bukan tulisan merah.** Peringatan merah
 * membuat orang merasa melakukan pelanggaran. Ini rumahnya sendiri; salah
 * pencet bukan kesalahan.
 *
 * **Papan angka sendiri, bukan keyboard HP.** Kalau memakai <input>, papan
 * ketik ponsel muncul dan menutupi separuh layar, dan jenisnya berbeda-beda
 * di tiap peranti. Angka di layar berlaku sama di semua tempat. Papan ketik
 * fisik tetap bisa dipakai — lihat pendengar di bawah.
 */

const PANJANG = 4;

export default function Gembok({ ke }: { ke: string }) {
  const [angka, setAngka] = useState("");
  const [goyang, setGoyang] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [tunggu, setTunggu] = useState(0);
  const [kirim, setKirim] = useState(false);
  const sedangKirim = useRef(false);

  /* Hitung mundur saat sedang dijeda. */
  useEffect(() => {
    if (tunggu <= 0) return;
    const t = setInterval(() => setTunggu((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [tunggu]);

  const coba = useCallback(
    async (pin: string) => {
      if (sedangKirim.current) return;
      sedangKirim.current = true;
      setKirim(true);
      try {
        const r = await fetch(`${BASIS}/api/kunci`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const d = (await r.json()) as { ok: boolean; pesan?: string; tungguDetik?: number };

        if (d.ok) {
          /* location.assign, bukan router.push: seluruh halaman harus dimuat
             ulang supaya permintaan berikutnya membawa kue tiket yang baru
             saja dipasang. */
          window.location.assign(ke);
          return;
        }

        setPesan(d.pesan ?? "Bukan itu angkanya.");
        setTunggu(d.tungguDetik ?? 0);
        setGoyang(true);
        setTimeout(() => setGoyang(false), 520);
        setTimeout(() => setAngka(""), 260);
      } catch {
        setPesan("Sambungannya putus. Coba lagi.");
        setAngka("");
      } finally {
        sedangKirim.current = false;
        setKirim(false);
      }
    },
    [ke],
  );

  const tekan = useCallback(
    (d: string) => {
      if (tunggu > 0 || sedangKirim.current) return;
      setPesan(null);
      setAngka((lama) => {
        if (lama.length >= PANJANG) return lama;
        const baru = lama + d;
        if (baru.length === PANJANG) void coba(baru);
        return baru;
      });
    },
    [coba, tunggu],
  );

  const hapus = useCallback(() => {
    if (tunggu > 0) return;
    setPesan(null);
    setAngka((l) => l.slice(0, -1));
  }, [tunggu]);

  /* Papan ketik fisik tetap bekerja — di laptop mengetik jauh lebih enak
     daripada mengarahkan tetikus ke sepuluh tombol. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tekan(e.key);
      else if (e.key === "Backspace") hapus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tekan, hapus]);

  const terkunci = tunggu > 0;

  return (
    <main className="gembok">
      <div className="gembok-isi">
        <h1 className="gembok-judul serif">Len</h1>
        <p className="gembok-sapa">Empat angka, seperti biasa.</p>

        <div
          className={`gembok-titik${goyang ? " goyang" : ""}`}
          role="status"
          aria-label={`${angka.length} dari ${PANJANG} angka terisi`}
        >
          {Array.from({ length: PANJANG }, (_, i) => (
            <span key={i} className={`titik${i < angka.length ? " isi" : ""}`} />
          ))}
        </div>

        <p className="gembok-pesan" aria-live="polite">
          {terkunci
            ? `Tunggu ${tunggu} detik dulu ya.`
            : pesan ?? " "}
        </p>

        <div className="gembok-papan">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              className="tombol-angka"
              onClick={() => tekan(d)}
              disabled={terkunci || kirim}
            >
              {d}
            </button>
          ))}
          <span />
          <button
            type="button"
            className="tombol-angka"
            onClick={() => tekan("0")}
            disabled={terkunci || kirim}
          >
            0
          </button>
          <button
            type="button"
            className="tombol-angka tombol-hapus"
            onClick={hapus}
            disabled={terkunci || kirim || angka.length === 0}
            aria-label="Hapus satu angka"
          >
            ←
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { URUT, NAMA, type Waktu } from "./waktu";
import { aset } from "@/lib/basis";
import { LAUT_TERBUKA } from "@/lib/pintu";

/**
 * Panel pengaturan di pojok kanan atas.
 *
 * RALAT 1 September 2026. Paragraf di bawah dulu berbunyi "isinya sengaja
 * sedikit, ini halaman untuk dibuka dan didengarkan, bukan aplikasi untuk
 * disetel". Itu benar waktu kapsul ini cuma satu layar. Sekarang ada tiga
 * tempat dan sebuah jurnal yang dipakai berulang, jadi panel ini juga jadi
 * satu-satunya jalan berpindah dan satu-satunya tempat mengganti PIN.
 *
 * Urutannya yang menjaga supaya tidak berantakan: TEMPAT paling atas (yang
 * mengubah ke mana), lalu suara dan cahaya (yang mengubah bagaimana), lalu
 * AKUN paling bawah (yang paling jarang dan paling tidak boleh tersentuh
 * tanpa sengaja).
 *
 * Yang tetap berlaku: cara mendiamkan, cara mengatur tiap lapis suara, dan
 * cara memilih waktu.
 *
 * Bahasanya Inggris, mengikuti aturan tulisan di AGENTS.md.
 */

export type Pengaturan = {
  bisu: boolean;
  ombak: boolean;
  lagu: boolean;
  waktu: Waktu;
  /** true = ikut jam di komputer Olen; false = dipilih sendiri */
  waktuOtomatis: boolean;
};

export default function Settings({
  buka,
  onBuka,
  nilai,
  onUbah,
  garisTiga = false,
  tempat = "pantai",
}: {
  buka: boolean;
  onBuka: (b: boolean) => void;
  nilai: Pengaturan;
  onUbah: (p: Partial<Pengaturan>) => void
  /** Dipakai layar jurnal: panelnya menempel ke KIRI, bukan ke kanan. */
  garisTiga?: boolean;
  /** Tempat yang sedang ditempati, supaya tombolnya bisa ditandai. */
  tempat?: "pantai" | "langit" | "laut";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [pinLama, setPinLama] = useState("");
  const [pinBaru, setPinBaru] = useState("");
  const [pinPesan, setPinPesan] = useState<string | null>(null);
  const [pinSibuk, setPinSibuk] = useState(false);

  const TEMPAT = [
    { id: "pantai", nama: "pantai", ket: "tempat awal" },
    { id: "langit", nama: "langit", ket: "sky notes" },
    { id: "laut", nama: "laut", ket: LAUT_TERBUKA ? "turun ke bawah" : "belum dibuka" },
  ] as const;

  async function gantiPin() {
    if (pinSibuk) return;
    /* Diperiksa di sini SEBELUM dikirim, supaya Olen tahu salahnya di mana
       tanpa menunggu perjalanan ke server. Servernya tetap memeriksa lagi;
       yang di sini kenyamanan, bukan pengaman. */
    if (!/^\d{4}$/.test(pinBaru)) {
      setPinPesan("PIN barunya harus 4 angka");
      return;
    }
    setPinSibuk(true);
    setPinPesan(null);
    try {
      const r = await fetch(aset("/api/kunci"), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lama: pinLama, baru: pinBaru }),
      });
      if (!r.ok) {
        /* Medannya `pesan`, bukan `error`. Versi pertama baris ini membaca
           `j.error`, yang selalu undefined, jadi SEMUA kegagalan tampil
           sebagai satu kalimat cadangan yang sama. Olen yang menunggu jeda
           setelah salah berkali-kali akan dibilang "PIN lamanya salah",
           padahal PIN-nya benar dan dia cuma harus menunggu. */
        const j = (await r.json().catch(() => ({}))) as { pesan?: string };
        throw new Error(j.pesan ?? "PIN lamanya bukan itu.");
      }
      setPinPesan("PIN sudah diganti");
      setPinLama("");
      setPinBaru("");
    } catch (e) {
      setPinPesan(e instanceof Error ? e.message : "belum bisa diganti");
    } finally {
      setPinSibuk(false);
    }
  }

  // tutup kalau diklik di luar atau ditekan Esc — panel yang tidak bisa
  // ditutup dengan gerakan wajar akan terasa seperti tersangkut
  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) onBuka(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onBuka(false);
    window.addEventListener("pointerdown", luar);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", luar);
      window.removeEventListener("keydown", esc);
    };
  }, [buka, onBuka]);

  return (
    <div className={`st${garisTiga ? " st-kiri" : ""}`} ref={panel}>
      <button
        className={`ui-bulat z-atas st-buka ui-masuk tunda-6${buka ? " on" : ""}`}
        onClick={() => onBuka(!buka)}
        aria-expanded={buka}
        aria-label="Settings"
      >
        {/* Tiga garis, bukan roda gigi.
            Roda gigi berarti "pengaturan sistem" — sesuatu yang teknis dan
            jarang disentuh. Yang ada di balik tombol ini bukan itu: ombak,
            lagu, waktu. Tiga garis lebih jujur menyebutnya "ada menu di
            sini", dan itu yang membuat orang membukanya. */}
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
          <path
            d={buka ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {buka && (
        <div className="ui-panel st-panel" role="dialog" aria-label="Settings">
          {/*
            TEMPAT paling atas, sebelum suara dan cahaya.

            Yaya: "di garis tiga itu selain settings, disitu buat milih
            kembali ke menu apa, misal pantai, langit, laut."

            Ditaruh paling atas karena ia satu-satunya isi panel ini yang
            memindahkan Olen ke tempat lain. Sisanya menyetel tempat yang
            sedang dia tempati. Yang mengubah ke mana selalu didahulukan dari
            yang mengubah bagaimana.
          */}
          <p className="ui-panel-judul">Tempat</p>
          <div className="ui-deret">
            {TEMPAT.map((x) => (
              <button
                key={x.id}
                className={`ui-pilih ui-lebar${tempat === x.id ? " on" : ""}`}
                /* Laut yang belum dibuka TIDAK disembunyikan. Menyembunyikannya
                   berarti Olen tidak pernah tahu ada tempat ketiga; dibiarkan
                   terlihat tapi mati, ia jadi janji. */
                disabled={x.id === "laut" && !LAUT_TERBUKA}
                onClick={() => {
                  onBuka(false);
                  window.dispatchEvent(new CustomEvent("olen:pergi", { detail: { ke: x.id } }));
                }}
              >
                {x.nama}
                <span className="st-ket">{x.ket}</span>
              </button>
            ))}
          </div>

          <p className="ui-panel-judul st-pisah">Sound</p>

          <label className="ui-baris">
            <span>Everything</span>
            <input
              type="checkbox"
              checked={!nilai.bisu}
              onChange={(e) => onUbah({ bisu: !e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <label className={`ui-baris${nilai.bisu ? " mati" : ""}`}>
            <span>Waves</span>
            <input
              type="checkbox"
              checked={nilai.ombak}
              disabled={nilai.bisu}
              onChange={(e) => onUbah({ ombak: e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <label className={`ui-baris${nilai.bisu ? " mati" : ""}`}>
            <span>Music</span>
            <input
              type="checkbox"
              checked={nilai.lagu}
              disabled={nilai.bisu}
              onChange={(e) => onUbah({ lagu: e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <p className="ui-panel-judul st-pisah">Light</p>

          <div className="ui-deret">
            {URUT.map((w) => (
              <button
                key={w}
                className={`ui-pilih${!nilai.waktuOtomatis && nilai.waktu === w ? " on" : ""}`}
                onClick={() => onUbah({ waktu: w, waktuOtomatis: false })}
              >
                {NAMA[w]}
              </button>
            ))}
            <button
              className={`ui-pilih ui-lebar${nilai.waktuOtomatis ? " on" : ""}`}
              onClick={() => onUbah({ waktuOtomatis: true })}
            >
              Follow the clock
            </button>
          </div>

          {/* AKUN paling bawah: paling jarang dipakai, dan paling tidak
              boleh tersentuh tanpa sengaja. */}
          <p className="ui-panel-judul st-pisah">Akun</p>
          <div className="st-pin">
            <input
              className="st-pin-isian"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={4}
              placeholder="PIN sekarang"
              value={pinLama}
              onChange={(e) => setPinLama(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className="st-pin-isian"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              placeholder="PIN baru"
              value={pinBaru}
              onChange={(e) => setPinBaru(e.target.value.replace(/\D/g, ""))}
            />
            <button
              className="ui-pilih"
              disabled={pinLama.length !== 4 || pinBaru.length !== 4 || pinSibuk}
              onClick={() => void gantiPin()}
            >
              {pinSibuk ? "…" : "ganti"}
            </button>
          </div>
          {pinPesan && <p className="ui-catatan st-catatan">{pinPesan}</p>}

          <p className="ui-catatan st-catatan">
            {nilai.waktuOtomatis
              ? `Right now it is ${NAMA[nilai.waktu].toLowerCase()} where you are.`
              : "Set by hand. Tap “Follow the clock” to let it drift again."}
          </p>
        </div>
      )}
    </div>
  );
}

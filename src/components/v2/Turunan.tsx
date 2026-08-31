"use client";

import { useEffect, useRef } from "react";
import { PALET, type Waktu } from "./waktu";
import {
  HUNI,
  cahayaDi,
  hadirDi,
  kedalamanDi,
  keruhDi,
  pijarDi,
  suhuDi,
  warnaAirDi,
} from "./kedalaman";
import { KarangMeja, LumbaLumba, Paus, Rumput, Terumbu, UburUbur } from "./laut/makhluk";
import { KENANGAN, jendelaDi } from "./laut/kenangan";
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
  /* Dasar dangkal dinilai kosong, dan penilaian itu benar: tiga karang di
     seluruh lebar layar meninggalkan bidang datar yang lebih luas daripada
     isinya. Sekarang dasarnya benar-benar ditutup — karang bercabang, karang
     meja, dan rumput laut, dengan tinggi dan kepucatan berbeda-beda supaya
     terbaca sebagai satu hamparan, bukan sebagai deretan benda. */
  terumbu: [
    { x: 3, bawah: -3, ukur: 0.95, jauh: 0.4 },
    { x: 17, bawah: -5, ukur: 0.62, jauh: 0.2 },
    { x: 31, bawah: -2, ukur: 1.15, jauh: 0.72 },
    { x: 49, bawah: -6, ukur: 0.55, jauh: 0.18 },
    { x: 63, bawah: -3, ukur: 1.3, jauh: 0.85 },
    { x: 79, bawah: -5, ukur: 0.7, jauh: 0.3 },
    { x: 93, bawah: -2, ukur: 1.05, jauh: 0.6 },
  ],
  meja: [
    { x: 11, bawah: -4, ukur: 0.85, jauh: 0.5 },
    { x: 42, bawah: -6, ukur: 0.6, jauh: 0.24 },
    { x: 72, bawah: -3, ukur: 1, jauh: 0.66 },
    { x: 88, bawah: -6, ukur: 0.65, jauh: 0.28 },
  ],
  rumput: [
    { x: 8, bawah: -2, ukur: 1, jauh: 0.55 },
    { x: 24, bawah: -4, ukur: 0.75, jauh: 0.32 },
    { x: 38, bawah: -1, ukur: 1.2, jauh: 0.78 },
    { x: 56, bawah: -3, ukur: 0.9, jauh: 0.46 },
    { x: 68, bawah: -5, ukur: 0.65, jauh: 0.26 },
    { x: 84, bawah: -2, ukur: 1.1, jauh: 0.7 },
    { x: 97, bawah: -4, ukur: 0.8, jauh: 0.38 },
  ],
  lumba: [
    { x: 12, atas: 26, ukur: 0.55, jauh: 0.3 },
    { x: 58, atas: 46, ukur: 0.9, jauh: 0.7 },
    { x: 82, atas: 18, ukur: 0.42, jauh: 0.22 },
  ],
  paus: [{ x: 30, atas: 38, ukur: 0.9, jauh: 0.55 }],
  ubur: [
    { x: 16, atas: 18, ukur: 0.5, jauh: 0.35 },
    { x: 48, atas: 52, ukur: 0.85, jauh: 0.75 },
    { x: 78, atas: 30, ukur: 0.62, jauh: 0.5 },
    { x: 34, atas: 70, ukur: 0.4, jauh: 0.25 },
    { x: 66, atas: 84, ukur: 0.55, jauh: 0.42 },
  ],
};

export default function Turunan({ waktu, onNaik }: { waktu: Waktu; onNaik: () => void }) {
  const akar = useRef<HTMLDivElement>(null);
  const bacaan = useRef<HTMLParagraphElement>(null);
  const suhuEl = useRef<HTMLSpanElement>(null);
  /* Satu rujukan per kenangan. Opasitasnya ditulis langsung ke elemennya di
     dalam gelung gulir — bukan lewat state, dan bukan lewat custom property
     baru per kenangan, karena jumlahnya akan tumbuh dan satu variabel CSS per
     kalimat akan membengkakkan gaya elemen akar tanpa guna. */
  const kenanganEl = useRef<(HTMLElement | null)[]>([]);

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
      /* BUKAN `maju * DASAR`. Gulir dipetakan ke perubahan, bukan ke meter —
         lihat catatan panjang di kedalamanDi(). Dengan pemetaan lurus,
         terumbunya habis di 9% gulir dan airnya gelap total di 15%, jadi 85%
         gerakan jari tidak mengubah apa pun. */
      const d = kedalamanDi(maju);

      const air = warnaAirDi(d, permukaan);

      /*
       * Warna air ikut ditulis ke <html>, dan ini khusus soal HP.
       *
       * Di iOS dan Android, menggulir melewati ujung membuat halaman
       * memantul dan yang terlihat di balik pantulan itu latar akar — yaitu
       * #6FC6EC, biru langit milik layar pembuka. Di tengah laut dalam yang
       * hampir hitam, kilatan biru langit di tepi layar adalah hal pertama
       * yang terlihat salah.
       *
       * Dengan warna akar mengikuti kedalaman, pantulannya justru memperkuat
       * kesannya: yang muncul di tepi adalah air yang sama.
       */
      document.documentElement.style.backgroundColor = air;

      const g = el.style;
      g.setProperty("--air", air);
      g.setProperty("--terang", String(cahayaDi(d) / cahayaAtas));
      g.setProperty("--keruh", String(keruhDi(d)));
      g.setProperty("--pijar", String(pijarDi(d)));
      for (const p of HUNI) g.setProperty(`--ada-${p.kunci}`, String(hadirDi(p, d)));

      /* Teks diperbarui lewat textContent, bukan lewat state. Alasannya sama
         dengan seluruh berkas ini: satu angka berubah, bukan satu layar. */
      if (bacaan.current) bacaan.current.textContent = `${Math.round(d)} m`;
      if (suhuEl.current) suhuEl.current.textContent = `${suhuDi(d).toFixed(1)}°`;

      /* Kenangan muncul saat kedalamannya didekati dan pergi setelah
         dilewati. Bentuk lengkungnya smoothstep, sama seperti kehadiran
         penghuni — datang dan perginya berlaju nol, jadi tidak ada yang
         terasa disisipkan. */
      for (let i = 0; i < KENANGAN.length; i++) {
        const el = kenanganEl.current[i];
        if (!el) continue;
        const k = KENANGAN[i];
        const j = jendelaDi(k.di);
        const jarak = Math.abs(d - k.di) / j;
        const a = jarak >= 1 ? 0 : 1 - jarak * jarak * (3 - 2 * jarak);
        el.style.opacity = String(a);
        /* Yang tidak terlihat juga tidak boleh bisa disorot papan tik atau
           dibacakan pembaca layar. Opasitas nol saja tidak cukup. */
        el.style.visibility = a < 0.01 ? "hidden" : "visible";
      }
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
      /* Dikembalikan saat layar ini dilepas, kalau tidak layar pembuka akan
         mewarisi warna laut dalam di latar akarnya. */
      document.documentElement.style.backgroundColor = "";
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
          {TEMPAT.rumput.map((t, i) => (
            <div key={`rp${i}`} className="mk mk-rumput" style={taruh(t)}>
              <Rumput />
            </div>
          ))}
          {TEMPAT.meja.map((t, i) => (
            <div key={`km${i}`} className="mk mk-meja" style={taruh(t)}>
              <KarangMeja />
            </div>
          ))}
          {TEMPAT.terumbu.map((t, i) => (
            <div key={`tk${i}`} className="mk mk-terumbu" style={taruh(t)}>
              <Terumbu />
            </div>
          ))}
          {TEMPAT.paus.map((t, i) => (
            <div key={`ps${i}`} className="mk mk-paus renang renang-lambat" style={taruh(t)}>
              <Paus />
            </div>
          ))}
          {TEMPAT.lumba.map((t, i) => (
            <div
              key={`ll${i}`}
              className={`mk mk-lumba renang${i % 2 ? " renang-balik" : ""}`}
              style={{ ...taruh(t), animationDelay: `${i * -19}s` }}
            >
              <LumbaLumba />
            </div>
          ))}
          {TEMPAT.ubur.map((t, i) => (
            <div
              key={`uu${i}`}
              className="mk mk-ubur denyut"
              style={{ ...taruh(t), animationDelay: `${i * -1.4}s` }}
            >
              <UburUbur />
            </div>
          ))}
        </div>

        {/*
          KENANGAN
          Sengaja DI LUAR .tr-huni yang ber-aria-hidden: ini teks sungguhan,
          harus bisa diblok, dicari dengan Ctrl+F, dan dibacakan pembaca
          layar. Itu justru alasan utama layar ini 2D dan bukan WebGL.
        */}
        <div className="tr-kenangan">
          {KENANGAN.map((k, i) => (
            <figure
              key={i}
              ref={(el) => {
                kenanganEl.current[i] = el;
              }}
              className={`kn kn-${k.sisi ?? (i % 2 ? "kanan" : "kiri")}`}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <blockquote className="kn-kutip">{k.kutipan}</blockquote>
              <figcaption className="kn-kaki">
                {k.tanggal && <span className="kn-tanggal">{k.tanggal}</span>}
                {k.catatan && <span className="kn-catatan">{k.catatan}</span>}
              </figcaption>
            </figure>
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

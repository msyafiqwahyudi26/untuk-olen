"use client";

import { useEffect, useRef, useState } from "react";
import { aset } from "@/lib/basis";
import { kontras, tumpuk } from "@/design/warna";
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
import { KENANGAN } from "./laut/kenangan";
import "./turunan.css";

/**
 * ═══ SISI TIAP KENANGAN DI LAYAR LEBAR ═══
 *
 * `true` berarti ke kanan, `false` ke kiri. Kenangan dari Yaya tidak memakai
 * ini sama sekali; ia selalu di tengah, dan nilainya di sini diabaikan.
 *
 * Dihitung SEKALI saat modul dimuat, bukan di dalam render. Isinya tidak
 * pernah berubah selama halaman hidup, jadi menghitungnya ulang tiap render
 * cuma pekerjaan yang dibuang.
 *
 * Penghitungnya (`n`) hanya naik untuk kutipan Olen. Kalau memakai indeks
 * mentah, satu kalimat Yaya yang disisipkan di tengah akan MEMBALIK seluruh
 * zigzag di bawahnya, dan penataan yang tadinya sudah pas berubah tanpa ada
 * yang menyentuhnya.
 */
const SISI_KANAN: readonly boolean[] = (() => {
  let n = 0;
  return KENANGAN.map((k) => (k.dari === "yaya" ? false : n++ % 2 === 1));
})();
const sisiOlen = (i: number) => SISI_KANAN[i];

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

/* TINGGI_VH sudah tidak ada. Panjang halaman ini dulu ditulis tangan 560vh,
   dan itu tebakan: ia harus ditebak ulang tiap kali satu paragraf ditambah.
   Sekarang panjangnya hasil dari isinya sendiri. */

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

/**
 * ═══ SIAPA YANG MENENTUKAN LETAK, DAN SIAPA YANG IKUT ═══
 *
 * Sampai tadi arahnya terbalik: `pecahanUntuk(di)` membalik kurva kedalaman
 * untuk MENARUH tiap kenangan, dan tinggi bloknya ditentukan sendiri oleh
 * panjang teksnya. Dua angka yang saling terkait diputuskan terpisah — persis
 * yang dilarang catatan di AGENTS.md — dan akibatnya kelihatan begitu isinya
 * berubah dari satu kalimat jadi empat paragraf: kenangan di 3, 8, 18, dan
 * 30 m semuanya jatuh di 15% gulir pertama dan saling menindih sampai tidak
 * ada satu pun yang terbaca.
 *
 * Sekarang dibalik. Kenangan mengalir seperti teks biasa, dengan jarak antar
 * blok yang dijamin CSS, jadi TIDAK MUNGKIN menumpuk berapa pun panjangnya.
 * Tinggi halaman jadi hasil dari isinya, bukan angka 560vh yang ditebak. Lalu
 * kedalaman dibaca dari letak yang sudah terukur: waktu blok ke-i ada di
 * tengah layar, meternya menunjuk PERSIS `KENANGAN[i].di`, dan di antara dua
 * blok ia bergerak lurus dari satu ke berikutnya.
 *
 * Yang didapat bukan cuma tidak menumpuk. Janji ceritanya jadi benar: tiap
 * kenangan betul-betul dibaca di kedalaman yang ditulis di sebelahnya.
 */
type Jangkar = { gulir: number; di: number };

/* Warna pita baca dan warna tulisan kenangan. Dituliskan sekali di sini,
   karena keduanya jadi masukan hitungan di bawah — bukan cuma nilai di CSS. */
const PITA = "#020B18";
const TINTA_KN = "#F2F9FF";

/**
 * ═══ SEBERAPA PEKAT PITA BACANYA — DIHITUNG, BUKAN DIPILIH ═══
 *
 * Sebelumnya pitanya rgba(2,11,24,0.66) tetap dari permukaan sampai dasar.
 * Angka itu ditebak, dan salah di dua arah sekaligus. Di 0 m airnya #8CE2F5
 * — hampir seterang kertas — dan tulisan putih di atasnya cuma sekitar 1.5:1,
 * jadi 0.66 masih kurang. Di 150 m ke bawah airnya sudah #040A22 dan tulisan
 * putih sudah 18:1 tanpa dibantu apa pun, jadi 0.66 cuma menempelkan pita
 * gelap tak berguna di depan laut yang justru ingin dilihat.
 *
 * Jadi dihitung: alfa PALING KECIL yang membuat tulisan mencapai 4.5:1 di
 * atas air pada kedalaman itu. Hasilnya 0.50 di permukaan dan sudah 0 di
 * sekitar 20 m — pitanya menghilang sendiri persis waktu tidak dibutuhkan
 * lagi, tanpa ada yang memutuskan kapan.
 *
 * Ditabelkan sekali, bukan dihitung tiap frame: hitungannya gelung mencari
 * alfa, dan menjalankannya 60 kali sedetik untuk angka yang cuma bergantung
 * pada kedalaman adalah pemborosan yang akan terasa di HP.
 */
function tabelPita(permukaan: string, dasar: number): number[] {
  const N = 64;
  const t: number[] = [];
  for (let i = 0; i <= N; i++) {
    const air = warnaAirDi((i / N) * dasar, permukaan);
    let a = 0;
    while (a < 0.86 && kontras(TINTA_KN, tumpuk(PITA, a, air)) < 4.5) a += 0.02;
    t.push(+a.toFixed(2));
  }
  return t;
}

/** Kedalaman di dasar. Diambil dari kurva yang sama, bukan ditulis ulang. */
const DASAR = kedalamanDi(1);

export default function Turunan({ waktu, onNaik }: { waktu: Waktu; onNaik: () => void }) {
  const akar = useRef<HTMLDivElement>(null);
  const bacaan = useRef<HTMLParagraphElement>(null);
  const suhuEl = useRef<HTMLSpanElement>(null);
  const relTitik = useRef<HTMLSpanElement>(null);
  const pita = useRef<HTMLDivElement>(null);
  const suaraEl = useRef<HTMLAudioElement>(null);
  /* Satu-satunya state di berkas ini, dan sengaja: ia berubah waktu Olen
     menekan tombol, bukan waktu ia menggulir. Render ulang di sini tidak
     pernah bersaing dengan gelung gulir. */
  const [berbunyi, setBerbunyi] = useState<string | null>(null);

  /* Letak tiap kenangan sesudah DIUKUR: `gulir` adalah posisi gulir waktu
     blok itu pas di tengah layar. Ditulis ke ref, bukan ke state — gelung
     gulir membacanya tiap frame dan tidak boleh memicu render. */
  const jangkar = useRef<Jangkar[]>([]);
  /* Tanda di rel kanan ikut hasil ukuran yang sama, jadi tanda dan blok tidak
     akan pernah menunjuk tempat yang berbeda. Ini state karena ia dirender —
     tapi hanya berubah waktu diukur ulang, bukan waktu menggulir. */
  const [tanda, setTanda] = useState<number[]>([]);

  const putar = (nama: string) => {
    const a = suaraEl.current;
    if (!a) return;
    if (berbunyi === nama) {
      a.pause();
      setBerbunyi(null);
      return;
    }
    a.src = aset(`/memori/vn/${nama}.m4a`);
    a.currentTime = 0;
    void a
      .play()
      .then(() => setBerbunyi(nama))
      /* Kalau .m4a tidak ada atau ditolak, coba .opus sekali. Dua berkas
         untuk tiap VN memang disiapkan begitu; lihat DEPLOY.md. */
      .catch(() => {
        a.src = aset(`/memori/vn/${nama}.opus`);
        void a.play().then(() => setBerbunyi(nama)).catch(() => setBerbunyi(null));
      });
  };
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
    /* Sekali per waktu-hari, karena warna permukaannya yang berbeda. */
    const pekat = tabelPita(permukaan, DASAR);
    let rafId = 0;
    let menunggu = false;

    /* ── MENGUKUR ──
       Dijalankan sesudah tata letak jadi, dan diulang tiap kali tata letak
       bisa berubah: lebar layar berubah, huruf webfont selesai dimuat (Outfit
       dan Fraunces datang belakangan, dan tinggi tiap blok ikut berubah waktu
       hurufnya ditukar), atau poster video selesai. Kalau tidak diukur ulang,
       meternya akan menunjuk kedalaman menurut tata letak yang sudah tidak
       ada lagi. */
    const ukur = () => {
      const mid = window.innerHeight / 2;
      const batas = document.documentElement.scrollHeight - window.innerHeight;
      const hasil: Jangkar[] = [];
      for (let i = 0; i < KENANGAN.length; i++) {
        const e = kenanganEl.current[i];
        if (!e) continue;
        const atas = e.getBoundingClientRect().top + window.scrollY;
        const g = Math.min(batas, Math.max(0, atas + e.offsetHeight / 2 - mid));
        hasil.push({ gulir: g, di: KENANGAN[i].di });
      }
      jangkar.current = hasil;
      setTanda(batas > 0 ? hasil.map((j) => j.gulir / batas) : hasil.map(() => 0));
    };

    /* Kedalaman sebagai fungsi posisi gulir, lurus antar jangkar.
       Sengaja BUKAN kedalamanDi(pecahan) lagi: yang menentukan sekarang letak
       kenangan yang sudah terukur, dan kurva lamanya cuma dipakai untuk tahu
       di mana dasarnya. Sifat yang dulu dijaga kurva itu — gulir dipetakan ke
       perubahan, bukan ke meter — tetap terjaga, karena jarak antar kenangan
       di halaman memang tidak sebanding dengan selisih meternya. */
    const kedalamanGulir = (y: number) => {
      const j = jangkar.current;
      if (j.length === 0) return 0;
      const awal = j[0];
      if (y <= awal.gulir) return awal.gulir > 0 ? (y / awal.gulir) * awal.di : 0;
      for (let i = 0; i < j.length - 1; i++) {
        const a = j[i];
        const b = j[i + 1];
        if (y <= b.gulir) {
          const lebar = b.gulir - a.gulir;
          const t = lebar > 0 ? (y - a.gulir) / lebar : 0;
          return a.di + t * (b.di - a.di);
        }
      }
      const akhir = j[j.length - 1];
      const sisa = document.documentElement.scrollHeight - window.innerHeight - akhir.gulir;
      const t = sisa > 0 ? Math.min(1, (y - akhir.gulir) / sisa) : 1;
      return akhir.di + t * (DASAR - akhir.di);
    };

    const gambar = () => {
      menunggu = false;
      const y = window.scrollY;
      const bisaGulir = document.documentElement.scrollHeight - window.innerHeight;
      const maju = bisaGulir > 0 ? Math.min(1, Math.max(0, y / bisaGulir)) : 0;
      const d = kedalamanGulir(y);

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

      /* ── KENANGAN IKUT TERGULIR, TIDAK LAGI MUNCUL DI TEMPAT ──
       *
       * Sampai kemarin tiap kenangan cuma satu atau dua kalimat, jadi model
       * "muncul di tengah layar lalu memudar" bekerja. Sekarang isinya
       * pembuka, kutipan, dan tiga sampai empat paragraf. Teks sepanjang itu
       * TIDAK BISA dibaca kalau ia memudar mengikuti jari: baru sampai
       * paragraf kedua, yang pertama sudah hilang.
       *
       * Jadi kenangan sekarang elemen biasa yang mengalir bersama halaman.
       * Yang tetap diam air, makhluk, dan bacaan kedalamannya. Gulir tetap
       * jadi sumbu kedalaman seperti sebelumnya; yang berubah cuma siapa yang
       * ikut bergerak.
       *
       * Yang tersisa dihitung di sini cuma redupnya di tepi layar, dan itu
       * dihitung dari POSISI yang sudah diketahui (pecahan × tinggi dokumen),
       * bukan dari getBoundingClientRect. Dua puluh pembacaan tata letak tiap
       * frame sepanjang gulir adalah cara paling gampang membuat halaman ini
       * tersendat di HP. */
      const tinggiLayar = window.innerHeight;
      let palingDekat = -1;
      let jarakTerdekat = Infinity;

      for (let i = 0; i < KENANGAN.length; i++) {
        const e = kenanganEl.current[i];
        const j = jangkar.current[i];
        if (!e || !j) continue;
        /* `j.gulir` SUDAH posisi gulir waktu blok ini di tengah layar, jadi
           jaraknya cukup selisih dengan posisi gulir sekarang. Tidak ada
           getBoundingClientRect di sini: dua puluh pembacaan tata letak tiap
           frame adalah cara paling gampang membuat halaman ini tersendat di
           HP Olen. */
        const jarak = Math.abs(y - j.gulir);
        if (jarak < jarakTerdekat) {
          jarakTerdekat = jarak;
          palingDekat = i;
        }
        /* Ruang aman ikut TINGGI BLOKNYA, bukan angka tetap. Blok yang lebih
           tinggi dari layar akan mulai meredup di paragraf terakhirnya kalau
           ambangnya disamakan — dan yang sedang dibaca tidak boleh meredup. */
        const bebas = Math.max(tinggiLayar * 0.5, e.offsetHeight * 0.5 + tinggiLayar * 0.2);
        const p = Math.max(0, (jarak - bebas) / (tinggiLayar * 0.55));
        const nilai = p >= 1 ? 0 : 1 - p * p * (3 - 2 * p);
        e.style.opacity = String(nilai);
        e.style.visibility = nilai < 0.01 ? "hidden" : "visible";
      }

      /* Pita baca punya DUA angka, dan keduanya perlu.
         `opacity` menjawab "ada yang sedang dibaca atau tidak" — tanpa itu ia
         jadi bayangan mendatar yang tinggal di layar tanpa sebab.
         `--pita` menjawab "seberapa pekat supaya terbaca di kedalaman ini" —
         dan itu dibaca dari tabel, bukan dipatok. */
      if (pita.current) {
        const e = kenanganEl.current[palingDekat];
        pita.current.style.opacity = e ? e.style.opacity : "0";
        const x = Math.min(pekat.length - 1, Math.max(0, (d / DASAR) * (pekat.length - 1)));
        const i0 = Math.floor(x);
        const i1 = Math.min(pekat.length - 1, i0 + 1);
        const a = pekat[i0] + (x - i0) * (pekat[i1] - pekat[i0]);
        pita.current.style.setProperty("--pita", a.toFixed(3));
      }

      /* Titik pada rel kedalaman. Memakai `maju`, bukan kedalaman — supaya
         ia bergerak rata mengikuti jari, bukan melambat sendiri di bawah. */
      if (relTitik.current) relTitik.current.style.top = `${maju * 100}%`;
    };

    const onGulir = () => {
      if (menunggu) return;
      menunggu = true;
      rafId = requestAnimationFrame(gambar);
    };

    const ukurLaluGambar = () => {
      ukur();
      gambar();
    };

    ukurLaluGambar();
    /* Huruf webfont-nya datang sesudah render pertama dan mengubah tinggi
       tiap blok. Tanpa ukur ulang di sini, semua jangkarnya meleset seukuran
       selisih Outfit dengan huruf cadangan — kecil per blok, menumpuk jadi
       ratusan piksel di kenangan terakhir. */
    if (document.fonts?.status !== "loaded") void document.fonts?.ready.then(ukurLaluGambar);
    /* Dan sekali lagi kalau apa pun di dalamnya berubah ukuran (poster video
       selesai dimuat, teks membungkus ulang). */
    const pengamat = new ResizeObserver(ukurLaluGambar);
    for (const e of kenanganEl.current) if (e) pengamat.observe(e);

    window.addEventListener("scroll", onGulir, { passive: true });
    window.addEventListener("resize", ukurLaluGambar);
    return () => {
      pengamat.disconnect();
      window.removeEventListener("scroll", onGulir);
      window.removeEventListener("resize", ukurLaluGambar);
      cancelAnimationFrame(rafId);
      /* Dikembalikan saat layar ini dilepas, kalau tidak layar pembuka akan
         mewarisi warna laut dalam di latar akarnya. */
      document.documentElement.style.backgroundColor = "";
    };
  }, [waktu]);

  return (
    <div ref={akar} className="tr">
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

        {/* Pita baca — selebar layar, tanpa tepi. Lihat catatan di CSS. */}
        <div ref={pita} className="tr-pita" aria-hidden />


        {/*
          REL KEDALAMAN
          Bukan hiasan. Tanpa ini, turunan sepanjang ini tidak punya ujung yang
          terlihat: Olen tidak tahu ia baru seperempat jalan atau hampir sampai,
          dan tidak tahu masih ada yang menunggu di bawah. Tanda-tanda kecilnya
          adalah letak tiap kenangan — jadi yang terlihat bukan cuma "masih
          jauh", tapi "masih ada beberapa lagi".
        */}
        <div className="tr-rel" aria-hidden>
          <span className="tr-rel-garis" />
          {tanda.map((p, i) => (
            <span key={i} className="tr-rel-tanda" style={{ top: `${p * 100}%` }} />
          ))}
          <span ref={relTitik} className="tr-rel-titik" style={{ top: "0%" }} />
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

        {/* Satu elemen audio untuk semua VN; sumbernya diganti saat ditekan.
            Enam elemen audio yang menunggu tanpa pernah dipakai cuma memuat
            metadata dan menahan memori. */}
        <audio ref={suaraEl} onEnded={() => setBerbunyi(null)} preload="none" />

        <button type="button" className="tr-naik" onClick={onNaik}>
          kembali ke permukaan
        </button>
      </div>

        <div className="tr-kenangan">
          {/*
            KENANGAN
            Lapisan ini SENGAJA di luar `.tr-tetap`. Yang di dalam sana diam di
            layar; yang di sini mengalir bersama halaman, karena isinya sekarang
            paragraf yang harus bisa dibaca sampai habis.

            Juga di luar `aria-hidden`: ini teks sungguhan, harus bisa diblok,
            dicari dengan Ctrl+F, dan dibacakan pembaca layar. Itu alasan utama
            layar ini 2D dan bukan WebGL.
          */}
          {/* Peta indeks -> sisi, dihitung SEKALI di luar render tiap baris.
              Menghitungnya di dalam `map` berarti menghitung ulang seluruh
              larik untuk tiap kenangan. */}
          {KENANGAN.map((k, i) => (
            <figure
              key={i}
              ref={(el) => {
                kenanganEl.current[i] = el;
              }}
              /*
                SISI DI LAYAR LEBAR — dan kenapa bukan acak.

                Yaya: "penataannya di laptop tuh lurus banget sih dan nggak
                ada variasi."

                Variasinya diturunkan dari isi, bukan dari `Math.random()`
                (yang akan bikin hydration mismatch) maupun dari nomor urut
                mentah:

                  dari === "yaya"  ke tengah. Ini momen Kakak yang menahan
                                   halaman sebentar, jadi ia berdiri di poros
                                   dan blok di sekitarnya bergoyang terhadap
                                   dia.
                  selain itu       berganti kiri dan kanan, dihitung dari
                                   urutan SESAMA kutipan Olen saja.

                Yang terakhir itu penting. Kalau dihitung dari `i` mentah,
                satu kalimat Yaya yang disisipkan di tengah akan membalik
                seluruh zigzag di bawahnya. Dengan penghitung sendiri, blok
                Yaya cuma numpang lewat dan tidak mengacaukan iramanya.

                Di HP semua ini diabaikan: lihat blok 900px di turunan.css.
              */
              className={`kn${k.dari === "yaya" ? " kn-yaya" : ""}${
                k.foto?.length ? " kn-berfoto" : ""
              } kn-sisi-${k.dari === "yaya" ? "tengah" : sisiOlen(i) ? "kanan" : "kiri"}`}
              /* Tanpa `top`. Letaknya ditentukan alir dokumen dan jarak antar
                 blok di CSS; yang membaca letak itu justru meter kedalamannya,
                 bukan sebaliknya. */
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {/*
                VIDEO NOTE — bulat, seperti aslinya di WhatsApp.

                `preload="none"`: tidak ada satu bita pun yang diunduh sampai
                ditekan. Yang terlihat sebelum itu cuma bingkai pertamanya,
                sebuah JPEG 5 KB. Dua puluh kenangan yang semuanya memuat
                videonya di depan akan membuat halaman ini berat persis di
                tempat Yaya minta ia ringan.

                `playsInline` wajib: tanpa itu Safari di iPhone merebut
                videonya ke pemutar layar penuh, dan Olen keluar dari laut.

                TANPA `controls`. Sempat dipakai, dengan alasan kontrol bawaan
                lebih tahu cara bersikap di HP — dan hasilnya palang persegi
                melintang di dalam lingkaran, terpotong aneh oleh lengkungnya.
                Kotak di dalam bulat itu justru "frame aneh" yang sedang
                dibuang dari halaman ini. Video note cuma beberapa detik dan
                tidak perlu digeser-geser; satu ketukan sudah cukup.
              */}
              {k.video && (
                <button
                  type="button"
                  className="kn-video"
                  aria-label="Putar video dari Olen"
                  onClick={(e) => {
                    const v = e.currentTarget.querySelector("video");
                    if (!v) return;
                    if (v.paused) void v.play();
                    else v.pause();
                  }}
                >
                  {/*
                    Kelas `main` dipasang dari peristiwa videonya sendiri,
                    bukan dari klik. Klik cuma MEMINTA; yang tahu benar-benar
                    jalan atau tidak cuma elemen videonya — dan permintaan
                    putar bisa gagal atau tertunda.

                    Sempat ditulis sebagai `:has(video:not([paused]))` di CSS.
                    Itu tidak akan pernah cocok: `paused` properti JavaScript,
                    bukan atribut HTML, jadi tidak ada pemilih CSS untuknya.
                    Segitiganya akan diam selamanya tanpa satu pun galat.
                  */}
                  <video
                    src={aset(`/memori/video/${k.video}.mp4`)}
                    poster={aset(`/memori/video/${k.video}.jpg`)}
                    preload="none"
                    playsInline
                    onPlay={(e) => e.currentTarget.parentElement?.classList.add("main")}
                    onPause={(e) => e.currentTarget.parentElement?.classList.remove("main")}
                    onEnded={(e) => e.currentTarget.parentElement?.classList.remove("main")}
                  />
                  <span className="kn-video-main" aria-hidden />
                </button>
              )}
              {/*
                FOTO.

                `loading="lazy"` + `decoding="async"`: dua puluh kenangan yang
                semuanya memuat gambarnya di depan membuat halaman ini berat
                persis di tempat yang diminta ringan. Foto di bawah 400 m
                tidak akan pernah dilihat kalau Olen berhenti di tengah.

                `width`/`height` WAJIB ada walau ukurannya diatur CSS. Tanpa
                keduanya peramban tidak tahu berapa tinggi yang harus
                disisakan, jadi begitu gambarnya datang, seluruh teks di
                bawahnya melompat. Di halaman yang meter kedalamannya dihitung
                dari posisi gulir, lompatan itu bukan cuma jelek: ia menggeser
                angka yang sedang dibaca. Angkanya perkiraan 3:4 dan itu tidak
                apa-apa, yang penting nisbahnya dipesan lebih dulu.
              */}
              {k.foto?.length ? (
                <div className={`kn-foto kn-foto-${Math.min(k.foto.length, 3)}`}>
                  {k.foto.map((f, n) => (
                    <figure key={n} className="kn-foto-satu">
                      <img
                        src={aset(`/memori/${f.berkas}`)}
                        alt={f.alt}
                        width={900}
                        height={1200}
                        loading="lazy"
                        decoding="async"
                      />
                      {f.ket && <figcaption>{f.ket}</figcaption>}
                    </figure>
                  ))}
                </div>
              ) : null}
              {k.pembuka && <p className="kn-pembuka">{k.pembuka}</p>}
              {/* Tanda petik ditulis di sini, bukan di dalam datanya: yang
                  disimpan harus kata Olen apa adanya, supaya bisa dicocokkan
                  ke ekspornya kapan saja tanpa ada tanda tambahan. */}
              <blockquote className="kn-kutip">
                {k.dari === "yaya" ? k.kutipan : `\u201C${k.kutipan}\u201D`}
              </blockquote>
              {k.cerita?.map((baris, n) => (
                <p key={n} className="kn-cerita">
                  {baris}
                </p>
              ))}
              <figcaption className="kn-kaki">
                {/* `catatan` sudah tidak ada. Suara Kakak sekarang hidup di
                    `pembuka` (sebelum kutipan) dan `cerita` (sesudahnya), jadi
                    kakinya tinggal tanggal dan tombol suara. */}
                {k.tanggal && <span className="kn-tanggal">{k.tanggal}</span>}
                {k.suara && (
                  <button
                    type="button"
                    className={`kn-dengar${berbunyi === k.suara ? " on" : ""}`}
                    onClick={() => putar(k.suara!)}
                  >
                    <span className="kn-gelombang" aria-hidden>
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    {berbunyi === k.suara ? "sedang terdengar" : "dengar suaranya"}
                  </button>
                )}
              </figcaption>
            </figure>
          ))}
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

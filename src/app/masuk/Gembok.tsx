"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Langit from "@/components/v2/Langit";
import { waktuSekarang, type Waktu } from "@/components/v2/waktu";
import { variabelTema } from "@/design/tema";
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
 * ── KENAPA LANGITNYA SAMA DENGAN DI DALAM ──
 *
 * Sebelumnya pintu ini punya gradien gelapnya sendiri, dipatok tetap. Itu
 * membuatnya terasa seperti halaman lain yang kebetulan menempel di depan.
 * Sekarang ia memakai `Langit` yang sama persis dengan layar pembuka — pagi,
 * siang, sore, malam, mengikuti jam Olen — sehingga menekan angka terakhir
 * bukan berpindah halaman melainkan melangkah masuk ke ruangan yang langitnya
 * sudah kelihatan dari luar.
 *
 * Ongkosnya nol: `Langit` murni gradien CSS dua lapis, bukan three.js. Pintu
 * adalah tempat paling salah untuk memuat mesin 3D — ia dibuka di jaringan
 * paling lambat dan di HP paling lemah, sebelum orang tahu apakah menunggunya
 * sepadan.
 *
 *
 * ── WARNA TOMBOL TIDAK DIPATOK ──
 *
 * `variabelTema(waktu)` menurunkan warna kaca dan tepinya dari langit di
 * belakangnya. Ini sistem yang sama yang dipakai seluruh chrome v2 dan yang
 * lolos 16 dari 16 pemeriksaan kontras. Kalau warnanya dipatok putih, tombol
 * di langit pagi — yang bagian bawahnya nyaris putih — akan tinggal 1,3 : 1.
 *
 *
 * ── HAL-HAL KECIL YANG MENENTUKAN ──
 *
 * **Terkirim sendiri di angka keempat.** Empat angka sudah jadi pernyataan
 * "saya selesai"; tombol konfirmasi cuma birokrasi.
 *
 * **Salah = bergetar, bukan tulisan merah.** Merah membuat orang merasa
 * melanggar sesuatu. Ini rumahnya sendiri.
 *
 * **Benar = terang dulu, baru pindah.** Tanpa jeda itu, angka keempat terasa
 * seperti halaman yang tiba-tiba hilang. Dengan jeda 620 ms, ia terasa
 * seperti pintu yang membuka.
 *
 * **Papan angka sendiri, bukan <input>.** Papan ketik ponsel akan menutupi
 * separuh layar dan bentuknya berbeda di tiap peranti. Papan ketik fisik
 * tetap bekerja lewat pendengar keydown.
 */

const PANJANG = 4;

const SAPAAN: Record<Waktu, string> = {
  pagi: "Selamat pagi.",
  siang: "Selamat siang.",
  sore: "Selamat sore.",
  malam: "Sudah malam.",
};

/* Getaran halus. Tidak semua peranti punya, dan iOS mengabaikannya — jadi
 * ini tambahan, bukan satu-satunya umpan balik. */
function getar(pola: number | number[]) {
  try {
    navigator.vibrate?.(pola);
  } catch {
    /* sebagian peramban melempar kalau dipanggil tanpa gerakan pengguna */
  }
}

export default function Gembok({ ke }: { ke: string }) {
  /* Nilai awal TETAP, bukan waktuSekarang().
   * Server tidak tahu jam Olen; membacanya saat render membuat HTML server
   * dan DOM klien berbeda, dan React melaporkannya sebagai hydration
   * mismatch tiap kali halaman dibuka. Jamnya dibaca sesudah terpasang, lalu
   * `Langit` menyilangkannya halus selama 1,6 detik — jadi pintunya seperti
   * ikut bangun ke waktu yang benar. */
  const [waktu, setWaktu] = useState<Waktu>("malam");
  /* Benar hanya setelah jam sungguhan terbaca. Dipakai untuk menahan bintang:
   * langitnya boleh menyilang halus dari malam ke waktu yang benar, tapi
   * bintang tidak bisa "menyilang" — ia muncul lalu hilang dalam sekejap,
   * dan itu terbaca sebagai kedipan cacat, bukan sebagai pergantian. */
  const [siap, setSiap] = useState(false);
  const [angka, setAngka] = useState("");
  const [goyang, setGoyang] = useState(false);
  const [terbuka, setTerbuka] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [tunggu, setTunggu] = useState(0);
  const [sibuk, setSibuk] = useState(false);
  const kirimBerjalan = useRef(false);

  useEffect(() => {
    setWaktu(waktuSekarang());
    setSiap(true);
    /* Kalau halaman dibiarkan terbuka melewati pergantian waktu, langitnya
     * ikut berganti. Sekali semenit sudah lebih dari cukup. */
    const t = setInterval(() => setWaktu(waktuSekarang()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (tunggu <= 0) return;
    const t = setInterval(() => setTunggu((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [tunggu]);

  const coba = useCallback(
    async (pin: string) => {
      if (kirimBerjalan.current) return;
      kirimBerjalan.current = true;
      setSibuk(true);
      try {
        const r = await fetch(`${BASIS}/api/kunci`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const d = (await r.json()) as { ok: boolean; pesan?: string; tungguDetik?: number };

        if (d.ok) {
          getar(18);
          setTerbuka(true);
          /* location.assign, bukan router.push: seluruh halaman harus dimuat
             ulang supaya permintaan berikutnya membawa kue tiket yang baru
             saja dipasang. Ditunda supaya cahayanya sempat terlihat. */
          setTimeout(() => window.location.assign(ke), 620);
          return;
        }

        getar([14, 70, 14]);
        setPesan(d.pesan ?? "Bukan itu angkanya.");
        setTunggu(d.tungguDetik ?? 0);
        setGoyang(true);
        setTimeout(() => setGoyang(false), 520);
        setTimeout(() => setAngka(""), 300);
      } catch {
        setPesan("Sambungannya putus. Coba lagi.");
        setAngka("");
      } finally {
        kirimBerjalan.current = false;
        setSibuk(false);
      }
    },
    [ke],
  );

  const tekan = useCallback(
    (d: string) => {
      if (tunggu > 0 || kirimBerjalan.current || terbuka) return;
      getar(8);
      setPesan(null);
      setAngka((lama) => {
        if (lama.length >= PANJANG) return lama;
        const baru = lama + d;
        if (baru.length === PANJANG) void coba(baru);
        return baru;
      });
    },
    [coba, tunggu, terbuka],
  );

  const hapus = useCallback(() => {
    if (tunggu > 0 || terbuka) return;
    getar(8);
    setPesan(null);
    setAngka((l) => l.slice(0, -1));
  }, [tunggu, terbuka]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) tekan(e.key);
      else if (e.key === "Backspace") hapus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tekan, hapus]);

  const beku = tunggu > 0 || sibuk || terbuka;

  return (
    <section
      className={`pintu${terbuka ? " terbuka" : ""}`}
      style={variabelTema(waktu) as React.CSSProperties}
    >
      <Langit waktu={waktu} />

      {/* Bintang hanya masuk akal saat malam. Murni CSS, tidak dihitung ulang
          tiap render — posisinya tetap, jadi tidak ada ketidakcocokan hidrasi. */}
      {siap && waktu === "malam" && (
        <div className="pintu-bintang" aria-hidden>
          {BINTANG.map((b, i) => (
            <span
              key={i}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.r,
                height: b.r,
                animationDelay: `${b.d}s`,
                animationDuration: `${b.t}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Cahaya yang mekar saat PIN benar. */}
      <div className="pintu-mekar" aria-hidden />

      <div className="pintu-isi">
        <h1 className="pintu-nama">Len</h1>
        {/* key={waktu} sengaja: React memasang ulang elemennya saat waktunya
            berganti, sehingga animasi `naik` terputar lagi dan sapaannya
            memudar masuk alih-alih melompat berganti kata. */}
        <p key={waktu} className="pintu-sapa">
          {SAPAAN[waktu]}
        </p>

        <div
          className={`pintu-titik${goyang ? " goyang" : ""}`}
          role="status"
          aria-label={`${angka.length} dari ${PANJANG} angka terisi`}
        >
          {Array.from({ length: PANJANG }, (_, i) => (
            <span key={i} className={`titik${i < angka.length ? " isi" : ""}`} />
          ))}
        </div>

        <p className="pintu-pesan" aria-live="polite">
          {tunggu > 0 ? `Tunggu ${tunggu} detik dulu ya.` : (pesan ?? " ")}
        </p>

        <div className="pintu-papan">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <Tombol key={d} label={d} onTekan={() => tekan(d)} mati={beku} />
          ))}
          <span aria-hidden />
          <Tombol label="0" onTekan={() => tekan("0")} mati={beku} />
          <Tombol
            label="←"
            onTekan={hapus}
            mati={beku || angka.length === 0}
            samar
            aria="Hapus satu angka"
          />
        </div>
      </div>
    </section>
  );
}

/* Riak di titik sentuh. Umpan balik sentuhan yang paling murah dan paling
   terasa: tanpanya, tombol kaca di layar besar terasa mati. */
function Tombol({
  label,
  onTekan,
  mati,
  samar,
  aria,
}: {
  label: string;
  onTekan: () => void;
  mati?: boolean;
  samar?: boolean;
  aria?: string;
}) {
  const [riak, setRiak] = useState<{ id: number; x: number; y: number }[]>([]);

  return (
    <button
      type="button"
      aria-label={aria ?? label}
      disabled={mati}
      className={`tombol${samar ? " samar" : ""}`}
      onPointerDown={(e) => {
        const k = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRiak((r) => [...r, { id, x: e.clientX - k.left, y: e.clientY - k.top }]);
        setTimeout(() => setRiak((r) => r.filter((v) => v.id !== id)), 520);
      }}
      onClick={onTekan}
    >
      <span className="tombol-teks">{label}</span>
      {riak.map((r) => (
        <span key={r.id} className="riak" style={{ left: r.x, top: r.y }} />
      ))}
    </button>
  );
}

/* Sebaran tetap, ditulis tangan. Bukan Math.random(): nilai acak yang dihitung
   saat render berbeda antara server dan peramban, dan React melaporkannya
   sebagai hydration mismatch. */
const BINTANG = [
  { x: 8, y: 12, r: 2, d: 0.0, t: 3.4 },
  { x: 17, y: 26, r: 1.5, d: 1.1, t: 4.2 },
  { x: 26, y: 7, r: 2.5, d: 0.6, t: 3.0 },
  { x: 34, y: 19, r: 1.5, d: 2.0, t: 4.8 },
  { x: 43, y: 9, r: 2, d: 1.4, t: 3.6 },
  { x: 52, y: 23, r: 1.5, d: 0.3, t: 4.4 },
  { x: 61, y: 6, r: 2.5, d: 1.8, t: 3.2 },
  { x: 69, y: 17, r: 1.5, d: 0.9, t: 5.0 },
  { x: 77, y: 28, r: 2, d: 2.4, t: 3.8 },
  { x: 85, y: 11, r: 1.5, d: 0.5, t: 4.6 },
  { x: 92, y: 21, r: 2, d: 1.6, t: 3.4 },
  { x: 13, y: 34, r: 1.5, d: 2.2, t: 4.0 },
  { x: 47, y: 33, r: 1.5, d: 1.2, t: 4.9 },
  { x: 81, y: 36, r: 1.5, d: 0.8, t: 3.7 },
];

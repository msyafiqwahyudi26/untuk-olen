"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ASSETS } from "@/components/v2/assets";

/**
 * Panggung pratinjau.
 *
 * ── SUDAH DICOBA DAN GAGAL: satu <Canvas> per aset ──
 * Tiga belas kartu, tiga belas kanvas, tiga belas konteks WebGL. Chrome cuma
 * mengizinkan sekitar enam belas konteks hidup sekaligus di satu tab; begitu
 * halaman di-reload dan konteks lama belum sempat dilepas, sebagiannya mati
 * dan kartunya jadi kotak kosong tanpa satu pun pesan error.
 *
 * Sekarang: SATU kanvas, satu aset ditampilkan besar, sisanya daftar di kiri.
 * Ternyata juga lebih berguna — menilai bentuk butuh benda yang besar, bukan
 * tiga belas benda kecil.
 */

const SUDUT = { samping: 0.1, miring: 0.42, atas: 0.95 } as const;
type Pandang = keyof typeof SUDUT;

function Panggung({ tinggi, pandang }: { tinggi: number; pandang: Pandang }) {
  const { camera } = useThree();
  useEffect(() => {
    // Benda pipih WAJIB dilihat dari atas. Bintang laut yang dilihat hampir
    // mendatar cuma terbaca sebagai kubah oranye — bentuk lengannya, yang
    // justru satu-satunya hal yang perlu dinilai, tidak kelihatan.
    // Bidiknya di TENGAH tinggi benda, dan jaraknya dihitung dari setengah
    // tinggi dibagi tan(setengah fov), plus kelonggaran 35%. Versi pertama
    // membidik 0.3 × tinggi dengan jarak seadanya — kepala flamingo keluar
    // dari bingkai, dan justru kepala itu yang sedang diperiksa.
    const naik = SUDUT[pandang];
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    const jarak = (tinggi * 0.5) / Math.tan(fov / 2) * 1.35 + 1;
    const pusat = tinggi * 0.5;
    camera.position.set(
      jarak * Math.cos(naik) * 0.82,
      pusat + jarak * Math.sin(naik),
      jarak * Math.cos(naik) * 0.57
    );
    camera.lookAt(0, pusat, 0);
  }, [camera, tinggi, pandang]);
  return null;
}

function Putaran({ aktif, children }: { aktif: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current && aktif) g.current.rotation.y += dt * 0.4;
  });
  return <group ref={g}>{children}</group>;
}

/**
 * Dua ruang, bukan satu.
 *
 * Ruang `darat` terang seperti siang di pantai. Itu benar untuk flamingo dan
 * keranjang piknik, dan salah total untuk ubur-ubur: pendar dinilai dari
 * seberapa jauh ia mengalahkan gelap di sekitarnya, dan di ruang putih tidak
 * ada gelap untuk dikalahkan.
 *
 * Pelajaran yang sama dengan `pandang: "atas"` pada bintang laut — panggung
 * yang salah membuat cacat bentuk tidak mungkin terlihat.
 */
const RUANG = {
  darat: {
    langit: "#F1F6FA",
    lantai: "#E9EFF4",
    kisi: ["#BFD1DE", "#DBE6EE"] as [string, string],
    ambient: { i: 1.05, c: "#FFFFFF" },
    utama: { pos: [8, 12, 7] as [number, number, number], i: 1.7, c: "#FFF6DC" },
    isi: { pos: [-9, 4, -5] as [number, number, number], i: 0.5, c: "#BFE6FA" },
    kabut: null as null | [string, number, number],
  },
  laut: {
    langit: "#0E3350",
    lantai: "#0A2942",
    kisi: ["#1D4E70", "#153E5C"] as [string, string],
    // Cahaya bawah air datang dari SATU arah — permukaan, di atas. Cahaya isi
    // dibuat dari bawah dan sangat redup: itu pantulan dasar laut, dan tanpa
    // itu bagian bawah tiap makhluk jadi siluet hitam pekat.
    ambient: { i: 0.5, c: "#7FC4E8" },
    utama: { pos: [3, 16, 5] as [number, number, number], i: 1.5, c: "#CFEEFF" },
    isi: { pos: [-4, -6, -3] as [number, number, number], i: 0.22, c: "#2E6E9E" },
    kabut: ["#0E3350", 6, 34] as [string, number, number],
  },
} as const;

type Ruang = keyof typeof RUANG;

/** lantai + kisi: satu-satunya cara melihat benda menempel atau melayang */
function Lantai({ r, ruang }: { r: number; ruang: Ruang }) {
  const t = RUANG[ruang];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]}>
        <circleGeometry args={[r, 56]} />
        <meshBasicMaterial color={t.lantai} />
      </mesh>
      <gridHelper args={[r * 2, 16, t.kisi[0], t.kisi[1]]} />
    </group>
  );
}

export default function Galeri() {
  const [pilih, setPilih] = useState(0);
  const [putar, setPutar] = useState(true);
  const [paksaPandang, setPaksaPandang] = useState<Pandang | null>(null);
  const [paksaRuang, setPaksaRuang] = useState<Ruang | null>(null);
  const [gerak, setGerak] = useState(true);

  const aset = ASSETS[pilih];
  const { Comp, tinggi, angkat = 0 } = aset;
  const pandang: Pandang = paksaPandang ?? aset.pandang ?? "miring";
  const ruang: Ruang = paksaRuang ?? aset.ruang ?? "darat";
  const t = RUANG[ruang];

  return (
    <main className="as">
      <header className="as-atas">
        <div>
          <p className="as-kicker">Untuk Olen</p>
          <h1>Aset 3D</h1>
          <p className="as-sub">
            Tiap model dinilai sendirian di sini dulu, baru dipasang ke scene — bukan
            sebaliknya. Semua digambar di titik nol, menghadap +X, berdiri di y = 0.
            Satu satuan dunia = 30 cm.
          </p>
        </div>
      </header>

      <div className="as-isi">
        <nav className="as-daftar">
          {ASSETS.map((a, i) => (
            <button
              key={a.id}
              className={`as-item${i === pilih ? " on" : ""}`}
              onClick={() => {
                setPilih(i);
                setPaksaPandang(null);
                setPaksaRuang(null);
              }}
            >
              <span className="as-item-nama">{a.nama}</span>
              <span className="as-item-ukuran">{(a.tinggi * 0.3).toFixed(2)} m</span>
            </button>
          ))}
        </nav>

        <section className="as-utama">
          <div className="as-panggung">
            {/* satu-satunya konteks WebGL di halaman ini */}
            <Canvas dpr={[1, 2]} camera={{ fov: 38, near: 0.05, far: 400 }} gl={{ antialias: true }}>
              <color attach="background" args={[t.langit]} />
              {t.kabut && <fog attach="fog" args={[t.kabut[0], t.kabut[1], t.kabut[2]]} />}
              <ambientLight intensity={t.ambient.i} color={t.ambient.c} />
              <directionalLight position={t.utama.pos} intensity={t.utama.i} color={t.utama.c} />
              <directionalLight position={t.isi.pos} intensity={t.isi.i} color={t.isi.c} />
              <Panggung tinggi={tinggi} pandang={pandang} />
              <Lantai r={Math.max(tinggi * 0.8, 1.2)} ruang={ruang} />
              <Putaran aktif={putar}>
                <group position={[0, angkat, 0]}>
                  <Comp animate={gerak} />
                </group>
              </Putaran>
            </Canvas>
          </div>

          <div className="as-kendali">
            <button className="as-tombol" onClick={() => setPutar((p) => !p)}>
              {putar ? "hentikan putaran" : "putar"}
            </button>
            <button className="as-tombol" onClick={() => setGerak((g) => !g)}>
              {gerak ? "hentikan animasi" : "jalankan animasi"}
            </button>
            <span className="as-pisah" />
            {(["samping", "miring", "atas"] as Pandang[]).map((p) => (
              <button
                key={p}
                className={`as-tombol${pandang === p ? " on" : ""}`}
                onClick={() => setPaksaPandang(p)}
              >
                {p}
              </button>
            ))}
            <span className="as-pisah" />
            {(["darat", "laut"] as Ruang[]).map((r) => (
              <button
                key={r}
                className={`as-tombol${ruang === r ? " on" : ""}`}
                onClick={() => setPaksaRuang(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="as-teks">
            <h2>{aset.nama}</h2>
            <p>{aset.catatan}</p>
            <span className="as-ukuran">
              ± {aset.tinggi} satuan · {(aset.tinggi * 0.3).toFixed(2)} m
              {angkat ? ` · titik nol di tengah, diangkat ${angkat} untuk pratinjau` : ""}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

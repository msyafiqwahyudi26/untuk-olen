"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sandAt } from "./world";
import Flamingo from "./assets/Flamingo";
import Kepiting, { type KepitingKendali } from "./assets/Kepiting";
import BintangLaut from "./assets/BintangLaut";
import Keranjang, { KERANJANG_R, ISI_Y, ISI_R } from "./assets/Keranjang";
import Piring from "./assets/Piring";
import Cangkir from "./assets/Cangkir";
import Tikar from "./assets/Tikar";
import Bunga from "./assets/Bunga";
import BungaKecil from "./assets/BungaKecil";
import Buah, { type JenisBuah } from "./assets/Buah";
import Kerang from "./assets/Kerang";
import { Contact } from "./assets/kit";

/**
 * ═══ PENEMPATAN DI PANTAI ═══
 *
 * Berkas ini TIDAK membuat bentuk apa pun. Semua bentuk ada di assets/ dan
 * bisa dinilai sendiri-sendiri di /aset. Di sini cuma soal: di mana benda itu
 * berdiri, seberapa besar, dan ke mana ia berjalan.
 *
 * Pemisahan ini yang dulu tidak ada, dan itu sebabnya tiap perbaikan bentuk
 * merusak penempatan, dan tiap perbaikan penempatan merusak bentuk.
 */

const MAT = { x: -5.6, z: 34.6, w: 6.6, d: 4.8, rot: 0.2 };
const MAT_LIFT = 0.05;
const MAT_BASE_Y = sandAt(MAT.x, MAT.z);

/** koordinat di atas tikar (u,v ∈ -1..1) → koordinat dunia lengkap tingginya */
function onMat(u: number, v: number): [number, number, number] {
  const cos = Math.cos(MAT.rot);
  const sin = Math.sin(MAT.rot);
  const lx = u * MAT.w * 0.5;
  const lz = v * MAT.d * 0.5;
  const x = MAT.x + lx * cos - lz * sin;
  const z = MAT.z + lx * sin + lz * cos;
  return [x, sandAt(x, z) + MAT_LIFT, z];
}

/* ═══════════════ tikar ═══════════════ */

function TikarDiPasir() {
  const geo = useMemo(() => new THREE.PlaneGeometry(MAT.w, MAT.d, 16, 12), []);

  /**
   * Tinggi pasir tepat di bawah tiap titik kain.
   *
   * Mesh tikar diputar [-π/2, 0, MAT.rot]. Three mengurutkan rotasi X·Y·Z,
   * jadi titik lokal (x, y, z) berakhir di dunia sebagai:
   *     Rz  → (x·cos − y·sin,  x·sin + y·cos,  z)
   *     Rx  → (        a,              z,          −b        )
   * artinya duniaX = MAT.x + a, duniaZ = MAT.z − b, duniaY = posisi.y + z.
   * Itu sebabnya yang digeser adalah komponen Z LOKAL.
   */
  const lekuk = useMemo(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const cos = Math.cos(MAT.rot);
    const sin = Math.sin(MAT.rot);
    const out = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const wx = MAT.x + (x * cos - y * sin);
      const wz = MAT.z - (x * sin + y * cos);
      out[i] = sandAt(wx, wz) - MAT_BASE_Y + MAT_LIFT;
    }
    return out;
  }, [geo]);

  return (
    <group position={[MAT.x, MAT_BASE_Y, MAT.z]} rotation={[0, MAT.rot, 0]}>
      <Tikar w={MAT.w} d={MAT.d} lekuk={lekuk} />
    </group>
  );
}

/* ═══════════════ kepiting: jalan, berhenti, melambai ═══════════════ */

const CRAB_Z = 29.9;
const CRAB_X0 = -23;
const CRAB_X1 = 23;

/**
 * Satu putaran penuh = menyeberang + berhenti melambai + JEDA KOSONG.
 *
 * Jedanya penting dan dulu tidak ada: begitu kepiting keluar layar kanan, ia
 * langsung muncul lagi di kiri. Dari layar terlihat seperti kepiting yang
 * tidak pernah selesai lewat. Sekarang ada 22 detik pantai tanpa kepiting
 * sama sekali, jadi kemunculannya kembali terasa seperti kejadian.
 */
const CRAB_JALAN = 52;   // detik: dari tepi kiri sampai keluar tepi kanan
const CRAB_SEPI = 22;    // detik: pantai kosong sebelum ia lewat lagi
const CRAB_CYCLE = CRAB_JALAN + CRAB_SEPI;

/**
 * Jejak kaki di pasir.
 *
 * Satu InstancedMesh, bukan puluhan mesh terpisah. Memudarnya BUKAN lewat
 * opacity — opacity tidak bisa berbeda per instance — melainkan dengan
 * melerp warna jejak ke warna pasir. Hasil di mata sama, biayanya satu
 * draw call.
 */
const JEJAK = 46;

function Jejak({ pos }: { pos: React.RefObject<{ x: number; z: number; t: number }[]> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const warnaJejak = useMemo(() => new THREE.Color("#8A6534"), []);
  const warnaPasir = useMemo(() => new THREE.Color("#DCC08A"), []);
  const c = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const m = mesh.current;
    const daftar = pos.current;
    if (!m || !daftar) return;
    const now = performance.now() * 0.001;
    for (let i = 0; i < JEJAK; i++) {
      const j = daftar[i];
      if (!j) {
        dummy.position.set(0, -999, 0);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const umur = Math.min(1, (now - j.t) / 30); // memudar 30 detik
      dummy.position.set(j.x, sandAt(j.x, j.z) + 0.008, j.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.setScalar(1 - umur * 0.3);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      c.copy(warnaJejak).lerp(warnaPasir, umur);
      m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    // frustumCulled={false} WAJIB di sini. Bola pembatas InstancedMesh
    // dihitung dari geometri dasarnya di titik nol, bukan dari sebaran
    // instance-nya. Jejak kaki tersebar sampai x = ±21, jadi three menyangka
    // seluruh mesh ada di dekat titik nol dan membuangnya dari frustum —
    // tidak ada yang tergambar, tanpa error apa pun.
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, JEJAK]}
      frustumCulled={false}
      renderOrder={1}
    >
      <circleGeometry args={[0.105, 12]} />
      <meshBasicMaterial transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  );
}

function KepitingBerjalan() {
  const grp = useRef<THREE.Group>(null);
  const jejak = useRef<{ x: number; z: number; t: number }[]>([]);
  const jejakBerikut = useRef(0);
  const terakhir = useRef(0);
  // objek stabil yang dimutasi tiap frame dan dibaca langsung oleh aset —
  // lihat catatan KepitingKendali di assets/Kepiting.tsx
  const kendali = useRef<KepitingKendali>({ langkah: 1, melambai: 0 }).current;

  useFrame(() => {
    const g = grp.current;
    if (!g) return;
    const now = performance.now() * 0.001;
    const detik = now % CRAB_CYCLE;
    g.visible = detik < CRAB_JALAN;
    if (!g.visible) {
      kendali.langkah = 0;
      kendali.melambai = 0;
      return;
    }
    const k = detik / CRAB_JALAN;

    /**
     * Perjalanannya:
     *   0.00–0.40  berjalan dari kiri ke tengah
     *   0.40–0.60  BERHENTI, menghadap kamera, melambai
     *   0.60–1.00  jalan lagi sampai keluar tepi kanan
     *
     * Kemajuannya dihitung dari jarak yang ditempuh, bukan dari waktu, supaya
     * waktu berhenti kepitingnya benar-benar diam — bukan sekadar melambat.
     *
     * Tiap babak jalan diberi percepatan-perlambatan (smoothstep). Sebelumnya
     * lajunya rata dari awal sampai akhir, dan itu yang bikin terasa
     * "statis": makhluk hidup tidak pernah berangkat dan berhenti mendadak
     * pada kecepatan yang sama persis.
     */
    const ease = (a: number) => a * a * (3 - 2 * a);
    const jalan1 = ease(Math.min(1, Math.max(0, k / 0.4)));
    const jalan2 = ease(Math.min(1, Math.max(0, (k - 0.6) / 0.4)));
    const maju = jalan1 * 0.5 + jalan2 * 0.5;

    const berhenti = k > 0.4 && k < 0.6;
    kendali.langkah += ((berhenti ? 0 : 1) - kendali.langkah) * 0.045;

    const w = berhenti ? Math.sin(((k - 0.4) / 0.2) * Math.PI) : 0;
    kendali.melambai += (w - kendali.melambai) * 0.05;

    const x = CRAB_X0 + (CRAB_X1 - CRAB_X0) * maju;
    const z = CRAB_Z + Math.sin(now * 0.16) * 0.35;
    g.position.set(x, sandAt(x, z), z);

    /**
     * Arah hadap.
     *
     * Kepiting berjalan MENYAMPING, jadi waktu berjalan badannya tegak lurus
     * arah jalan: rotation.y = +90°. Untuk menghadap kamera ia harus berputar
     * ke 0°, BUKAN ke -90°. Versi lalu memakai -90° dan itu memutarnya 180°
     * penuh — punggungnya yang menghadap kamera. Keluhan Yaya persis:
     * "bukannya menghadap ke depan tapi malah berputar ke belakang".
     */
    const HADAP_JALAN = Math.PI * 0.5;
    const HADAP_KAMERA = 0;
    g.rotation.y =
      HADAP_JALAN + (HADAP_KAMERA - HADAP_JALAN) * kendali.melambai +
      Math.sin(now * 0.16) * 0.08;

    // tinggalkan jejak tiap 0.55 detik selama masih berjalan
    if (kendali.langkah > 0.35 && now - terakhir.current > 0.5) {
      terakhir.current = now;
      jejak.current[jejakBerikut.current % JEJAK] = {
        x: x + (jejakBerikut.current % 2 ? 0.16 : -0.16),
        z: z + (jejakBerikut.current % 2 ? 0.24 : -0.24),
        t: now,
      };
      jejakBerikut.current++;
    }
  });

  return (
    <>
      <Jejak pos={jejak} />
      <group ref={grp}>
        <Kepiting kendali={kendali} />
      </group>
    </>
  );
}

/* ═══════════════ kerang & kerikil ═══════════════ */

const LITTER: { x: number; z: number; jenis: 0 | 1 | 2; r: number; rot: number }[] = [
  { x: -17.5, z: 31.4, jenis: 0, r: 0.2, rot: 0.8 },
  { x: -11.2, z: 36.5, jenis: 1, r: 0.15, rot: 2.1 },
  { x: -2.4, z: 31.9, jenis: 0, r: 0.16, rot: -1.2 },
  { x: 2.8, z: 37.2, jenis: 2, r: 0.13, rot: 0.4 },
  { x: 6.6, z: 32.6, jenis: 1, r: 0.18, rot: 1.7 },
  { x: 11.8, z: 35.6, jenis: 0, r: 0.22, rot: -0.6 },
  { x: 18.4, z: 32.9, jenis: 2, r: 0.14, rot: 2.6 },
  { x: -8.2, z: 38.2, jenis: 2, r: 0.12, rot: 1.1 },
  { x: 19.2, z: 37.8, jenis: 1, r: 0.17, rot: -2.2 },
  { x: -20.4, z: 36.2, jenis: 0, r: 0.19, rot: 0.2 },
];

/*
 * LAPISAN "PASIR DEKAT" DIBUANG 31 AGUSTUS, dan alasannya perlu dicatat
 * supaya tidak dibangun ulang oleh orang berikutnya yang melihat pasir
 * kosong dan berpikir hal yang sama.
 *
 * Ia ditambahkan waktu kamera di HP berdiri jauh di belakang (z = 72) demi
 * mengejar lebar pandangan. Di situ bingkai bawah layar menyentuh tanah di
 * z ≈ 67, jadi ada hamparan pasir kosong sepanjang 30 satuan yang perlu
 * diisi, dan sebelas kerang serta dua bintang laut di z 44 sampai 63
 * mengisinya.
 *
 * Kamera sekarang berdiri di z = 44 supaya bendanya terbaca besar (lihat
 * catatan Bingkai di OpeningScene.tsx). Bingkai bawah menyentuh tanah di
 * z ≈ 37, dan seluruh lapisan itu berada DI BELAKANG kamera — tidak
 * tergambar sama sekali, cuma menambah geometri yang dihitung tiap bingkai.
 *
 * Pasir kosong yang dulu ada juga ikut hilang dengan sendirinya: dari z 37
 * ke garis air di z 28 tinggal sembilan satuan, dan piknik ada tepat di
 * tengahnya.
 */

/* ═══════════════ susunan lengkap ═══════════════ */

/**
 * Tata letak di atas tikar.
 *
 * Keranjang ada di (u -0.86, v -0.42) dengan jari-jari KERANJANG_R = 0.62.
 * Semua piring dan cangkir DIJAUHKAN dari titik itu — piring yang menembus
 * keranjang kemarin terjadi karena letaknya ditebak satu per satu, bukan
 * dihitung terhadap keranjangnya.
 */
const BASKET_UV: [number, number] = [-0.86, -0.42];

export default function Beach() {
  const [bx, , bz] = onMat(...BASKET_UV);

  /** benar-benar bebas dari keranjang? dipakai waktu menyusun, bukan saat render */
  const jauhDariKeranjang = (u: number, v: number, r: number) => {
    const [x, , z] = onMat(u, v);
    return Math.hypot(x - bx, z - bz) > KERANJANG_R + r + 0.18;
  };

  /**
   * Piring cuma dua sekarang, dan keduanya di paruh KANAN tikar.
   *
   * Piring ketiga dulu ada di (-0.3, 0.5) — sisi yang sama dengan keranjang.
   * Piring lebar (r 0.38) dan keranjang lebar (r 0.62) di petak yang sama
   * selalu bersinggungan, seberapa pun digeser sedikit-sedikit. Sisi kiri
   * sekarang diisi buah yang jauh lebih kecil, jadi punya ruang gerak.
   */
  const piring: { u: number; v: number; r: number; cookies: number }[] = [
    { u: 0.06, v: -0.32, r: 0.52, cookies: 3 },
    { u: 0.52, v: 0.34, r: 0.44, cookies: 1 },
  ];
  /**
   * Buah ditaruh DI DALAM keranjang, bukan berserak di kain.
   *
   * Koordinatnya relatif terhadap keranjang (bukan terhadap tikar), jadi
   * tidak mungkin lagi bersinggungan dengan gelas atau piring di luar sana —
   * jaraknya ke apa pun di kain sudah dijamin oleh dinding keranjang.
   * Pisang ditaruh paling belakang dan menyandar; kalau di depan, ujungnya
   * yang panjang menonjol keluar melewati bibir keranjang.
   */
  const buah: { x: number; z: number; y: number; jenis: JenisBuah; rot: number; miring: number }[] = [
    { x: -0.13, z: 0.1, y: 0, jenis: "apel", rot: 0.4, miring: 0.1 },
    { x: 0.14, z: -0.05, y: 0.03, jenis: "jeruk", rot: -0.8, miring: -0.12 },
    { x: -0.02, z: -0.2, y: 0.12, jenis: "pisang", rot: 2.4, miring: -0.35 },
  ];
  const cangkir: { u: number; v: number; tilt: number }[] = [
    { u: 0.34, v: -0.66, tilt: 0.3 },
    { u: -0.04, v: 0.72, tilt: -0.5 },
    { u: 0.74, v: -0.1, tilt: 0.9 },
  ];

  if (process.env.NODE_ENV !== "production") {
    for (const p of piring) {
      if (!jauhDariKeranjang(p.u, p.v, p.r)) {
        console.warn(`[olen] piring di (${p.u}, ${p.v}) menembus keranjang`);
      }
    }
    for (const c of cangkir) {
      if (!jauhDariKeranjang(c.u, c.v, 0.2)) {
        console.warn(`[olen] cangkir di (${c.u}, ${c.v}) menembus keranjang`);
      }
    }
    for (const b of buah) {
      if (Math.hypot(b.x, b.z) + 0.17 > ISI_R + 0.12) {
        console.warn(`[olen] buah di (${b.x}, ${b.z}) menembus dinding keranjang`);
      }
    }
  }

  return (
    <group>
      <TikarDiPasir />
      <Contact r={3.3} o={0.13} y={MAT_BASE_Y + 0.01} />

      <group position={[bx, sandAt(bx, bz) + MAT_LIFT, bz]} rotation={[0, 0.4, 0]}>
        <Keranjang />
        {buah.map((b, i) => (
          <group
            key={i}
            position={[b.x, ISI_Y + b.y, b.z]}
            rotation={[b.miring, b.rot, b.miring * 0.5]}
          >
            <Buah jenis={b.jenis} />
          </group>
        ))}
      </group>

      {piring.map((p, i) => {
        const [x, y, z] = onMat(p.u, p.v);
        return (
          <group key={i} position={[x, y, z]}>
            <Piring r={p.r} cookies={p.cookies} />
          </group>
        );
      })}

      {cangkir.map((c, i) => {
        const [x, y, z] = onMat(c.u, c.v);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, c.tilt, 0]}>
            <Cangkir />
          </group>
        );
      })}

      {[
        { u: -0.64, v: 0.78, rot: 0.7, s: 1.15, petal: "#FFD24E", core: "#7A4B22" },
        { u: -0.48, v: 0.94, rot: 2.1, s: 0.95, petal: "#FFC93C", core: "#6B4423" },
      ].map((f, i) => {
        const [x, y, z] = onMat(f.u, f.v);
        return (
          <group key={i} position={[x, y + 0.02, z]} rotation={[0, f.rot, 0]} scale={f.s}>
            <Bunga petal={f.petal} core={f.core} />
          </group>
        );
      })}

      {/* daisy putih — aset tersendiri, bukan bunga matahari yang dicat putih */}
      {[
        { u: 0.88, v: 0.62, rot: -1.1, s: 1.2 },
        { u: 0.66, v: 0.88, rot: 0.9, s: 0.95 },
      ].map((f, i) => {
        const [x, y, z] = onMat(f.u, f.v);
        return (
          <group key={i} position={[x, y + 0.02, z]} rotation={[0, f.rot, 0]} scale={f.s}>
            <BungaKecil />
          </group>
        );
      })}

      {/* bintang laut — semuanya di z ≥ 31.4, jauh dari jalur kepiting */}
      {[
        { x: 4.6, z: 32.2, r: 0.62, rot: 0.5 },
        { x: -14.5, z: 32.4, r: 0.48, rot: -0.9 },
        { x: 16.8, z: 33.6, r: 0.42, rot: 1.5 },
      ].map((s, i) => (
        <group key={i} position={[s.x, sandAt(s.x, s.z), s.z]} rotation={[0, s.rot, 0]} scale={s.r}>
          <BintangLaut />
          <Contact r={1.05} o={0.14} />
        </group>
      ))}

      {LITTER.map((o, i) => (
        <group key={i} position={[o.x, sandAt(o.x, o.z), o.z]} rotation={[0, o.rot, 0]}>
          <Kerang jenis={o.jenis} r={o.r} />
        </group>
      ))}


      <KepitingBerjalan />

      {/* Flamingo di pojok kanan.
          Digeser sedikit lebih ke laut (z 31.3 → 30.6) dan diputar lebih
          menyerong ke kamera (-0.55 → -1.05) supaya siluet leher-S dan
          paruhnya terbaca, bukan cuma badan dari samping. Skalanya naik
          sedikit karena posisinya jadi lebih jauh. */}
      {/**
        * Menghadap KIRI, ke arah tempat piknik.
        *
        * Aset flamingo digambar menghadap +X. Arah hadap di dunia ini:
        *     rotation.y = 0      → +X, kanan layar
        *     rotation.y = π/2    → +Z, ke arah kamera
        *     rotation.y = π      → −X, kiri layar
        *     rotation.y = −π/2   → −Z, MEMBELAKANGI layar
        * Dua percobaan sebelumnya (−1.05 dan +1.05) sama-sama meleset karena
        * keduanya berada di paruh yang salah. π − 0.55 ≈ 2.59 membuatnya
        * menghadap kiri dan sedikit menyerong ke kamera, jadi siluet leher-S
        * dan paruhnya tetap terbaca.
        */}
      <group position={[10.2, sandAt(10.2, 30.6), 30.6]} rotation={[0, Math.PI - 0.55, 0]} scale={0.9}>
        <Flamingo />
        <Contact r={0.46} o={0.2} />
      </group>
    </group>
  );
}

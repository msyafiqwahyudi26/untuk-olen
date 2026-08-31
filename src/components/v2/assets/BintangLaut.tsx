"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ BINTANG LAUT ═══
 * Rebah di titik nol, y = 0 di pasir. Lebar ± 2 satuan (jari-jari 1).
 *
 * ── SUDAH DICOBA DAN GAGAL ──
 * Membuat siluetnya dengan THREE.Shape lalu ExtrudeGeometry ber-bevel tebal.
 * Masalahnya matematis, bukan selera: lembah antar lengan cuma berjarak 0.42
 * dari pusat, sedangkan bevel memakan 0.2 dari SETIAP sisi. Lembahnya
 * tertutup, dan yang keluar gumpalan oranye. Menipiskan bevel mengembalikan
 * tepi yang tajam — jadi tidak ada nilai bevel yang benar.
 *
 * ── Yang dipakai sekarang ──
 * Bentuknya dibangun langsung sebagai permukaan. Untuk tiap sudut θ dan
 * jarak v (0 di pusat, 1 di ujung lengan):
 *     R(θ) = 0.42 + 0.58 · (1 + cos 5θ)/2        ← siluet lima lengan
 *     h    = H · lerp(1, R^0.6, v) · √(1 − v²)   ← kubah, menipis ke ujung
 * Lengannya jadi gemuk membulat, lembahnya lebih tipis daripada lengannya
 * (memang begitu bentuk aslinya), dan tidak ada satu pun sudut tajam.
 */

const H = 0.36;
const Rof = (a: number) => 0.42 + 0.58 * (0.5 + 0.5 * Math.cos(5 * a));

/**
 * SATU kulit tertutup, bukan dua kulit yang ditempelkan.
 *
 * Versi sebelumnya membangun kulit atas dan kulit bawah secara terpisah, dan
 * keduanya kebetulan berakhir di titik yang sama di tepi lengan. "Kebetulan
 * sama" tidak cukup: titik-titiknya tetap dua himpunan berbeda, jadi
 * computeVertexNormals menghitung normal yang berbeda di kiri dan kanan
 * jahitan, dan di sepanjang tepi lengan muncul garis-garis terang — itulah
 * "celah putih" yang terlihat di bintang lautnya.
 *
 * Sekarang permukaannya satu lembar menerus: dari pusat atas, keluar ke ujung
 * lengan, lalu balik ke pusat bawah. Cincin di ujung lengan DIPAKAI BERSAMA,
 * jadi tidak ada jahitan untuk dilihat.
 *
 * Lengannya juga melengkung naik sedikit di ujung — bintang laut sungguhan
 * begitu, dan itu yang membuatnya terbaca sebagai hewan yang menempel di
 * pasir alih-alih stiker yang ditempel.
 */
function surface() {
  const NA = 160;   // keliling
  const NR = 22;    // pusat → ujung lengan, untuk SATU sisi
  const pos: number[] = [];
  const index: number[] = [];

  // urutan cincin: 0 = pusat atas … NR = ujung lengan … 2·NR = pusat bawah
  const RING = 2 * NR;

  for (let i = 0; i <= NA; i++) {
    const a = (i / NA) * Math.PI * 2;
    const R = Rof(a);
    for (let k = 0; k <= RING; k++) {
      const atas = k <= NR;
      const v = atas ? k / NR : (RING - k) / NR;          // 0 pusat, 1 ujung
      const sisi = atas ? 1 : -0.32;                       // bawah lebih rata
      const thick = 1 + (Math.pow(R, 0.6) - 1) * v;
      // lengannya terangkat sedikit di ujung
      const angkat = Math.pow(v, 2.4) * 0.16;
      const h = H * thick * Math.sqrt(Math.max(0, 1 - v * v)) * sisi + angkat;
      pos.push(Math.cos(a) * R * v, h, Math.sin(a) * R * v);
    }
  }

  for (let i = 0; i < NA; i++) {
    for (let k = 0; k < RING; k++) {
      const a0 = i * (RING + 1) + k;
      const b0 = (i + 1) * (RING + 1) + k;
      index.push(a0, a0 + 1, b0 + 1, a0, b0 + 1, b0);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** bintil-bintil sepanjang punggung lengan — ini yang bikin terasa bertekstur */
function tubercles() {
  const out: { p: [number, number, number]; s: number }[] = [];
  for (let arm = 0; arm < 5; arm++) {
    const a = (arm / 5) * Math.PI * 2;
    for (let j = 1; j <= 6; j++) {
      const v = j / 7;
      for (const off of j <= 4 ? [-1, 0, 1] : [0]) {
        const aa = a + off * 0.17 * (1 - v * 0.5);
        const R = Rof(aa);
        const thick = 1 + (Math.pow(R, 0.6) - 1) * v;
        const angkat = Math.pow(v, 2.4) * 0.16;
        const h = H * thick * Math.sqrt(Math.max(0, 1 - v * v)) + angkat;
        out.push({
          // 0.82, bukan 0.9: bintilnya harus SETENGAH TERBENAM di punggung.
          // Kalau cuma menyentuh permukaan, tepi bolanya beradu dengan kulit
          // dan muncul garis terang di sekelilingnya — cacat yang sama
          // dengan jahitan tadi, dalam bentuk kecil.
          p: [Math.cos(aa) * R * v, h * 0.82, Math.sin(aa) * R * v],
          s: (off === 0 ? 0.055 : 0.036) * (1.15 - v * 0.5),
        });
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    out.push({ p: [Math.cos(a) * 0.13, H * 0.88, Math.sin(a) * 0.13], s: 0.042 });
  }
  return out;
}

export default function BintangLaut({ animate = true }: { animate?: boolean }) {
  const ramp = toonRamp();
  const geo = useMemo(surface, []);
  const bumps = useMemo(tubercles, []);
  const mats = useMemo(
    () => ({
      skin: new THREE.MeshToonMaterial({ color: "#E8752E", gradientMap: ramp }),
      bump: new THREE.MeshToonMaterial({ color: "#FFBE7A", gradientMap: ramp }),
    }),
    [ramp]
  );
  const grp = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!animate || !grp.current) return;
    const t = performance.now() * 0.001;
    // hewan yang sedang diam tapi hidup: lengannya bergerak sangat pelan
    grp.current.rotation.x = Math.sin(t * 0.5) * 0.06;
    grp.current.rotation.z = Math.sin(t * 0.37) * 0.07;
    grp.current.scale.y = 1 + Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group ref={grp} position={[0, H * 0.3, 0]}>
      <mesh geometry={geo} material={mats.skin} />
      {/* Kubah penutup pusat.
          Di titik pusat, seluruh 160 titik keliling jatuh ke koordinat yang
          sama. Segitiga-segitiga di situ luasnya nol, jadi normalnya tidak
          terdefinisi dan yang muncul di layar bercak terang kecil. Ditutup
          saja dengan kubah sewarna — jauh lebih murah daripada membangun
          ulang topologi pusatnya. */}
      <mesh position={[0, H * 0.06, 0]} scale={[0.3, 0.3, 0.3]} material={mats.skin}>
        <sphereGeometry args={[1, 20, 14]} />
      </mesh>
      {bumps.map((b, i) => (
        <mesh key={i} position={b.p} scale={[1, 0.55, 1]} material={mats.bump}>
          <sphereGeometry args={[b.s, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}

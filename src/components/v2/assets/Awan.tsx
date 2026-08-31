"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ AWAN ═══
 * Berpusat di titik nol. Lebar ± 5 satuan, tinggi ± 2.
 *
 * Gumpalan bola yang TIAP BUTIRNYA bernapas sendiri dengan periode berbeda.
 * Kalau seluruh awan diskalakan bersama, yang terlihat cuma benda membesar-
 * mengecil; kalau tiap butir punya iramanya sendiri, siluetnya berubah pelan
 * dan terbaca sebagai uap.
 *
 * Ada dua susunan supaya awan-awan di langit tidak kembar.
 */

type Puff = { p: [number, number, number]; r: number };

const SHAPES: Puff[][] = [
  [
    { p: [0, 0, 0], r: 1 },
    { p: [-1.1, -0.25, 0.2], r: 0.72 },
    { p: [1.05, -0.2, -0.15], r: 0.78 },
    { p: [0.35, 0.55, 0.25], r: 0.62 },
    { p: [-0.55, 0.42, -0.3], r: 0.55 },
    { p: [1.85, -0.4, 0.1], r: 0.48 },
  ],
  [
    { p: [0, 0, 0], r: 0.95 },
    { p: [1.25, -0.15, 0.1], r: 0.8 },
    { p: [-1.15, -0.3, -0.2], r: 0.62 },
    { p: [0.6, 0.6, -0.2], r: 0.58 },
    { p: [-2.0, -0.45, 0.15], r: 0.42 },
    { p: [2.2, -0.4, -0.1], r: 0.45 },
  ],
];

export default function Awan({
  animate = true,
  bentuk = 0,
  warna = "#FFFFFF",
  pijar = "#E8F4FC",
  kuat = 0.45,
}: {
  animate?: boolean;
  bentuk?: number;
  /** warna ikut waktu — lihat waktu.ts. Bahan emissive TIDAK ikut gelap
      sendiri waktu lampu diredupkan, jadi harus diganti dari luar. */
  warna?: string;
  pijar?: string;
  kuat?: number;
}) {
  const ramp = toonRamp();
  const puffs = SHAPES[bentuk % SHAPES.length];
  const mat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: new THREE.Color(warna),
        gradientMap: ramp,
        emissive: new THREE.Color(pijar),
        emissiveIntensity: kuat,
      }),
    // dibuat sekali; warnanya digeser halus di useFrame
    [ramp]
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, dt) => {
    // warna bergeser pelan ke palet waktu baru, sama seperti laut dan pasir
    const k = Math.min(1, dt * 0.7);
    mat.color.lerp(new THREE.Color(warna), k);
    mat.emissive.lerp(new THREE.Color(pijar), k);
    mat.emissiveIntensity += (kuat - mat.emissiveIntensity) * k;

    if (!animate) return;
    const t = performance.now() * 0.001;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.scale.setScalar(puffs[i].r * (1 + Math.sin(t * (0.19 + i * 0.037) + i * 2.1) * 0.075));
    });
  });

  return (
    <group>
      {puffs.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={p.p}
          scale={p.r}
          material={mat}
        >
          <sphereGeometry args={[1, 18, 14]} />
        </mesh>
      ))}
    </group>
  );
}

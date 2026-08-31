"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ PIRING & COOKIES ═══
 * Duduk di titik nol, y = 0 di dasar piring. Jari-jari `r`.
 *
 * ── Jebakan torus, lagi ──
 * Bibir piring dibuat dari torus. Torus lahir BERDIRI (bidang XY), jadi tanpa
 * rotasi -π/2 hasilnya bukan bibir melainkan gagang — dan piringnya terbaca
 * sebagai tas tangan. Itu persis yang terjadi di versi pertama.
 */

export default function Piring({
  r = 0.52,
  cookies = 3,
}: {
  r?: number;
  cookies?: number;
  /** bagian dari kontrak library; piring memang tidak bergerak */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      plate: new THREE.MeshToonMaterial({ color: "#FBF7F0", gradientMap: ramp }),
      lip: new THREE.MeshToonMaterial({ color: "#EDE4D6", gradientMap: ramp }),
      cookie: new THREE.MeshToonMaterial({ color: "#C89154", gradientMap: ramp }),
      chip: new THREE.MeshToonMaterial({ color: "#5A3B22", gradientMap: ramp }),
    }),
    [ramp]
  );

  const bits = useMemo(
    () =>
      Array.from({ length: cookies }, (_, i) => {
        const a = (i / Math.max(cookies, 1)) * Math.PI * 2 + i * 1.7;
        const rr = cookies === 1 ? 0 : r * 0.42;
        return {
          x: Math.cos(a) * rr,
          z: Math.sin(a) * rr,
          rot: a,
          s: 0.82 + ((i * 37) % 30) / 100,
        };
      }),
    [cookies, r]
  );

  return (
    <group>
      <mesh position={[0, 0.022, 0]} material={mats.plate}>
        <cylinderGeometry args={[r, r * 0.86, 0.045, 28]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.lip}>
        <torusGeometry args={[r * 0.97, 0.028, 8, 28]} />
      </mesh>
      {bits.map((b, i) => (
        <group key={i} position={[b.x, 0.075, b.z]} rotation={[0, b.rot, 0]} scale={b.s}>
          <mesh material={mats.cookie}>
            <cylinderGeometry args={[r * 0.24, r * 0.25, 0.06, 14]} />
          </mesh>
          {[0, 1, 2].map((d) => (
            <mesh
              key={d}
              position={[(d - 1) * r * 0.1, 0.035, ((d % 2) - 0.5) * r * 0.11]}
              material={mats.chip}
            >
              <sphereGeometry args={[r * 0.045, 6, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

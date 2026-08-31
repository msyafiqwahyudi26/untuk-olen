"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ KERANG & KERIKIL ═══
 * Duduk di titik nol, y = 0 di pasir. Jari-jari `r`.
 *
 * Benda kecil yang berserak. Bukan hiasan — ini yang memberi UKURAN pada
 * pasir. Bidang pasir tanpa benda kecil di atasnya tidak punya skala, dan
 * mata membacanya sebagai bidang warna, bukan permukaan.
 *
 * `jenis`: 0 kerang kipas, 1 kerikil, 2 kerang puntir.
 */

export default function Kerang({
  jenis = 0,
  r = 0.2,
}: {
  jenis?: 0 | 1 | 2;
  r?: number;
  /** bagian dari kontrak library; kerang memang diam */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      shell: new THREE.MeshToonMaterial({ color: "#F6E3D2", gradientMap: ramp, side: THREE.DoubleSide }),
      ridge: new THREE.MeshToonMaterial({ color: "#E7CFB8", gradientMap: ramp }),
      stone: new THREE.MeshToonMaterial({ color: "#B9AFA0", gradientMap: ramp }),
      spiralA: new THREE.MeshToonMaterial({ color: "#F3DCC8", gradientMap: ramp }),
      spiralB: new THREE.MeshToonMaterial({ color: "#E8C9AE", gradientMap: ramp }),
    }),
    [ramp]
  );

  if (jenis === 1) {
    return (
      <mesh position={[0, r * 0.35, 0]} scale={[1, 0.62, 0.85]} rotation={[0.2, 0, 0.4]} material={mats.stone}>
        <dodecahedronGeometry args={[r, 1]} />
      </mesh>
    );
  }

  if (jenis === 2) {
    return (
      <group position={[0, r * 0.3, 0]} rotation={[0.9, 0, 0]}>
        {[0, 1, 2, 3].map((j) => (
          <mesh
            key={j}
            position={[0, j * r * 0.42, 0]}
            scale={1 - j * 0.2}
            material={j % 2 ? mats.spiralA : mats.spiralB}
          >
            <sphereGeometry args={[r * 0.8, 10, 8]} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={[0, r * 0.2, 0]} rotation={[-0.35, 0, 0.2]}>
      <mesh scale={[1, 0.45, 0.85]} material={mats.shell}>
        <sphereGeometry args={[r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {[-0.5, -0.2, 0.1, 0.4].map((a, j) => (
        <mesh
          key={j}
          position={[Math.sin(a) * r * 0.6, r * 0.2, Math.cos(a) * r * 0.6]}
          scale={[0.06, 0.4, 0.9]}
          material={mats.ridge}
        >
          <sphereGeometry args={[r, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
}

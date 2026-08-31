"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ BUNGA TERGELETAK ═══
 * Rebah di titik nol, y = 0 di kain. Lebar ± 1 satuan.
 *
 * Bunga ini DILETAKKAN, bukan tumbuh. Tangkainya rebah menyamping dan
 * kelopaknya menghadap atas — itu bedanya dengan bunga di tanah, dan itu yang
 * menyampaikan bahwa ada yang memetiknya lalu menaruhnya di situ.
 */

export default function Bunga({
  petal = "#FFD24E",
  core = "#7A4B22",
  n = 12,
}: {
  petal?: string;
  core?: string;
  n?: number;
  /** bagian dari kontrak library; bunga ini memang diam */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      stem: new THREE.MeshToonMaterial({ color: "#5C8F3E", gradientMap: ramp }),
      leaf: new THREE.MeshToonMaterial({ color: "#67A047", gradientMap: ramp }),
      petal: new THREE.MeshToonMaterial({ color: petal, gradientMap: ramp }),
      core: new THREE.MeshToonMaterial({ color: core, gradientMap: ramp }),
    }),
    [ramp, petal, core]
  );

  return (
    <group>
      <mesh position={[-0.55, 0.01, 0.06]} rotation={[0, 0.22, Math.PI / 2]} material={mats.stem}>
        <cylinderGeometry args={[0.026, 0.03, 1.1, 8]} />
      </mesh>
      <mesh position={[-0.78, 0.02, 0.2]} rotation={[Math.PI / 2, 0, 0.6]} scale={[0.22, 0.02, 0.1]} material={mats.leaf}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.26, 0.03, Math.sin(a) * 0.26]}
            rotation={[0, -a, 0]}
            scale={[0.3, 0.035, 0.12]}
            material={mats.petal}
          >
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.05, 0]} material={mats.core}>
        <sphereGeometry args={[0.2, 16, 12]} />
      </mesh>
    </group>
  );
}

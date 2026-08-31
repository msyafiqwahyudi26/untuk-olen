"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ BUNGA KECIL PUTIH ═══
 * Rebah di titik nol, y = 0 di kain. Lebar ± 0,5 satuan.
 *
 * Ini bunga daisy kecil yang tergeletak di sudut tikar — yang oleh Yaya
 * disebut "bunga kecil yang putih itu". Sempat hilang dari daftar aset
 * karena selama ini ia bukan komponen tersendiri, melainkan `Bunga` yang
 * kebetulan dipanggil dengan warna putih. Sekarang jadi aset sendiri:
 * kelopaknya lebih ramping dan lebih banyak, mahkotanya lebih kecil dan
 * lebih menonjol — daisy, bukan bunga matahari yang dicat putih.
 */

export default function BungaKecil({
  petal = "#FFFFFF",
  core = "#FFD34E",
}: {
  petal?: string;
  core?: string;
  /** bagian dari kontrak library; bunga ini memang diam */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      petal: new THREE.MeshToonMaterial({ color: petal, gradientMap: ramp }),
      core: new THREE.MeshToonMaterial({ color: core, gradientMap: ramp }),
      stem: new THREE.MeshToonMaterial({ color: "#67A047", gradientMap: ramp }),
    }),
    [ramp, petal, core]
  );

  const n = 16;

  return (
    <group>
      {/* tangkai pendek yang rebah, sedikit menyerong */}
      <mesh position={[-0.3, 0.008, 0.04]} rotation={[0, 0.3, Math.PI / 2]} material={mats.stem}>
        <cylinderGeometry args={[0.015, 0.018, 0.58, 6]} />
      </mesh>
      <mesh position={[-0.44, 0.014, 0.12]} rotation={[Math.PI / 2, 0, 0.7]} scale={[0.13, 0.014, 0.06]} material={mats.stem}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>

      {/* kelopak: ramping dan banyak — itu yang membedakan daisy dari
          bunga matahari. Sedikit terangkat di ujung supaya tidak rata. */}
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const naik = 0.012 + (i % 2) * 0.006;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.15, 0.022 + naik, Math.sin(a) * 0.15]}
            rotation={[0, -a, 0.12]}
            scale={[0.155, 0.018, 0.045]}
            material={mats.petal}
          >
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        );
      })}

      <mesh position={[0, 0.038, 0]} scale={[1, 0.62, 1]} material={mats.core}>
        <sphereGeometry args={[0.075, 14, 10]} />
      </mesh>
    </group>
  );
}

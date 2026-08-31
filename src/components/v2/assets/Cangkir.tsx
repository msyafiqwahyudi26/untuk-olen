"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ CANGKIR ═══
 * Duduk di titik nol, y = 0 di dasar. Tinggi ± 0,34 satuan.
 *
 * Telinga cangkir justru TIDAK dirotasi. Torus lahir berdiri di bidang XY,
 * dan telinga cangkir memang berdiri — versi pertama merotasinya -π/2 seperti
 * bibir piring, jadi telinganya rebah mendatar seperti piring terbang kecil.
 * Aturannya sederhana: yang MELINGKARI benda direbahkan, yang MENEMPEL DI
 * SISI dibiarkan berdiri.
 */

export default function Cangkir({
  isi = true,
}: {
  isi?: boolean;
  /** bagian dari kontrak library; cangkir memang tidak bergerak */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      cup: new THREE.MeshToonMaterial({ color: "#FFFFFF", gradientMap: ramp, side: THREE.DoubleSide }),
      base: new THREE.MeshToonMaterial({ color: "#F2ECE0", gradientMap: ramp }),
      drink: new THREE.MeshToonMaterial({ color: "#C98A4B", gradientMap: ramp }),
      handle: new THREE.MeshToonMaterial({ color: "#FFFFFF", gradientMap: ramp }),
    }),
    [ramp]
  );

  return (
    <group>
      <mesh position={[0, 0.16, 0]} material={mats.cup}>
        <cylinderGeometry args={[0.19, 0.15, 0.32, 20, 1, true]} />
      </mesh>
      <mesh position={[0, 0.015, 0]} material={mats.base}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 20]} />
      </mesh>
      {isi && (
        <mesh position={[0, 0.24, 0]} material={mats.drink}>
          <cylinderGeometry args={[0.155, 0.155, 0.02, 20]} />
        </mesh>
      )}
      {/* telinga: berdiri, jadi tanpa rotasi sumbu X */}
      <mesh position={[0.19, 0.17, 0]} rotation={[0, 0, -0.4]} material={mats.handle}>
        <torusGeometry args={[0.085, 0.022, 8, 16, Math.PI * 1.3]} />
      </mesh>
    </group>
  );
}

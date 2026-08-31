"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ KERANJANG PIKNIK ═══
 * Duduk di titik nol, y = 0 di dasar. Tinggi ± 1,5 satuan, jari-jari 0,6.
 *
 * ── Jebakan torus ──
 * THREE.TorusGeometry lahir di bidang XY, artinya BERDIRI. Pita anyaman yang
 * melingkari keranjang harus direbahkan (-π/2 di sumbu X); gagangnya justru
 * TIDAK, karena gagang memang berdiri. Versi pertama tidak merotasi
 * satu pun, jadi pita-pitanya berdiri memotong badan keranjang.
 *
 * `radiusAtas` diekspor supaya scene bisa menghitung jarak aman ke benda
 * lain. Piring yang menembus keranjang kemarin terjadi karena tata letaknya
 * ditebak, bukan dihitung.
 */

export const KERANJANG_R = 0.62;
export const KERANJANG_T = 1.5;

/**
 * Tempat isi keranjang: tinggi permukaan barang di dalamnya, dan jari-jari
 * aman supaya isinya tidak menembus dinding.
 *
 * Dinding keranjang miring (0.58 di atas, 0.46 di bawah). Isi ditaruh di
 * ketinggian 0.34, tempat jari-jari dalamnya sekitar 0.51 — dikurangi lagi
 * jadi 0.34 supaya buah seukuran 0.16 tetap punya jarak ke dinding.
 */
export const ISI_Y = 0.34;
export const ISI_R = 0.34;

export default function Keranjang() {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      weave: new THREE.MeshToonMaterial({ color: "#C79552", gradientMap: ramp, side: THREE.DoubleSide }),
      band: new THREE.MeshToonMaterial({ color: "#A6763A", gradientMap: ramp }),
      rim: new THREE.MeshToonMaterial({ color: "#8E6430", gradientMap: ramp }),
      cloth: new THREE.MeshToonMaterial({ color: "#F6F0E4", gradientMap: ramp }),
    }),
    [ramp]
  );

  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={mats.weave}>
        <cylinderGeometry args={[0.58, 0.46, 0.6, 22, 1, true]} />
      </mesh>
      {/* dasar, supaya tidak tembus pandang dari atas */}
      <mesh position={[0, 0.02, 0]} material={mats.band}>
        <cylinderGeometry args={[0.46, 0.46, 0.04, 22]} />
      </mesh>

      {/* pita anyaman: melingkar, jadi direbahkan */}
      {[0.12, 0.3, 0.48].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.band}>
          <torusGeometry args={[0.53 + i * 0.02, 0.028, 8, 24]} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.rim}>
        <torusGeometry args={[0.58, 0.04, 8, 24]} />
      </mesh>

      {/* gagang: memang berdiri, jadi dibiarkan di bidang XY */}
      <mesh position={[0, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.rim}>
        <torusGeometry args={[0.5, 0.035, 8, 20, Math.PI]} />
      </mesh>

      {/* kain yang menjuntai keluar */}
      <mesh position={[0.24, 0.56, 0.14]} rotation={[0.5, 0.3, 0.2]} scale={[0.42, 0.06, 0.3]} material={mats.cloth}>
        <sphereGeometry args={[1, 12, 10]} />
      </mesh>
    </group>
  );
}

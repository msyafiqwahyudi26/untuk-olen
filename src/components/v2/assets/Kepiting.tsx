"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ KEPITING ═══
 * Berdiri di titik nol, y = 0 di ujung kaki. Lebar ± 1,1 satuan.
 * Menghadap +Z (kepiting berjalan menyamping, jadi arah hadapnya tegak lurus
 * arah jalan — itu justru yang bikin jalannya terbaca).
 *
 * Aset ini punya dua keadaan yang dikendalikan dari luar:
 *   `langkah`  — 0..1, seberapa cepat kakinya mengayun. 0 = berhenti.
 *   `melambai` — 0..1, capit kanan terangkat dan melambai.
 *
 * Scene yang memutuskan kapan berhenti dan melambai; aset cuma tahu caranya.
 */

const SHELL = "#E4573A";
const SHELL_DARK = "#C43C22";
const LEGS = [-0.62, -0.2, 0.22, 0.64];

/**
 * Kendali dari scene, DIBACA TIAP FRAME.
 *
 * Sengaja objek yang dimutasi, bukan prop biasa. Kalau lewat prop, nilainya
 * ikut siklus render React — sedangkan yang mengubahnya adalah useFrame di
 * scene, yang tidak me-render ulang apa pun. Akibatnya kepiting akan menerima
 * nilai dari render terakhir selamanya dan tidak pernah berhenti melambai.
 * Alternatifnya setState tiap frame, dan itu berarti React me-render 60 kali
 * per detik cuma untuk satu angka.
 */
export type KepitingKendali = { langkah: number; melambai: number };

export default function Kepiting({
  animate = true,
  kendali,
}: {
  animate?: boolean;
  kendali?: KepitingKendali;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      shell: new THREE.MeshToonMaterial({ color: SHELL, gradientMap: ramp }),
      dark: new THREE.MeshToonMaterial({ color: SHELL_DARK, gradientMap: ramp }),
      white: new THREE.MeshToonMaterial({ color: "#FFFFFF", gradientMap: ramp }),
      pupil: new THREE.MeshBasicMaterial({ color: "#2A140C" }),
    }),
    [ramp]
  );

  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const clawR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const phase = useRef(0);

  useFrame((_, dt) => {
    if (!animate) return;
    const t = performance.now() * 0.001;
    const langkah = kendali?.langkah ?? 1;
    const melambai = kendali?.melambai ?? 0;

    // Fase langkah maju sesuai kecepatan. Kalau dihitung dari waktu mutlak,
    // kakinya tetap mengayun waktu kepitingnya berhenti — dulu begitu.
    phase.current += dt * 5.2 * langkah;
    const p = phase.current;

    legRefs.current.forEach((l, i) => {
      if (!l) return;
      l.rotation.z = Math.sin(p + (i % 2 ? Math.PI : 0) + i * 0.4) * 0.34 * langkah;
    });

    if (body.current) {
      // badan ikut naik-turun sedikit tiap langkah; waktu diam, cuma bernapas
      body.current.position.y =
        0.34 + Math.sin(p * 2) * 0.02 * langkah + Math.sin(t * 1.6) * 0.008;
      body.current.rotation.z = Math.sin(p) * 0.06 * langkah;
    }

    if (clawR.current) {
      // capit terangkat lalu melambai; sudut angkatnya ikut `melambai`
      // supaya perpindahan diam→melambai tidak menyentak
      const w = melambai;
      clawR.current.rotation.z = -0.35 - w * 1.15;
      clawR.current.rotation.x = w * Math.sin(t * 7.5) * 0.5;
    }
  });

  return (
    <group ref={body} position={[0, 0.34, 0]} scale={0.42}>
      <mesh scale={[1.25, 0.72, 1]} material={mats.shell}>
        <sphereGeometry args={[1, 22, 16]} />
      </mesh>

      {[-0.34, 0.34].map((sx, i) => (
        <group key={i} position={[sx, 0.62, 0.42]}>
          <mesh position={[0, 0.16, 0]} material={mats.dark}>
            <cylinderGeometry args={[0.07, 0.08, 0.36, 8]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={mats.white}>
            <sphereGeometry args={[0.17, 14, 12]} />
          </mesh>
          <mesh position={[0, 0.42, 0.11]} material={mats.pupil}>
            <sphereGeometry args={[0.085, 10, 8]} />
          </mesh>
        </group>
      ))}

      {/* capit kiri: diam */}
      <group position={[-1.28, -0.08, 0.5]} rotation={[0, 0, 0.35]}>
        <mesh rotation={[0, 0, -0.6]} position={[-0.22, 0.1, 0]} material={mats.dark}>
          <cylinderGeometry args={[0.11, 0.13, 0.5, 8]} />
        </mesh>
        <mesh position={[-0.5, 0.34, 0]} scale={[0.9, 1.15, 0.75]} material={mats.shell}>
          <sphereGeometry args={[0.3, 14, 12]} />
        </mesh>
        <mesh position={[-0.66, 0.55, 0]} rotation={[0, 0, -0.5]} scale={[0.55, 1, 0.5]} material={mats.shell}>
          <sphereGeometry args={[0.24, 12, 10]} />
        </mesh>
      </group>

      {/* capit kanan: ini yang melambai */}
      <group ref={clawR} position={[1.28, -0.08, 0.5]} rotation={[0, 0, -0.35]}>
        <mesh rotation={[0, 0, 0.6]} position={[0.22, 0.1, 0]} material={mats.dark}>
          <cylinderGeometry args={[0.11, 0.13, 0.5, 8]} />
        </mesh>
        <mesh position={[0.5, 0.34, 0]} scale={[0.9, 1.15, 0.75]} material={mats.shell}>
          <sphereGeometry args={[0.3, 14, 12]} />
        </mesh>
        <mesh position={[0.66, 0.55, 0]} rotation={[0, 0, 0.5]} scale={[0.55, 1, 0.5]} material={mats.shell}>
          <sphereGeometry args={[0.24, 12, 10]} />
        </mesh>
      </group>

      {[-1, 1].map((side) =>
        LEGS.map((lz, i) => (
          <group
            key={`${side}-${i}`}
            ref={(el) => {
              legRefs.current[(side > 0 ? 0 : LEGS.length) + i] = el;
            }}
            position={[side * 1.05, -0.28, lz * 0.72]}
            rotation={[0, 0, side * 0.5]}
          >
            <mesh position={[side * 0.3, -0.1, 0]} rotation={[0, 0, side * 0.5]} material={mats.dark}>
              <cylinderGeometry args={[0.065, 0.055, 0.62, 6]} />
            </mesh>
            <mesh position={[side * 0.52, -0.5, 0]} rotation={[0, 0, side * -0.5]} material={mats.dark}>
              <cylinderGeometry args={[0.05, 0.035, 0.6, 6]} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ CAMAR ═══
 * Berpusat di titik nol, menghadap +X. Rentang sayap ± 6 satuan.
 *
 * SEDANG TIDAK DIPAKAI di layar pantai. Dicoba tiga kali di sana dan tetap
 * tidak terbaca sebagai burung: pada jarak z ≈ -80 badannya cuma belasan
 * piksel, dan yang tersisa cuma dua garis putih mengepak.
 *
 * Disimpan karena bentuknya sendiri sudah dekat — masalahnya jarak, bukan
 * model. Kalau nanti ada adegan dengan burung yang lebih dekat, aset ini
 * tinggal dipakai. Kalau dipakai lagi, taruh di z > -40.
 */

export default function Camar({ animate = true }: { animate?: boolean }) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      body: new THREE.MeshToonMaterial({ color: "#FFFFFF", gradientMap: ramp }),
      tail: new THREE.MeshToonMaterial({ color: "#E8EFF4", gradientMap: ramp }),
      wing: new THREE.MeshToonMaterial({ color: "#FCFDFE", gradientMap: ramp }),
      tip: new THREE.MeshToonMaterial({ color: "#5A7C92", gradientMap: ramp }),
      beak: new THREE.MeshToonMaterial({ color: "#F0A73C", gradientMap: ramp }),
      eye: new THREE.MeshBasicMaterial({ color: "#22384A" }),
    }),
    [ramp]
  );

  const wL = useRef<THREE.Group>(null);
  const wR = useRef<THREE.Group>(null);
  const grp = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!animate) return;
    const t = performance.now() * 0.001;
    const flap = Math.sin(t * 3.4);
    if (wL.current) wL.current.rotation.z = 0.22 + flap * 0.55;
    if (wR.current) wR.current.rotation.z = -0.22 - flap * 0.55;
    if (grp.current) grp.current.rotation.z = Math.sin(t * 0.45) * 0.2;
  });

  return (
    <group ref={grp}>
      <mesh scale={[1.9, 0.72, 0.72]} material={mats.body}>
        <sphereGeometry args={[1, 18, 14]} />
      </mesh>
      <mesh position={[1.55, 0.3, 0]} scale={0.52} material={mats.body}>
        <sphereGeometry args={[1, 14, 12]} />
      </mesh>
      <mesh position={[2.12, 0.24, 0]} rotation={[0, 0, -Math.PI / 2]} material={mats.beak}>
        <coneGeometry args={[0.14, 0.55, 8]} />
      </mesh>
      <mesh position={[1.78, 0.42, 0.24]} material={mats.eye}>
        <sphereGeometry args={[0.075, 8, 8]} />
      </mesh>
      <mesh position={[-1.6, 0.12, 0]} rotation={[0, 0, 0.25]} scale={[0.75, 0.1, 0.5]} material={mats.tail}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>

      {/* sayap berputar di pangkal, jadi mengepak sungguhan */}
      <group ref={wL} position={[0.15, 0.28, 0.35]}>
        <mesh position={[0, 0, 1.35]} scale={[0.75, 0.075, 1.5]} material={mats.wing}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <mesh position={[-0.35, 0, 2.6]} scale={[0.42, 0.06, 0.7]} material={mats.tip}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      </group>
      <group ref={wR} position={[0.15, 0.28, -0.35]}>
        <mesh position={[0, 0, -1.35]} scale={[0.75, 0.075, 1.5]} material={mats.wing}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <mesh position={[-0.35, 0, -2.6]} scale={[0.42, 0.06, 0.7]} material={mats.tip}>
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      </group>
    </group>
  );
}

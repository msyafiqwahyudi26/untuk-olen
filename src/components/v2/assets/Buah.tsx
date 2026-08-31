"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { taperedTube, toonRamp } from "./kit";

/**
 * ═══ BUAH ═══
 * Duduk di titik nol, y = 0 di dasar. Apel/jeruk ± 0,3 satuan (9 cm),
 * pisang ± 0,55 satuan panjang.
 *
 * Menggantikan piring di sisi kiri tikar. Piring di situ terus bersinggungan
 * dengan keranjang karena keduanya sama-sama lebar dan datar; buah jauh lebih
 * kecil, jadi tata letaknya punya ruang gerak. Yaya: "tambahkan saja kalau
 * piring kurang okey buah-buahan aja disana apel pisang jeruk".
 *
 * `jenis`: "apel" | "jeruk" | "pisang"
 */

export type JenisBuah = "apel" | "jeruk" | "pisang";

/** pisang: kurva melengkung, gemuk di tengah, meruncing di dua ujung */
function pisangGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.27, 0.03, 0),
    new THREE.Vector3(-0.14, 0.1, 0),
    new THREE.Vector3(0, 0.13, 0),
    new THREE.Vector3(0.14, 0.1, 0),
    new THREE.Vector3(0.27, 0.03, 0),
  ]);
  // jari-jari mengikuti setengah lingkaran: nol di ujung, penuh di tengah
  return taperedTube(curve, (u) => 0.018 + 0.072 * Math.sin(Math.PI * u) ** 0.7, undefined, 40, 12);
}

export default function Buah({
  jenis = "apel",
}: {
  jenis?: JenisBuah;
  /** bagian dari kontrak library; buah memang diam */
  animate?: boolean;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      apel: new THREE.MeshToonMaterial({ color: "#E0504B", gradientMap: ramp }),
      apelPucat: new THREE.MeshToonMaterial({ color: "#F0827A", gradientMap: ramp }),
      jeruk: new THREE.MeshToonMaterial({ color: "#F09030", gradientMap: ramp }),
      pisang: new THREE.MeshToonMaterial({ color: "#F2CE52", gradientMap: ramp }),
      ujung: new THREE.MeshToonMaterial({ color: "#7A6224", gradientMap: ramp }),
      tangkai: new THREE.MeshToonMaterial({ color: "#6B4A28", gradientMap: ramp }),
      daun: new THREE.MeshToonMaterial({ color: "#5C8F3E", gradientMap: ramp }),
    }),
    [ramp]
  );
  const pisang = useMemo(pisangGeometry, []);

  if (jenis === "pisang") {
    return (
      <group rotation={[0, 0.3, 0]}>
        <mesh geometry={pisang} material={mats.pisang} />
        {/* dua ujung yang menghitam — penanda kecil yang bikin terbaca pisang */}
        <mesh position={[-0.28, 0.03, 0]} scale={[1, 0.8, 0.8]} material={mats.ujung}>
          <sphereGeometry args={[0.026, 8, 6]} />
        </mesh>
        <mesh position={[0.28, 0.03, 0]} scale={[1.6, 0.8, 0.8]} material={mats.ujung}>
          <sphereGeometry args={[0.026, 8, 6]} />
        </mesh>
      </group>
    );
  }

  if (jenis === "jeruk") {
    return (
      <group>
        {/* sedikit gepeng di kutub, seperti jeruk sungguhan */}
        <mesh position={[0, 0.145, 0]} scale={[1, 0.88, 1]} material={mats.jeruk}>
          <sphereGeometry args={[0.155, 20, 16]} />
        </mesh>
        <mesh position={[0, 0.278, 0]} scale={[1, 0.5, 1]} material={mats.daun}>
          <sphereGeometry args={[0.03, 8, 6]} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      {/* apel: bola yang dicekungkan di atas dan bawah */}
      <mesh position={[0, 0.15, 0]} scale={[1, 0.94, 1]} material={mats.apel}>
        <sphereGeometry args={[0.155, 20, 16]} />
      </mesh>
      {/* semburat terang di sisi yang kena cahaya */}
      <mesh position={[-0.05, 0.17, 0.08]} scale={[0.5, 0.6, 0.35]} material={mats.apelPucat}>
        <sphereGeometry args={[0.14, 12, 10]} />
      </mesh>
      <mesh position={[0.01, 0.3, 0]} rotation={[0, 0, -0.25]} material={mats.tangkai}>
        <cylinderGeometry args={[0.011, 0.014, 0.09, 6]} />
      </mesh>
      <mesh position={[0.07, 0.32, 0.02]} rotation={[0.3, 0.4, 0.6]} scale={[0.09, 0.014, 0.05]} material={mats.daun}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
    </group>
  );
}

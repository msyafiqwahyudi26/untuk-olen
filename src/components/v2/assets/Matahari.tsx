"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ═══ MATAHARI ═══
 * Berpusat di titik nol. Jari-jari inti 1 satuan; halo sampai ± 3.
 *
 * Versi lama tiga cakram datar (circleGeometry) yang selalu menghadap kamera.
 * Di tengah benda-benda bervolume, satu-satunya benda gepeng langsung
 * ketahuan — keluhan "2D gepeng sendiri".
 *
 * Tapi matahari juga tidak boleh jadi bola ber-shading biasa: bola yang
 * disinari punya sisi gelap, dan matahari tidak punya sisi gelap. Jadi
 * dipakai bahan tanpa pencahayaan, dengan gradasi digambar sendiri di
 * shader berdasarkan sudut permukaan terhadap kamera: paling terang di
 * tengah, menghangat lalu memudar ke tepi. Volumenya terasa, sumber
 * cahayanya tetap dirinya sendiri.
 */

const coreVert = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

/* Ingat: JANGAN pakai nama variabel yang jadi kata cadangan GLSL
   (patch, sample, filter, input, output, common, half, ...). Pernah bikin
   shader pasir gagal kompilasi tanpa satu pun pesan error. */
const coreFrag = /* glsl */ `
uniform vec3 uInti;
uniform vec3 uTepi;
varying vec3 vN;
varying vec3 vV;
void main(){
  // 1 di tengah cakram, 0 di siluet tepi
  float hadap = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
  vec3 col = mix(uTepi, uInti, pow(hadap, 0.55));
  // pita tipis yang lebih hangat sedikit sebelum tepi — memberi kesan bulat
  col = mix(col, uTepi * 1.04, smoothstep(0.45, 0.08, hadap) * 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;

const haloVert = coreVert;

const haloFrag = /* glsl */ `
uniform vec3  uWarna;
uniform float uKuat;
varying vec3 vN;
varying vec3 vV;
void main(){
  float hadap = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
  // paling pekat di tepi, hilang di tengah: cangkang cahaya, bukan bola
  float a = pow(1.0 - hadap, 2.2) * uKuat;
  gl_FragColor = vec4(uWarna, a);
}
`;

export default function Matahari({
  animate = true,
  inti = "#FFFDF2",
  tepi = "#FFE9A8",
}: {
  animate?: boolean;
  /** warna berubah menurut waktu — lihat waktu.ts */
  inti?: string;
  tepi?: string;
}) {
  const grp = useRef<THREE.Group>(null);

  const coreMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVert,
        fragmentShader: coreFrag,
        uniforms: {
          uInti: { value: new THREE.Color(inti) },
          uTepi: { value: new THREE.Color(tepi) },
        },
      }),
    // sengaja tanpa dependensi: materialnya dibuat sekali, warnanya
    // digeser halus di useFrame di bawah
    []
  );

  const halo = (warna: string, kuat: number) =>
    new THREE.ShaderMaterial({
      vertexShader: haloVert,
      fragmentShader: haloFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: { uWarna: { value: new THREE.Color(warna) }, uKuat: { value: kuat } },
    });

  const haloDalam = useMemo(() => halo("#FFEFB8", 0.55), []);
  const haloLuar = useMemo(() => halo("#FFE38A", 0.3), []);

  // Warna bergeser pelan ke palet waktu yang baru, bukan melompat. Kalau
  // melompat, peralihan siang → sore terlihat seperti gambar yang ditukar.
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 0.7);
    (coreMat.uniforms.uInti.value as THREE.Color).lerp(new THREE.Color(inti), k);
    (coreMat.uniforms.uTepi.value as THREE.Color).lerp(new THREE.Color(tepi), k);
    (haloDalam.uniforms.uWarna.value as THREE.Color).lerp(new THREE.Color(tepi), k);
    (haloLuar.uniforms.uWarna.value as THREE.Color).lerp(new THREE.Color(tepi), k);
  });

  useFrame(() => {
    if (!animate || !grp.current) return;
    // denyut sangat pelan — nyaris tidak disadari, tapi bikin tidak mati
    const t = performance.now() * 0.001;
    grp.current.scale.setScalar(1 + Math.sin(t * 0.22) * 0.012);
  });

  return (
    <group ref={grp}>
      <mesh material={coreMat}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>
      <mesh material={haloDalam} renderOrder={-2}>
        <sphereGeometry args={[1.75, 32, 24]} />
      </mesh>
      <mesh material={haloLuar} renderOrder={-3}>
        <sphereGeometry args={[3, 32, 24]} />
      </mesh>
    </group>
  );
}

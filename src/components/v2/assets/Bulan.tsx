"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ═══ BULAN ═══
 * Berpusat di titik nol. Jari-jari 1 satuan; halo sampai ± 2,4.
 *
 * Bukan matahari yang diwarnai putih. Dua benda ini berbeda secara mendasar:
 *
 *   Matahari memancarkan cahaya sendiri — permukaannya rata terang, tanpa
 *   sisi gelap, dan silaunya besar.
 *
 *   Bulan MEMANTULKAN cahaya. Ia punya sisi yang terang dan sisi yang redup,
 *   punya kawah, dan halonya tipis. Kalau bulan dibuat rata terang seperti
 *   matahari, yang muncul di langit malam adalah lubang putih, bukan benda.
 *
 * Jadi shader-nya berbeda: ada arah cahaya, ada penggelapan di sisi yang
 * membelakanginya, dan ada bercak kawah dari derau bertingkat.
 */

const bulanVert = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* Ingat: JANGAN pakai kata cadangan GLSL sebagai nama variabel
   (patch, sample, filter, input, output, common, half, ...). */
const bulanFrag = /* glsl */ `
uniform vec3  uTerang;
uniform vec3  uRedup;
uniform vec3  uArah;
varying vec3 vN;
varying vec3 vP;

float hash(vec3 p){
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}
float derau(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  return n;
}

void main(){
  // ── sisi terang dan sisi redup ──
  // Ini yang membedakan bulan dari matahari: ada arah datangnya cahaya.
  float sinar = clamp(dot(normalize(vN), normalize(uArah)) * 0.5 + 0.5, 0.0, 1.0);
  sinar = smoothstep(0.12, 0.92, sinar);
  vec3 col = mix(uRedup, uTerang, sinar);

  // ── kawah ──
  // Dua tingkat: bercak besar yang samar, dan bintik kecil yang lebih tegas.
  float besar = derau(vP * 3.4);
  float kecil = derau(vP * 11.0);
  col *= 0.94 + besar * 0.12;
  col = mix(col, col * 0.86, smoothstep(0.62, 0.82, kecil) * 0.7);

  gl_FragColor = vec4(col, 1.0);
}
`;

const haloFrag = /* glsl */ `
uniform vec3  uWarna;
uniform float uKuat;
varying vec3 vN;
varying vec3 vP;
void main(){
  // cangkang cahaya tipis: paling pekat di tepi, hilang di tengah
  float hadap = clamp(abs(normalize(vN).z), 0.0, 1.0);
  gl_FragColor = vec4(uWarna, pow(1.0 - hadap, 2.6) * uKuat);
}
`;

export default function Bulan({
  animate = true,
  terang = "#F6F8FF",
  redup = "#9FB0CE",
}: {
  animate?: boolean;
  terang?: string;
  redup?: string;
}) {
  const grp = useRef<THREE.Group>(null);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bulanVert,
        fragmentShader: bulanFrag,
        uniforms: {
          uTerang: { value: new THREE.Color(terang) },
          uRedup: { value: new THREE.Color(redup) },
          // cahaya datang dari kiri-atas, arah yang sama dengan lampu malam
          uArah: { value: new THREE.Vector3(-0.7, 0.55, 0.45).normalize() },
        },
      }),
    []
  );

  const halo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bulanVert,
        fragmentShader: haloFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {
          uWarna: { value: new THREE.Color("#BFD2EE") },
          uKuat: { value: 0.34 },
        },
      }),
    []
  );

  useFrame((_, dt) => {
    const k = Math.min(1, dt * 0.7);
    (mat.uniforms.uTerang.value as THREE.Color).lerp(new THREE.Color(terang), k);
    (mat.uniforms.uRedup.value as THREE.Color).lerp(new THREE.Color(redup), k);
    if (!animate || !grp.current) return;
    // berputar sangat pelan — kawahnya bergeser tanpa disadari
    grp.current.rotation.y += dt * 0.006;
  });

  return (
    <group ref={grp}>
      <mesh material={mat}>
        <sphereGeometry args={[1, 48, 36]} />
      </mesh>
      <mesh material={halo} renderOrder={-2}>
        <sphereGeometry args={[2.4, 32, 24]} />
      </mesh>
    </group>
  );
}

"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * ═══════════════════════════════════════════════════════════════
 *  KIT — perkakas bersama untuk semua aset 3D
 * ═══════════════════════════════════════════════════════════════
 *
 * Kenapa folder assets/ ini ada.
 *
 * Sebelumnya tiap makhluk dan tiap properti ditulis langsung di dalam berkas
 * scene, lengkap dengan posisinya di dunia. Akibatnya tiga hal:
 *
 *   1. Tidak ada cara melihat satu model sendirian. Kalau paus terlihat aneh,
 *      tidak jelas apakah bentuknya yang salah, sudut kameranya, atau air
 *      yang memotongnya.
 *   2. Memperbaiki satu benda berarti mengedit berkas yang juga berisi lima
 *      benda lain. Perbaikan yang satu merusak yang lain.
 *   3. Tidak ada yang bisa dipakai ulang di layar berikutnya.
 *
 * Aturan folder ini:
 *
 *   • Satu berkas satu aset.
 *   • Model DIGAMBAR DI TITIK NOL, menghadap +X, berdiri di atas y = 0.
 *     Tidak ada satu pun yang tahu soal garis air, tinggi pasir, atau letak
 *     kamera. Yang menempatkan adalah scene.
 *   • Ukurannya nyata: 1 satuan = 30 cm. Flamingo 1,2 m jadi kira-kira
 *     4 satuan. Ini yang membuat benda-benda terlihat sepadan tanpa ditebak.
 *   • Animasi yang MELEKAT pada bentuknya (sayap mengepak, kaki melangkah)
 *     tinggal di dalam aset. Animasi yang soal PERJALANAN (berenang dari kiri
 *     ke kanan, menyelam) tinggal di scene.
 *
 * Semua aset bisa dilihat satu per satu di /aset.
 */

/** 1 satuan dunia = 30 cm. Dipakai untuk menerjemahkan ukuran nyata. */
export const METER = 1 / 0.3;

/**
 * Tangga warna 3 tingkat. Inilah yang membuat bayangan berundak seperti
 * ilustrasi, bukan bergradasi halus seperti render realistis.
 *
 * Dibuat sekali sebagai modul, bukan lewat hook di tiap komponen: dulu tiap
 * makhluk memanggil useToonRamp sendiri, jadi ada belasan DataTexture identik
 * di memori dan tiap satu memaksa program shader-nya sendiri.
 */
let ramp3: THREE.DataTexture | null = null;
export function toonRamp() {
  if (!ramp3) {
    const steps = 3;
    const data = new Uint8Array(steps);
    for (let i = 0; i < steps; i++) data[i] = Math.round(((i + 0.6) / steps) * 255);
    ramp3 = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
    ramp3.minFilter = THREE.NearestFilter;
    ramp3.magFilter = THREE.NearestFilter;
    ramp3.generateMipmaps = false;
    ramp3.needsUpdate = true;
  }
  return ramp3;
}

/** Bahan kartun standar. Semua aset memakai ini supaya sekeluarga. */
export function useToon(color: string, opts?: THREE.MeshToonMaterialParameters) {
  return useMemo(
    () => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp(), ...opts }),
    [color, opts]
  );
}

/**
 * Tabung yang MERUNCING sepanjang kurva.
 *
 * TubeGeometry bawaan berjari-jari tetap, dan apa pun yang berjari-jari tetap
 * terbaca seperti selang: leher flamingo, kaki burung, batang bunga. Titik
 * TubeGeometry tersusun rapi per cincin ((tubular+1) cincin × (radial+1)
 * titik), jadi tiap cincin tinggal ditarik ke porosnya.
 *
 * `radius` boleh angka (meruncing lurus) atau fungsi 0..1 → jari-jari.
 */
export function taperedTube(
  curve: THREE.Curve<THREE.Vector3>,
  radius: number | ((u: number) => number),
  r1?: number,
  segments = 56,
  radial = 12
) {
  const rOf =
    typeof radius === "function"
      ? radius
      : (u: number) => radius + ((r1 ?? radius) - radius) * u;

  const g = new THREE.TubeGeometry(curve, segments, 1, radial, false);
  const p = g.attributes.position as THREE.BufferAttribute;
  const c = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const r = rOf(i / segments);
    curve.getPointAt(i / segments, c);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      p.setXYZ(
        k,
        c.x + (p.getX(k) - c.x) * r,
        c.y + (p.getY(k) - c.y) * r,
        c.z + (p.getZ(k) - c.z) * r
      );
    }
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Badan yang diputar dari satu garis profil.
 *
 * Profil ditulis sebagai [jari-jari, panjang]. Hasilnya membentang di sumbu
 * +X, dengan panjang 0 di ujung ekor. Kalau jari-jari di kedua ujungnya nol,
 * permukaannya tertutup penuh — tidak ada lubang yang bikin benda terlihat
 * bolong dari dalam.
 */
export function lathedBody(profile: [number, number][], segments = 32) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0), y));
  const g = new THREE.LatheGeometry(pts, segments);
  // rotateZ(-90°) memetakan y → +x
  g.rotateZ(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * Sirip / daun / kelopak: bentuk pipih ber-bevel yang tepinya membulat.
 *
 * Peringatan yang mahal dipelajari: bevelSize memakan bentuk dari SETIAP
 * sisi. Kalau bagian tersempit dari bentuknya lebih kecil daripada dua kali
 * bevelSize, bagian itu tertutup rapat. Bintang laut versi pertama hilang
 * lembah antar lengannya persis karena ini, dan yang keluar gumpalan.
 */
export function bladeGeometry(
  shape: THREE.Shape,
  depth = 0.12,
  bevel = 0.05,
  segments = 12
) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: segments,
  });
  g.center();
  return g;
}

/** Bayangan kontak: cakram gelap tipis. Tanpa ini setiap benda melayang. */
export function Contact({ r, o = 0.16, y = 0.012 }: { r: number; o?: number; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={1}>
      <circleGeometry args={[r, 28]} />
      <meshBasicMaterial color="#8A6B3E" transparent opacity={o} depthWrite={false} />
    </mesh>
  );
}

/**
 * ═══ KATA CADANGAN GLSL ═══
 * Kalau menulis shader di proyek ini, jangan pernah memakai nama-nama ini
 * sebagai variabel: patch, sample, filter, input, output, common, resource,
 * active, partition, this, packed, long, short, double, half, fixed.
 * Pernah kejadian: variabel bernama `patch` membuat shader pasir gagal
 * dikompilasi. Tidak ada error yang muncul di console — draw call-nya tetap
 * terhitung, pasirnya cuma tidak pernah tergambar. Cara memastikan:
 *   renderer.properties.get(material).currentProgram → getShaderInfoLog()
 */

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp, taperedTube } from "./kit";

/**
 * ═══ UBUR-UBUR ═══
 * Titik nol di ujung tentakel, y = 0. Payungnya di atas, tinggi ± 4,4 satuan
 * (± 1,3 m termasuk juntaian). Menghadap +X — meski ia simetris memutar, jadi
 * arah hadap tidak berarti apa-apa selain menjaga kontrak library.
 *
 *
 * ── DUA HAL YANG MEMBUATNYA HIDUP ──
 *
 * **1. Denyutnya tidak simetris.**
 *
 * Payung ubur-ubur MENGATUP cepat lalu MENGEMBANG pelan. Perbandingannya
 * kira-kira 3 : 7. Kalau dipakai sinus biasa — mengatup dan mengembang sama
 * cepat — yang terbaca adalah benda yang BERNAPAS, bukan berenang. Itu
 * perbedaan yang halus sekali di diam dan langsung ketahuan begitu bergerak.
 *
 * **2. Tentakelnya tertinggal.**
 *
 * Tentakel tidak ikut denyut payung pada saat yang sama; ia menyusul
 * belakangan, karena air harus mendorongnya dulu. Jeda itulah seluruh
 * ilusinya. Tentakel yang berayun sefase dengan payung terlihat seperti rok
 * yang dijahit ke badan.
 *
 * Keduanya dihitung dari SATU fungsi fase, dipanggil dua kali dengan
 * pergeseran waktu. Ini aturan proyek yang sama seperti kemiringan paus:
 * dua besaran yang terikat secara fisik tidak boleh dianimasikan
 * sendiri-sendiri, karena begitu yang satu disetel, yang lain melenceng.
 *
 *
 * ── SOAL PENDAR ──
 *
 * Bahan payung `emissive`, dan itu DISENGAJA — kebalikan dari kasus awan.
 * Awan yang emissive salah karena awan tidak memancarkan cahaya sendiri; ia
 * harus ikut gelap waktu matahari turun. Ubur-ubur memang memancarkan cahaya
 * sendiri, dan justru harus TETAP menyala waktu air di sekitarnya menggelap.
 * Itu satu-satunya alasan ia ada di bagian terdalam cerita ini.
 *
 * Dinilai di /aset dengan ruang `laut`. Di ruang terang pendar tidak bisa
 * dinilai sama sekali — tidak ada gelap untuk dikalahkan.
 */

/** tinggi rim payung dari ujung tentakel */
const RIM_Y = 3.5;
/** satu putaran denyut, detik */
const PERIODE = 3.4;
/** bagian dari periode yang dipakai untuk MENGATUP; sisanya mengembang */
const ATUP = 0.3;
/** seberapa jauh tentakel tertinggal, dalam bagian periode */
const JEDA_TENTAKEL = 0.18;

/**
 * Fase denyut, 0 = payung mengembang penuh, 1 = mengatup penuh.
 *
 * Turunannya nol di kedua sambungan (sin' di π/2 dan cos' di 0 sama-sama
 * nol), jadi peralihannya mulus tanpa perlu dihaluskan lagi.
 */
function denyut(f: number) {
  const u = ((f % 1) + 1) % 1;
  return u < ATUP
    ? Math.sin((u / ATUP) * Math.PI * 0.5)
    : Math.cos(((u - ATUP) / (1 - ATUP)) * Math.PI * 0.5);
}

/** garis payung: [jari-jari, tinggi dari rim] */
const PAYUNG: [number, number][] = [
  [0.0, 0.92],
  [0.22, 0.9],
  [0.42, 0.84],
  [0.58, 0.73],
  [0.7, 0.58],
  [0.79, 0.4],
  [0.845, 0.22],
  [0.86, 0.08],
  [0.845, 0.0],
  // bibir melengkung masuk ke dalam. Tanpa ini payungnya berhenti seperti
  // mangkuk terbalik dan tepinya terlihat dipotong.
  [0.78, -0.06],
];

export default function UburUbur({
  animate = true,
  warna = "#EAE0F5",
  pendar = "#7FD6F2",
}: {
  animate?: boolean;
  warna?: string;
  pendar?: string;
}) {
  const ramp = toonRamp();

  const mats = useMemo(
    () => ({
      payung: new THREE.MeshToonMaterial({
        color: warna,
        gradientMap: ramp,
        emissive: new THREE.Color(pendar),
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
        // Tanpa ini tentakel yang ada DI BELAKANG payung ikut terpotong oleh
        // buffer kedalaman, dan badan tembus cahaya jadi tidak ada gunanya.
        depthWrite: false,
      }),
      inti: new THREE.MeshToonMaterial({
        color: "#FFFFFF",
        gradientMap: ramp,
        emissive: new THREE.Color(pendar),
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.64,
        depthWrite: false,
      }),
      tanda: new THREE.MeshToonMaterial({
        color: "#F6C9E4",
        gradientMap: ramp,
        emissive: new THREE.Color("#E88FC4"),
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
      juntai: new THREE.MeshToonMaterial({
        color: "#F5EAF8",
        gradientMap: ramp,
        emissive: new THREE.Color(pendar),
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    }),
    [ramp, warna, pendar]
  );

  const payungGeo = useMemo(() => {
    const pts = PAYUNG.map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 40);
    g.computeVertexNormals();
    return g;
  }, []);

  /**
   * Sebelas tentakel panjang. Bentuknya dibuat SEKALI, tidak digambar ulang
   * tiap frame — yang berubah tiap frame cuma rotasi pangkalnya. Membangun
   * ulang sebelas TubeGeometry enam puluh kali sedetik akan menghabiskan
   * anggaran gambar seluruh scene demi gerakan yang toh tidak terlihat lebih
   * baik daripada ayunan pangkal.
   */
  const tentakel = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2;
      // Tiap tentakel dibengkokkan sedikit berbeda. Kalau semuanya sama,
      // ubur-uburnya terbaca sebagai benda cetakan, bukan makhluk.
      const s = Math.sin(i * 2.7) * 0.5 + Math.cos(i * 1.3) * 0.5;
      const panjang = 3.1 + s * 0.42;
      const kurva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.1 + s * 0.06, -panjang * 0.26, 0.05 * s),
        new THREE.Vector3(-0.06 + s * 0.1, -panjang * 0.52, -0.08 * s),
        new THREE.Vector3(0.13 - s * 0.08, -panjang * 0.78, 0.06 * s),
        new THREE.Vector3(-0.02 + s * 0.05, -panjang, 0),
      ]);
      return {
        a,
        s,
        geo: taperedTube(kurva, (u) => 0.045 * (1 - u) + 0.011 * u, undefined, 26, 6),
      };
    });
  }, []);

  /**
   * Rumbai di tepi payung: puluhan tentakel sangat pendek dan sangat halus.
   *
   * Ubur-ubur sungguhan punya ratusan. Tanpa rumbai, tepi payung berakhir
   * sebagai garis bersih dan seluruh makhluknya terbaca seperti benda cetakan
   * — masalah yang sama dengan pasir tanpa kerang di atasnya: tidak ada apa
   * pun yang memberi tahu mata bahwa ini permukaan hidup.
   *
   * Dibuat satu geometri, dipakai ulang 30 kali. Tiga puluh TubeGeometry
   * terpisah untuk bentuk yang identik cuma membuang memori.
   */
  const rumbaiGeo = useMemo(() => {
    const kurva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.03, -0.2, 0),
      new THREE.Vector3(-0.02, -0.4, 0),
      new THREE.Vector3(0.01, -0.56, 0),
    ]);
    return taperedTube(kurva, (u) => 0.017 * (1 - u * 0.85), undefined, 8, 4);
  }, []);

  /** empat lengan mulut: lebih pendek, lebih lebar, lebih berkerut */
  const lengan = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const kurva = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.08, -0.5, 0.06),
        new THREE.Vector3(-0.1, -1.0, -0.05),
        new THREE.Vector3(0.06, -1.5, 0.04),
        new THREE.Vector3(-0.03, -1.9, 0),
      ]);
      return {
        a,
        geo: taperedTube(kurva, (u) => 0.15 * (1 - u * 0.92), undefined, 22, 8),
      };
    });
  }, []);

  const payungRef = useRef<THREE.Group>(null);
  const juntaiRef = useRef<THREE.Group>(null);
  const naikRef = useRef<THREE.Group>(null);
  const jam = useRef(0);

  useFrame((_, dt) => {
    if (!animate) return;
    jam.current += dt;
    const f = jam.current / PERIODE;

    const d = denyut(f);
    const dLambat = denyut(f - JEDA_TENTAKEL);

    // Mengatup = lebih ramping dan lebih jangkung. Volumenya kira-kira tetap,
    // dan itu yang membuatnya terbaca sebagai air yang didorong keluar.
    if (payungRef.current) {
      payungRef.current.scale.set(1 - 0.17 * d, 1 + 0.24 * d, 1 - 0.17 * d);
    }

    // Tentakel memakai fase yang TERTINGGAL, bukan fase payung.
    if (juntaiRef.current) {
      juntaiRef.current.children.forEach((t, i) => {
        const s = Math.sin(i * 2.7) * 0.5 + Math.cos(i * 1.3) * 0.5;
        // mengatup mendorong tentakel merapat; mengembang melebarkannya lagi
        t.rotation.z = -0.26 * dLambat + Math.sin(jam.current * 0.6 + i) * 0.045;
        t.rotation.x = Math.sin(jam.current * 0.45 + s * 3) * 0.05;
      });
    }

    /**
     * Naik-turun kecil, terikat pada denyut yang sama.
     *
     * PERJALANAN sungguhan — berenang dari satu kedalaman ke kedalaman lain —
     * bukan urusan berkas ini; itu tugas scene, sesuai kontrak library. Yang
     * ada di sini cuma dorongan sesaat yang memang lahir dari denyutnya
     * sendiri. Tanpa itu ia terbaca seperti digantung di tali.
     */
    if (naikRef.current) naikRef.current.position.y = d * 0.12;
  });

  return (
    <group ref={naikRef}>
      <group position={[0, RIM_Y, 0]}>
        <group ref={payungRef}>
          <mesh geometry={payungGeo} material={mats.payung} />

          {/*
            Perut.

            Dulu di sini ada SALINAN payung yang diperkecil 0,82, dengan
            maksud memberi ketebalan pada badan tembus cahaya. Yang terjadi:
            salinan itu juga terbuka di bawah, dan tepi terbukanya terlihat
            dari luar sebagai satu garis mendatar tajam yang memotong payung —
            terbaca seperti tutup panci, bukan seperti isi.

            Bentuk yang tidak punya tepi terbuka tidak bisa menimbulkan garis
            itu. Jadi sekarang gumpalan bulat, dan ketebalannya datang dari
            tumpang tindih dua permukaan lengkung, bukan dari salinan.
          */}
          <mesh position={[0, 0.34, 0]} scale={[1, 0.66, 1]} material={mats.inti}>
            <sphereGeometry args={[0.34, 18, 14]} />
          </mesh>

          {/*
            Empat tapal kuda di dalam payung.
            Ini satu-satunya detail yang membuat bentuk ini terbaca sebagai
            UBUR-UBUR dan bukan payung atau lampu gantung — sama seperti senyum
            pada paus. Karena itu ia harus TERLIHAT: percobaan pertama dibuat
            kecil dan pucat, dan di balik payung yang tembus cahaya ia hampir
            hilang — detail penanda yang tidak terbaca sama saja dengan tidak
            ada.

            Torus lahir berdiri di bidang XY; yang MELINGKARI direbahkan dengan
            -π/2. Lihat catatan di AGENTS.md.
          */}
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              material={mats.tanda}
              rotation={[-Math.PI / 2, 0, (i / 4) * Math.PI * 2]}
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.3,
                0.22,
                Math.sin((i / 4) * Math.PI * 2) * 0.3,
              ]}
            >
              <torusGeometry args={[0.29, 0.075, 8, 24, Math.PI * 1.3]} />
            </mesh>
          ))}
        </group>

        {/* lengan mulut — menggantung dari tengah, bukan dari tepi */}
        {lengan.map((l, i) => (
          <mesh
            key={i}
            geometry={l.geo}
            material={mats.juntai}
            position={[Math.cos(l.a) * 0.12, -0.04, Math.sin(l.a) * 0.12]}
            rotation={[0, -l.a, 0]}
          />
        ))}

        {/* rumbai tepi */}
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={rumbaiGeo}
              material={mats.juntai}
              position={[Math.cos(a) * 0.83, -0.04, Math.sin(a) * 0.83]}
              rotation={[0, -a, Math.sin(i * 1.7) * 0.16]}
            />
          );
        })}

        {/* tentakel — menggantung dari TEPI payung */}
        <group ref={juntaiRef}>
          {tentakel.map((t, i) => (
            <group
              key={i}
              position={[Math.cos(t.a) * 0.8, -0.05, Math.sin(t.a) * 0.8]}
              rotation={[0, -t.a, 0]}
            >
              <mesh geometry={t.geo} material={mats.juntai} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { taperedTube, toonRamp } from "./kit";

/**
 * ═══ FLAMINGO ═══
 * Berdiri di titik nol, menghadap +X, kaki menyentuh y = 0.
 * Tinggi ± 4 satuan (1,2 m pada skala 1 satuan = 30 cm).
 *
 * ── Anatomi yang dua versi sebelumnya salah ──
 *
 * 1. SENDI KAKI. Yang terlihat menonjol di tengah kaki burung itu PERGELANGAN
 *    (intertarsal), bukan lutut, dan menekuk KE BELAKANG. Lututnya sendiri
 *    tersembunyi di dalam badan. Versi lalu memasang satu silinder lurus tanpa
 *    sendi sama sekali — itu sebabnya terbaca sebagai tongkat, bukan kaki.
 *
 * 2. JUMLAH KAKI. Versi lalu cuma punya satu kaki menapak, satunya terlipat.
 *    Flamingo memang sering berdiri satu kaki, tapi di layar hasilnya seperti
 *    kakinya hilang. Sekarang dua-duanya menapak, sedikit beda maju-mundur.
 *
 * 3. PARUH. Ini penanda paling khas dan yang paling salah kemarin. Paruh
 *    flamingo tebal di pangkal lalu MEMBELOK TAJAM KE BAWAH di tengah, dan
 *    sepertiga ujungnya hitam. Kerucut kecil yang ditempel menyerong tidak
 *    pernah bisa membacanya. Sekarang dibuat dari kurva meruncing.
 *
 * 4. LEHER. Bukan busur tunggal, melainkan S: naik agak ke belakang,
 *    membelok ke depan di puncak, lalu kepalanya menunduk.
 */

const PINK = "#F2879F";
const PINK_PALE = "#FBC3D2";
const PINK_DEEP = "#E15D82";
const LEG = "#E8617F";
const BLACK = "#2E2C36";
const BEAK_PALE = "#F7DFD0";

/** dari pangkal leher; sumbu +X = arah hadap */
function neckCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.06, 0.44, 0),
    new THREE.Vector3(-0.03, 0.88, 0),
    new THREE.Vector3(0.13, 1.24, 0),
    new THREE.Vector3(0.37, 1.5, 0),
    new THREE.Vector3(0.6, 1.57, 0),
    new THREE.Vector3(0.74, 1.48, 0),
  ]);
}

/**
 * Paruh: lurus sebentar, lalu membelok tajam ke bawah.
 *
 * Dibuat dari SATU kurva yang dipotong dua — pangkal pucat dan ujung hitam —
 * bukan tabung ditambah kerucut yang ditempel. Kerucut tempelan harus
 * ditebak arahnya, dan tebakan pertama meleset 100°: ujungnya menunjuk ke
 * atas-depan padahal seharusnya ke bawah-depan. Dengan memotong kurva yang
 * sama, arah ujungnya otomatis benar.
 */
const BEAK_PTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.17, -0.012, 0),
  new THREE.Vector3(0.31, -0.07, 0),
  new THREE.Vector3(0.41, -0.21, 0),
  new THREE.Vector3(0.46, -0.38, 0),
];

/** potongan kurva paruh: 0..1 dari seluruh panjangnya */
function beakPart(a: number, b: number) {
  const full = new THREE.CatmullRomCurve3(BEAK_PTS);
  const n = 14;
  const pts = Array.from({ length: n + 1 }, (_, i) =>
    full.getPointAt(a + ((b - a) * i) / n)
  );
  return new THREE.CatmullRomCurve3(pts);
}

/** satu kaki: telapak → tulang kering → pergelangan → paha bawah */
function Leg({ x, z, mat, matDark }: { x: number; z: number; mat: THREE.Material; matDark: THREE.Material }) {
  const shin = useMemo(
    () =>
      taperedTube(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.07, 0.02, 0),
          new THREE.Vector3(0.02, 0.5, 0),
          new THREE.Vector3(-0.05, 1.02, 0),
        ]),
        0.075,
        0.058,
        20,
        8
      ),
    []
  );
  const thigh = useMemo(
    () =>
      taperedTube(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.05, 1.02, 0),
          new THREE.Vector3(-0.01, 1.55, 0),
          new THREE.Vector3(0.05, 2.06, 0),
        ]),
        0.062,
        0.1,
        20,
        8
      ),
    []
  );

  return (
    <group position={[x, 0, z]}>
      <mesh geometry={shin} material={mat} />
      <mesh geometry={thigh} material={mat} />
      {/* pergelangan yang menonjol ke belakang */}
      <mesh position={[-0.05, 1.02, 0]} scale={[0.9, 1.15, 0.9]} material={mat}>
        <sphereGeometry args={[0.082, 12, 10]} />
      </mesh>
      {/* telapak: tiga jari berselaput menghadap depan */}
      <group position={[0.07, 0.018, 0]}>
        <mesh scale={[1.5, 0.28, 1.05]} position={[0.05, 0, 0]} material={matDark}>
          <sphereGeometry args={[0.12, 12, 10]} />
        </mesh>
        {[-0.075, 0, 0.075].map((tz, i) => (
          <mesh key={i} position={[0.16, 0, tz]} scale={[1.6, 0.22, 0.42]} material={matDark}>
            <sphereGeometry args={[0.07, 8, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Flamingo({ animate = true }: { animate?: boolean }) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      body: new THREE.MeshToonMaterial({ color: PINK, gradientMap: ramp }),
      pale: new THREE.MeshToonMaterial({ color: PINK_PALE, gradientMap: ramp }),
      deep: new THREE.MeshToonMaterial({ color: PINK_DEEP, gradientMap: ramp }),
      leg: new THREE.MeshToonMaterial({ color: LEG, gradientMap: ramp }),
      legDark: new THREE.MeshToonMaterial({ color: PINK_DEEP, gradientMap: ramp }),
      black: new THREE.MeshToonMaterial({ color: BLACK, gradientMap: ramp }),
      beak: new THREE.MeshToonMaterial({ color: BEAK_PALE, gradientMap: ramp }),
    }),
    [ramp]
  );

  const neck = useMemo(() => taperedTube(neckCurve(), 0.135, 0.068), []);
  const beakPucat = useMemo(() => taperedTube(beakPart(0, 0.58), 0.115, 0.082, 20, 12), []);
  const beakHitam = useMemo(() => taperedTube(beakPart(0.55, 1), 0.083, 0.028, 20, 12), []);

  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const wing = useRef<THREE.Group>(null);

  /**
   * ═══ Gerak ═══
   *
   * Versi lalu terlalu diam: badan bergoyang 0.035 rad dan kepala menoleh
   * pelan, itu saja. Dari jarak pantai gerakan sekecil itu tidak terbaca sama
   * sekali — burungnya seperti patung.
   *
   * Yang ditambahkan: satu SIKLUS PERILAKU. Flamingo tidak bergerak
   * terus-menerus; ia diam lama, lalu melakukan satu hal, lalu diam lagi.
   * Siklus 26 detik dengan empat kejadian yang saling tidak bertabrakan:
   *
   *   0.06–0.20  menunduk mematuk air, lalu tegak lagi
   *   0.34–0.42  merapikan bulu sayap
   *   0.55–0.63  menggeliat: leher memanjang, sayap sedikit terbuka
   *   0.78–0.86  memindahkan berat badan dengan jelas
   *
   * Di antara itu ia cuma bernapas dan menoleh. Justru diam-nya yang membuat
   * gerakan terasa hidup — kalau semuanya bergerak terus, tidak ada satu pun
   * yang jadi kejadian.
   */
  useFrame(() => {
    if (!animate) return;
    const t = performance.now() * 0.001;
    const k = (t % 26) / 26;

    /** puncak halus antara a dan b, nol di luar itu */
    const saat = (a: number, b: number) =>
      k > a && k < b ? Math.sin(((k - a) / (b - a)) * Math.PI) : 0;

    const patuk = saat(0.06, 0.2);
    const rapi = saat(0.34, 0.42);
    const geliat = saat(0.55, 0.63);
    const geser = saat(0.78, 0.86);

    if (torso.current) {
      // napas + perpindahan berat; waktu `geser` amplitudonya berlipat
      const berat = Math.sin(t * 0.4) * 0.035 + geser * 0.09;
      torso.current.rotation.z = berat;
      torso.current.position.y =
        2.46 + Math.sin(t * 0.4) * 0.025 + Math.sin(t * 1.7) * 0.008
        - patuk * 0.32 + geliat * 0.1;
      torso.current.rotation.x = -patuk * 0.5 + geliat * 0.12;
    }

    if (head.current) {
      head.current.rotation.y =
        Math.sin(t * 0.21) * 0.34 + Math.sin(t * 0.063) * 0.22 - rapi * 0.9;
      // menunduk waktu mematuk, mendongak waktu menggeliat
      head.current.rotation.z =
        Math.sin(t * 0.29) * 0.1 + patuk * 0.85 - geliat * 0.45 + rapi * 0.5;
      head.current.position.y = 1.62 + geliat * 0.16;
    }

    if (wing.current) {
      // dua sebab sayap bergerak: dirapikan, dan direntangkan saat menggeliat
      wing.current.rotation.x = rapi * 0.5 + geliat * 0.75;
      wing.current.rotation.z = -geliat * 0.3;
    }
  });

  return (
    <group>
      {/* dua kaki menapak, sedikit beda maju-mundur supaya tidak seperti cermin */}
      <Leg x={0.1} z={0.17} mat={mats.leg} matDark={mats.legDark} />
      <Leg x={-0.08} z={-0.17} mat={mats.leg} matDark={mats.legDark} />

      <group ref={torso} position={[0, 2.46, 0]}>
        {/* Badan. Flamingo dewasa ± 0,5 m panjang dan 0,28 m tinggi; pada
            skala 1 satuan = 30 cm itu 1,67 × 0,93. Versi pertama 1,28 × 0,80
            dan hasilnya burung berkaki panjang dengan badan terlalu kecil —
            terbaca kurus, bukan anggun. */}
        <mesh scale={[0.84, 0.47, 0.42]} material={mats.body}>
          <sphereGeometry args={[1, 26, 20]} />
        </mesh>
        {/* bulu ekor pendek, meruncing ke belakang-atas */}
        <mesh position={[-0.8, 0.16, 0]} rotation={[0, 0, 0.45]} scale={[0.4, 0.17, 0.21]} material={mats.pale}>
          <sphereGeometry args={[1, 14, 10]} />
        </mesh>
        <mesh position={[-0.98, 0.24, 0]} rotation={[0, 0, 0.6]} scale={[0.23, 0.1, 0.12]} material={mats.black}>
          <sphereGeometry args={[1, 12, 8]} />
        </mesh>

        {/* sayap terlipat: tipis, menempel, ujung bulu terbangnya hitam */}
        <group ref={wing} position={[-0.03, 0.06, 0.35]}>
          <mesh rotation={[0, 0, -0.08]} scale={[0.62, 0.28, 0.11]} material={mats.pale}>
            <sphereGeometry args={[1, 18, 14]} />
          </mesh>
          <mesh position={[-0.52, -0.04, -0.02]} rotation={[0, 0, 0.3]} scale={[0.26, 0.11, 0.08]} material={mats.black}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        </group>
        <group position={[-0.03, 0.06, -0.35]}>
          <mesh rotation={[0, 0, -0.08]} scale={[0.62, 0.28, 0.11]} material={mats.pale}>
            <sphereGeometry args={[1, 18, 14]} />
          </mesh>
          <mesh position={[-0.52, -0.04, 0.02]} rotation={[0, 0, 0.3]} scale={[0.26, 0.11, 0.08]} material={mats.black}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>
        </group>

        {/* leher */}
        <mesh geometry={neck} position={[0.55, 0.14, 0]} material={mats.body} />

        {/* kepala di ujung leher; poros putarnya di pangkal tengkorak
            supaya waktu menoleh, paruhnya ikut menyapu — bukan berputar
            di tempat seperti kepala boneka */}
        <group ref={head} position={[1.29, 1.62, 0]}>
          <mesh scale={[0.2, 0.165, 0.16]} material={mats.pale}>
            <sphereGeometry args={[1, 18, 14]} />
          </mesh>
          {/* dua potongan dari kurva yang sama: pangkal pucat, ujung hitam */}
          <mesh geometry={beakPucat} position={[0.12, 0.01, 0]} material={mats.beak} />
          <mesh geometry={beakHitam} position={[0.12, 0.01, 0]} material={mats.black} />
          <mesh position={[0.1, 0.07, 0.12]} material={mats.black}>
            <sphereGeometry args={[0.033, 10, 8]} />
          </mesh>
          <mesh position={[0.1, 0.07, -0.12]} material={mats.black}>
            <sphereGeometry args={[0.033, 10, 8]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lathedBody, bladeGeometry, toonRamp } from "./kit";

/**
 * ═══ LUMBA-LUMBA ═══
 * Menghadap +X. Titik nol di TENGAH badan, seperti paus — ia berputar di
 * sumbu itu waktu berenang. Panjang ± 9,5 satuan (± 2,85 m).
 *
 *
 * ── INI BUKAN PAUS YANG DIKECILKAN ──
 *
 * Godaan terbesar di berkas ini adalah menyalin `Paus.tsx`, mengalikan
 * skalanya 0,4, dan menyebutnya lumba-lumba. Hasilnya akan salah, dan salahnya
 * bukan soal ukuran melainkan soal siluet. Tiga hal yang membedakan, dan
 * ketiganya harus ada — kalau satu saja hilang, yang terbaca cuma "paus kecil":
 *
 *   1. **Lekuk antara jidat dan moncong.** Paus punya moncong tumpul yang
 *      menyambung mulus ke kepala. Lumba-lumba punya JIDAT membulat (melon)
 *      yang berhenti mendadak, lalu moncong ramping menonjol keluar dari situ.
 *      Lekukan di antara keduanya itulah yang membuat orang mengenalinya
 *      dalam sepersekian detik. Di profil badan, lekuk itu jari-jari yang
 *      terjun dari 0,75 ke 0,30 dalam jarak 0,75 satuan.
 *
 *   2. **Sirip punggung yang membentuk sabit.** Tepi belakangnya CEKUNG dan
 *      ujungnya menyapu ke belakang. Sirip berbentuk segitiga biasa terbaca
 *      sebagai hiu, dan itu perbedaan yang tidak boleh salah di halaman ini.
 *
 *   3. **Badan yang jauh lebih ramping.** Paus di scene ini sengaja
 *      digemukkan jadi 2:1 supaya terbaca waktu separuhnya terpotong garis
 *      air. Lumba-lumba tidak dipotong apa pun — ia berenang utuh di dalam
 *      air, jadi tidak ada alasan menggemukkannya. Perbandingannya 5,6:1.
 *
 *
 * ── ATURAN MENEMPEL ──
 *
 * Semua tempelan menanyakan letaknya ke `permukaan()`, tidak ada satu pun
 * angka y yang ditulis tangan. Ini aturan yang lahir dari sirip punggung paus
 * yang melayang 0,54 satuan di atas punggungnya selama dua putaran revisi.
 */

const BADAN = "#6E9EC6";
const PERUT = "#EAF5FC";

/**
 * Profil badan, [jari-jari, panjang]. Panjang 0 di ujung ekor, 9,5 di ujung
 * moncong. Meruncing HABIS di kedua ujung supaya permukaannya tertutup —
 * lubang di ujung akan terlihat dari dalam waktu ia berputar.
 *
 * Perhatikan terjunan di 7,30 → 8,05. Itu lekuk jidat-moncong, dan itu satu-
 * satunya bagian profil ini yang tidak boleh dihaluskan "supaya lebih rapi".
 */
const PROFIL: [number, number][] = [
  [0.0, 0.0],
  [0.09, 0.06],
  [0.14, 0.45],
  [0.17, 1.0],
  [0.23, 1.6],
  [0.33, 2.3],
  [0.46, 3.0],
  [0.6, 3.7],
  [0.72, 4.4],
  [0.8, 5.1],
  [0.845, 5.75],
  [0.85, 6.3],
  [0.82, 6.85],
  // ── jidat membulat, lalu berhenti ──
  [0.75, 7.3],
  [0.62, 7.7],
  [0.44, 7.95],
  // ── lekuk ──
  [0.3, 8.05],
  [0.275, 8.3],
  [0.245, 8.65],
  [0.2, 9.0],
  [0.14, 9.3],
  [0.0, 9.5],
];

/** profil memakai 0…9,5; badan memakai -4,75…+4,75 */
const GESER = 4.75;

const DORSAL_X = 0.7;
const SIRIP_X = 1.55;
const MATA_X = 3.05;
const SEMBUR_X = 2.3;
/** pangkal putaran ekor — di batang ekor, bukan di ujungnya */
const EKOR_X = -3.6;

function radiusDi(x: number) {
  const y = x + GESER;
  if (y <= 0 || y >= PROFIL[PROFIL.length - 1][1]) return 0;
  for (let i = 1; i < PROFIL.length; i++) {
    const [r0, y0] = PROFIL[i - 1];
    const [r1, y1] = PROFIL[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

/**
 * Badannya bukan tabung bundar sempurna: sedikit lebih tinggi daripada lebar,
 * seperti lumba-lumba sungguhan. Dua fungsi ini yang dipakai semua tempelan.
 */
const atasDi = (x: number) => radiusDi(x) * 1.0;
const sisiDi = (x: number) => radiusDi(x) * 0.92;

/** titik di permukaan badan: sudut 0 = puncak punggung, π/2 = sisi kanan */
function permukaan(x: number, sudut: number): [number, number, number] {
  return [x, atasDi(x) * Math.cos(sudut), sisiDi(x) * Math.sin(sudut)];
}

/**
 * Sirip punggung berbentuk SABIT.
 *
 * Digambar di bidang XY, lalu ditegakkan oleh scene pemanggilnya. Pangkalnya
 * menjorok ke bawah (y negatif) supaya benar-benar masuk ke dalam badan —
 * sirip yang cuma menyentuh permukaan akan terlihat menggantung begitu
 * badannya miring sedikit.
 *
 * Kuncinya kurva tepi belakang: ia melengkung ke DALAM (cekung). Kalau lurus,
 * yang keluar segitiga, dan segitiga di punggung terbaca sebagai hiu.
 */
function dorsalShape() {
  const s = new THREE.Shape();
  s.moveTo(0.52, -0.18); // pangkal depan, di bawah permukaan kulit
  s.bezierCurveTo(0.34, 0.42, 0.02, 0.82, -0.52, 1.02); // tepi depan naik menyapu
  s.bezierCurveTo(-0.3, 0.52, -0.16, 0.2, -0.42, -0.18); // tepi belakang CEKUNG
  s.lineTo(0.52, -0.18);
  return s;
}

/** sirip dada: bilah runcing yang menyapu ke belakang */
function pektoralShape() {
  const s = new THREE.Shape();
  s.moveTo(0.3, 0.1);
  s.bezierCurveTo(0.12, -0.2, -0.4, -0.62, -0.86, -0.78);
  s.bezierCurveTo(-0.5, -0.4, -0.22, -0.08, -0.16, 0.14);
  s.lineTo(0.3, 0.1);
  return s;
}

/** sirip ekor mendatar, lebih ramping daripada punya paus */
function flukeShape() {
  const s = new THREE.Shape();
  s.moveTo(0.26, 0);
  s.bezierCurveTo(0.16, 0.42, -0.12, 0.76, -0.58, 0.9);
  s.bezierCurveTo(-0.3, 0.46, -0.04, 0.24, 0.09, 0.17);
  s.lineTo(0.09, -0.17);
  s.bezierCurveTo(-0.04, -0.24, -0.3, -0.46, -0.58, -0.9);
  s.bezierCurveTo(-0.12, -0.76, 0.16, -0.42, 0.26, 0);
  return s;
}

/**
 * ═══ MENENTUKAN TITIK PANGKAL SIRIP ═══
 *
 * `bladeGeometry` memanggil `center()` di akhir — titik tengah kotak batasnya
 * yang jadi titik nol, bukan pangkal siripnya. Kalau itu dilupakan, sirip
 * punggung setinggi 1,2 satuan akan terkubur 0,6 satuan ke dalam punggung dan
 * yang menyembul cuma separuh atasnya.
 *
 * Dua fungsi ini menggeser geometri supaya SISI yang menempel ke badan berada
 * di titik nol. Angkanya dibaca dari kotak batas geometri itu sendiri — bukan
 * dihitung tangan dari titik kendali bezier, yang toh meleset karena kurva
 * bezier boleh melewati titik kendalinya.
 */
function pangkalDiBawah(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  g.translate(0, -g.boundingBox!.min.y, 0);
  return g;
}

function pangkalDiKanan(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  g.translate(-g.boundingBox!.max.x, 0, 0);
  return g;
}

export default function LumbaLumba({ animate = true }: { animate?: boolean }) {
  const ramp = toonRamp();

  const mats = useMemo(
    () => ({
      badan: new THREE.MeshToonMaterial({ color: BADAN, gradientMap: ramp }),
      perut: new THREE.MeshToonMaterial({ color: PERUT, gradientMap: ramp }),
      gelap: new THREE.MeshToonMaterial({ color: "#3F6E96", gradientMap: ramp }),
      mata: new THREE.MeshToonMaterial({ color: "#16303F", gradientMap: ramp }),
    }),
    [ramp]
  );

  const badanGeo = useMemo(() => lathedBody(PROFIL, 30), []);

  /**
   * Perut terang.
   *
   * Bukan tekstur dan bukan bahan kedua di badan yang sama — melainkan SALINAN
   * badan yang sedikit lebih kurus dan diturunkan. Ia tersembunyi di dalam
   * badan di mana-mana kecuali di bagian bawah, tempat ia menyembul keluar.
   * Batas antara keduanya jadi kurva yang mengikuti bentuk badan dengan
   * sendirinya, tanpa satu pun angka yang perlu disetel.
   */
  const perutGeo = useMemo(() => {
    const g = lathedBody(PROFIL, 30);
    g.scale(1, 0.94, 0.94);
    g.translate(0, -0.16, 0);
    return g;
  }, []);

  const dorsalGeo = useMemo(() => pangkalDiBawah(bladeGeometry(dorsalShape(), 0.1, 0.035)), []);
  const pektoralGeo = useMemo(() => pangkalDiKanan(bladeGeometry(pektoralShape(), 0.08, 0.03)), []);
  const flukeGeo = useMemo(() => pangkalDiKanan(bladeGeometry(flukeShape(), 0.09, 0.032)), []);

  const ekorRef = useRef<THREE.Group>(null);
  const badanRef = useRef<THREE.Group>(null);
  const jam = useRef(0);

  useFrame((_, dt) => {
    if (!animate) return;
    jam.current += dt;
    const t = jam.current;

    /**
     * Lumba-lumba mengayun ekornya NAIK-TURUN, bukan ke kiri-kanan seperti
     * ikan. Itu ciri mamalia laut, dan salah arah di sini akan terbaca sebagai
     * ikan besar.
     *
     * Badannya ikut mengangguk sedikit, dengan fase yang TERTINGGAL dari ekor
     * — dorongan datang dari ekor dulu, badan menyusul. Dua besaran yang
     * terikat secara fisik, diturunkan dari satu sumber; lihat AGENTS.md.
     */
    const kayuh = Math.sin(t * 2.6);
    if (ekorRef.current) ekorRef.current.rotation.z = kayuh * 0.34;
    if (badanRef.current) badanRef.current.rotation.z = Math.sin(t * 2.6 - 0.9) * 0.06;
  });

  const dorsalY = atasDi(DORSAL_X);
  const mataP = permukaan(MATA_X, Math.PI * 0.62);
  const semburY = atasDi(SEMBUR_X);
  const siripZ = sisiDi(SIRIP_X);

  return (
    <group ref={badanRef}>
      <mesh geometry={badanGeo} material={mats.badan} />
      <mesh geometry={perutGeo} material={mats.perut} />

      {/*
        Sirip punggung.

        TIDAK dirotasi. Bentuknya digambar di bidang XY dengan +Y ke atas dan
        ditebalkan ke arah Z — itu sudah tegak sejak lahir. Merebahkannya
        dengan -π/2, refleks dari torus dan piring, justru akan menidurkannya
        di punggung. Aturannya: yang MELINGKARI direbahkan, yang BERDIRI tidak.

        Diturunkan 0,12 di bawah kulit supaya pangkalnya masuk ke dalam badan,
        bukan sekadar menyentuhnya.
      */}
      <mesh geometry={dorsalGeo} material={mats.badan} position={[DORSAL_X, dorsalY - 0.12, 0]} />

      {/*
        Sirip dada, sepasang.
        Dicerminkan dengan SKALA negatif, bukan tanda minus pada rotasi —
        `rotation={[a, b, -c]}` tidak menghasilkan cermin karena three
        mengurutkan rotasi X·Y·Z. Sirip dada paus pernah menunjuk ke depan
        melewati moncong gara-gara ini.
      */}
      {[1, -1].map((s) => (
        <group key={s} scale={[1, 1, s]}>
          <mesh
            geometry={pektoralGeo}
            material={mats.badan}
            position={[SIRIP_X, -atasDi(SIRIP_X) * 0.35, siripZ * 0.82]}
            rotation={[1.15, -0.25, -0.35]}
          />
        </group>
      ))}

      {/* mata, sepasang — di belakang lekuk, bukan di moncong */}
      {[1, -1].map((s) => (
        <mesh key={s} material={mats.mata} position={[mataP[0], mataP[1], mataP[2] * s]}>
          <sphereGeometry args={[0.075, 10, 8]} />
        </mesh>
      ))}

      {/* lubang sembur di puncak punggung, tepat di belakang jidat */}
      <mesh
        material={mats.gelap}
        position={[SEMBUR_X, semburY - 0.02, 0]}
        scale={[1.5, 0.5, 1]}
        rotation={[0, 0, 0]}
      >
        <sphereGeometry args={[0.075, 10, 8]} />
      </mesh>

      {/*
        Garis mulut: alur tipis gelap di sepanjang moncong. Tanpa ini
        moncongnya cuma kerucut, dan lumba-lumba tanpa mulut terlihat seperti
        mainan plastik.
      */}
      <mesh material={mats.gelap} position={[4.05, -0.05, 0]} scale={[1.55, 0.055, 0.48]}>
        <sphereGeometry args={[0.5, 14, 8]} />
      </mesh>

      {/*
        Ekor.

        Yang berputar batang ekornya, dan siripnya ikut terbawa — bukan
        siripnya sendiri yang berputar di tempat. Bedanya kelihatan: sirip yang
        berputar sendiri terlihat seperti engsel, sedangkan seluruh ujung badan
        yang mengayun terbaca sebagai dorongan.

        Sirip direbahkan mendatar (-π/2 di sumbu X) karena sirip ekor mamalia
        laut MENDATAR, tidak tegak seperti ikan. Ini yang membedakan siluetnya
        dari hiu bahkan dari jauh.
      */}
      <group ref={ekorRef} position={[EKOR_X, 0, 0]}>
        <mesh
          geometry={flukeGeo}
          material={mats.badan}
          position={[-0.95, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  );
}

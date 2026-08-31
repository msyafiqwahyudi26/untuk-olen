"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lathedBody, taperedTube, toonRamp } from "./kit";

/**
 * ═══ PAUS ═══
 * Menghadap +X. Titik nol di TENGAH badan (bukan di dasar) karena paus
 * berputar di sumbu itu waktu menyelam. Panjang ± 6,4 satuan, tinggi ± 3,1.
 *
 * ── Kenapa badannya jauh lebih gemuk daripada paus sungguhan ──
 *
 * Paus asli berbanding sekitar 6:1 panjang-ke-tinggi. Lautnya di scene ini
 * bidang buram: permukaan air memotong badan dengan garis lurus dan yang di
 * bawahnya hilang sama sekali. Jadi paus seproporsi aslinya cuma menyisakan
 * sebilah tipis di layar — keluhan "kayak papan". Jari-jarinya dikalikan 1,5
 * supaya jadi ± 2:1 dan punggungnya punya bentuk.
 *
 * ── Profil badan ──
 * Meruncing HABIS (r = 0) di kedua ujung supaya permukaannya tertutup penuh.
 * Versi lama menyisakan lubang r = 0.06 di moncong, dan lubang itu terlihat
 * dari dalam waktu paus berputar — keluhan "kepalanya kosong".
 * Ujung depan sengaja tumpul: dari r maksimum ke nol cuma dalam 1,3 satuan,
 * jadi moncongnya membulat seperti paus, bukan lancip seperti berudu.
 */

const BODY = "#2E82BC";
const BELLY = "#D6EDF8";
const GEMUK = 1.5;

/** letak sirip punggung dan mata di sumbu badan — dipakai beberapa tempat */
const DORSAL_X = -1.0;
const MATA_X = 1.55;

/**
 * Ujung depan mengikuti SEPEREMPAT LINGKARAN, bukan garis lurus ke titik.
 *
 * Versi sebelumnya meruncing dari jari-jari penuh ke nol sepanjang 1,3 satuan
 * secara lurus — sudut kerucutnya 50°, dan yang keluar bentuk tetesan air.
 * Paus punya moncong TUMPUL: dari samping, bagian depannya nyaris setengah
 * bola. Titik-titik di bawah r = R·√(1−s²) dengan R = 1.03, jadi kubahnya
 * benar-benar bundar.
 *
 * Batang ekornya juga tidak dibiarkan setipis jarum: sirip ekor perlu sesuatu
 * untuk menempel, dan pangkal yang terlalu tipis membuat siripnya terlihat
 * seperti benda lain yang kebetulan lewat.
 */
const PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.13, 0.05],
  [0.185, 0.35],
  [0.225, 0.8],
  [0.29, 1.35],
  [0.4, 1.95],
  [0.55, 2.55],
  [0.72, 3.15],
  [0.87, 3.75],
  [0.97, 4.35],
  [1.02, 4.9],
  [1.03, 5.37],
  // ── kubah moncong ──
  [0.983, 5.679],
  [0.86, 5.937],
  [0.681, 6.143],
  [0.449, 6.297],
  [0.25, 6.369],
  [0.0, 6.4],
];

/**
 * Sirip ekor.
 *
 * Pangkalnya sengaja dibuat LEBIH TEBAL dan menjorok ke depan (x = +0.62)
 * supaya benar-benar masuk ke dalam batang ekor, bukan sekadar menyentuhnya.
 * Versi sebelumnya berpangkal di x = 0.35 dengan pinggang setipis 0.16 —
 * dari samping, sambungannya terlihat menggantung lepas dari badan. Keluhan
 * Yaya: "bagian ekornya posisinya masih salah tidak menyatu dengan ujung
 * badan".
 */
function flukeShape() {
  const s = new THREE.Shape();
  s.moveTo(0.35, 0);
  s.bezierCurveTo(0.22, 0.55, -0.15, 1.0, -0.68, 1.16);
  s.bezierCurveTo(-0.36, 0.6, -0.05, 0.3, 0.12, 0.22);
  s.lineTo(0.12, -0.22);
  s.bezierCurveTo(-0.05, -0.3, -0.36, -0.6, -0.68, -1.16);
  s.bezierCurveTo(-0.15, -1.0, 0.22, -0.55, 0.35, 0);
  return s;
}

/**
 * ═══ PERMUKAAN BADAN — pakai ini, jangan menebak angka ═══
 *
 * Ini akar dari cacat "siripnya tidak menempel". Sirip punggung dulu ditaruh
 * di y = 1.24 karena angka itu terlihat masuk akal. Padahal permukaan badan
 * di x = -1.2 cuma setinggi 0.70 — siripnya melayang 0,54 satuan di atas
 * punggung, dan dari samping terlihat seperti benda lain yang kebetulan
 * mengambang di situ.
 *
 * Semua tempelan (sirip, mata, lubang napas, garis mulut) sekarang menanyakan
 * letaknya ke fungsi ini. Kalau profil badan diubah, semuanya ikut pindah.
 */
function radiusDi(x: number) {
  const y = x + 3.5; // profil memakai 0 … 6.4, badan memakai -3.5 … 2.9
  if (y <= 0 || y >= 6.4) return 0;
  for (let i = 1; i < PROFILE.length; i++) {
    const [r0, y0] = PROFILE[i - 1];
    const [r1, y1] = PROFILE[i];
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0);
      return (r0 + (r1 - r0) * t) * GEMUK;
    }
  }
  return 0;
}

/** tinggi punggung di satu titik (skala y badan = 0.94) */
const atasDi = (x: number) => radiusDi(x) * 0.94;

/** setengah lebar badan di satu titik (skala z badan = 1.02) */
const sisiDi = (x: number) => radiusDi(x) * 1.02;

/**
 * Titik di permukaan badan.
 * `sudut` diukur dari punggung: 0 = tepat di atas, π/2 = sisi samping,
 * π = perut.
 */
function permukaan(x: number, sudut: number): [number, number, number] {
  return [x, atasDi(x) * Math.cos(sudut), sisiDi(x) * Math.sin(sudut)];
}

/** sirip punggung: segitiga menyapu ke belakang, bukan bola gepeng */
function dorsalShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.55, 0);
  s.quadraticCurveTo(-0.2, 0.62, 0.28, 0.72);
  s.quadraticCurveTo(-0.02, 0.3, 0.5, 0.02);
  s.closePath();
  return s;
}

/**
 * Kendali dari scene, DIBACA TIAP FRAME.
 *
 * Sengaja objek yang dimutasi, bukan prop biasa — alasannya persis sama
 * dengan `KepitingKendali` di Kepiting.tsx, dan pola itu memang sudah ada di
 * proyek ini sejak kepitingnya diperbaiki.
 *
 * Paus tertinggal. Sampai 31 Agustus scene-nya masih memanggil
 * `setSpout(...)` di dalam `useFrame`: setState 60 kali per detik hanya untuk
 * satu angka. Tiap panggilan me-render ulang SELURUH paus — belasan mesh
 * berikut propnya diperiksa React satu per satu — padahal yang berubah cuma
 * skala satu gumpalan semburan. Di HP itu terbaca sebagai gerak tersendat,
 * dan sendatannya menular ke seluruh pemandangan karena render React menyela
 * gelung animasi.
 *
 * Dengan objek yang dimutasi, scene menulis angkanya dan aset membacanya di
 * useFrame-nya sendiri. React tidak me-render apa pun.
 */
export type PausKendali = { spout: number };

export default function Paus({
  animate = true,
  kendali,
}: {
  animate?: boolean;
  /** 0 = tidak menyembur, 1 = penuh. Di scene ini dikendalikan perjalanan. */
  kendali?: PausKendali;
}) {
  const ramp = toonRamp();
  const mats = useMemo(
    () => ({
      body: new THREE.MeshToonMaterial({ color: BODY, gradientMap: ramp }),
      belly: new THREE.MeshToonMaterial({ color: BELLY, gradientMap: ramp }),
      line: new THREE.MeshToonMaterial({ color: "#1B6392", gradientMap: ramp }),
      groove: new THREE.MeshToonMaterial({ color: "#B4DCEE", gradientMap: ramp }),
      eye: new THREE.MeshBasicMaterial({ color: "#123F60" }),
      puff: new THREE.MeshToonMaterial({
        color: "#FFFFFF",
        gradientMap: ramp,
        transparent: true,
        opacity: 0.9,
      }),
    }),
    [ramp]
  );

  const bodyGeo = useMemo(() => {
    const g = lathedBody(PROFILE.map(([r, y]) => [r * GEMUK, y]));
    // digeser supaya titik putarnya di tengah badan: -3.5 … 2.9
    g.translate(-3.5, 0, 0);
    g.scale(1, 0.94, 1.02);
    return g;
  }, []);

  const flukeGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(flukeShape(), {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.08,
      bevelSegments: 4,
      curveSegments: 14,
    });
    // JANGAN g.center(). Yang harus jatuh di titik nol adalah PANGKAL sirip,
    // bukan pusat massanya — kalau di-center, letak pangkalnya berubah tiap
    // kali bentuknya disetel, dan sambungannya lepas lagi tanpa ketahuan.
    g.translate(-0.35, 0, -0.07);
    return g;
  }, []);

  /**
   * Garis mulut, dibangun MENEMPEL di permukaan.
   *
   * Titik-titiknya diambil dari `permukaan()` pada sudut yang makin turun ke
   * arah depan — jadi garisnya melengkung ke bawah di moncong persis seperti
   * paus sungguhan, dan tidak mungkin melayang lepas dari badan berapa pun
   * profil badannya diubah.
   */
  const mulutGeo = useMemo(() => {
    const titik: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = 0.55 + t * 1.95;   // dari sudut mulut ke pangkal moncong
      /**
       * ═══ Ini yang membuat pausnya TERSENYUM, bukan cemberut ═══
       *
       * `sudut` diukur dari punggung: makin besar makin ke bawah. Versi lalu
       * memakai garis lurus 1.16 → 0.84, artinya mulutnya paling RENDAH di
       * sudut belakang dan naik terus ke depan — persis bentuk cemberut.
       *
       * Senyum itu kebalikannya: sudut belakang TERANGKAT, tengahnya turun.
       *   suku sin   → melengkung turun di tengah
       *   suku (1-t) → mengangkat ujung belakang, tempat sudut mulut berada
       */
      const sudut =
        (Math.PI / 2) * (1.06 + 0.16 * Math.sin(Math.PI * t) - 0.2 * Math.pow(1 - t, 2.4));
      const [px, py, pz] = permukaan(x, sudut);
      titik.push(new THREE.Vector3(px, py, pz * 0.985));
    }
    return taperedTube(new THREE.CatmullRomCurve3(titik), 0.052, 0.03, 44, 8);
  }, []);

  /** rusuk di punggung moncong, menempel mengikuti lengkung badan */
  const rusukGeo = useMemo(() => {
    const titik: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = 1.45 + t * 1.15;
      titik.push(new THREE.Vector3(x, atasDi(x) - 0.02, 0));
    }
    return taperedTube(new THREE.CatmullRomCurve3(titik), 0.075, 0.03, 30, 8);
  }, []);

  const dorsalGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(dorsalShape(), {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3,
      curveSegments: 12,
    });
    g.translate(0, 0, -0.12);
    return g;
  }, []);

  const puff = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!puff.current) return;
    // Di pratinjau semburannya berdenyut sendiri supaya bisa dinilai;
    // di scene nilainya datang dari prop.
    const s = animate
      ? Math.max(0.001, Math.sin(((performance.now() * 0.001) % 6) / 6 * Math.PI) ** 1.4)
      : Math.max(0.001, kendali?.spout ?? 0);
    puff.current.scale.setScalar(s);
  });

  return (
    <group>
      <mesh geometry={bodyGeo} material={mats.body} />

      {/* perut pucat mengikuti lengkung badan */}
      <mesh position={[0.7, -atasDi(0.7) * 0.62, 0]} scale={[1.9, 0.5, 1.15]} material={mats.belly}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {[-0.42, -0.14, 0.14, 0.42].map((z, i) => (
        <mesh key={i} position={[1.5, -atasDi(1.5) * 0.78, z]} scale={[1.15, 0.035, 0.055]} material={mats.groove}>
          <sphereGeometry args={[1, 10, 6]} />
        </mesh>
      ))}

      {/* Sirip punggung, DUDUK DI PUNGGUNG.
          Posisinya dihitung dari `atasDi`, lalu diturunkan 0.1 supaya
          pangkalnya tertanam sedikit, bukan sekadar bersentuhan. */}
      <mesh
        geometry={dorsalGeo}
        position={[DORSAL_X, atasDi(DORSAL_X) - 0.1, 0]}
        rotation={[0, 0, -0.12]}
        scale={0.62}
        material={mats.body}
      />

      {/* Sirip ekor: rentangnya ± sepertiga panjang badan, seperti aslinya.
          Sempat 1.35 dan mendatar penuh — hasilnya sayap sebesar setengah
          badan yang terbaca sebagai makhluk kedua yang kebetulan lewat.
          Sedikit dimiringkan supaya punya luas di layar dari samping. */}
      <mesh
        geometry={flukeGeo}
        position={[-3.02, -0.06, 0]}
        rotation={[Math.PI / 2 - 0.24, 0, 0.1]}
        scale={1.15}
        material={mats.body}
      />

      {/* Sirip dada. Pangkalnya ditanam di dalam badan (z = ±1.0, sedangkan
          jari-jari badan di situ ± 1.55) dan menyapu ke BELAKANG mengikuti
          badan. Versi lalu sepanjang 2,1 satuan dengan sudut menyerong —
          dari samping terbaca sebagai bilah yang lepas, bukan sirip. */}
      {/* Sirip dada.
          Dicerminkan lewat SKALA (z negatif), bukan dengan membalik tanda tiap
          sudut rotasi. Membalik tanda pada rotasi majemuk tidak menghasilkan
          bentuk cermin — urutan X·Y·Z membuat kedua sirip berakhir di arah
          yang berbeda, dan yang sebelah menonjol ke depan melewati moncong.
          Dibungkus group supaya skala negatif hanya mengenai siripnya. */}
      {[1, -1].map((s) => (
        <group key={s} scale={[1, 1, s]}>
          <mesh
            position={[0.35, atasDi(0.35) * -0.5, sisiDi(0.35) * 0.66]}
            rotation={[0.5, 0.62, -0.34]}
            scale={[0.66, 0.09, 0.26]}
            material={mats.belly}
          >
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
        </group>
      ))}

      {/* ── Garis mulut ──
          Satu tabung tipis yang MENGIKUTI permukaan badan dari ujung moncong
          sampai ke belakang mata, sedikit melengkung ke bawah di depan.
          Versi lalu satu bola gepeng yang ditaruh di udara dekat kepala —
          tidak menempel, tidak melengkung, dan sama sekali tidak terbaca
          sebagai mulut. Paus balin tidak bergigi; yang menandai mulutnya
          justru garis panjang ini, bukan gigi. */}
      {[1, -1].map((s) => (
        <mesh key={s} geometry={mulutGeo} scale={[1, 1, s]} material={mats.line} />
      ))}

      {/* ── Mata ──
          Kecil, dan letaknya RENDAH DI SISI tepat di belakang sudut mulut —
          bukan di tengah pipi. Ini penanda proporsi yang paling sering salah:
          mata paus jauh lebih kecil daripada dugaan orang. */}
      {[1, -1].map((s) => {
        const [ex, ey, ez] = permukaan(MATA_X, (Math.PI / 2) * 0.86);
        return (
          <group key={s} position={[ex, ey - 0.12, ez * s]}>
            <mesh scale={[1.25, 1, 0.6]} material={mats.eye}>
              <sphereGeometry args={[0.1, 12, 10]} />
            </mesh>
            {/* kelopak: guratan gelap tipis di atas mata */}
            <mesh position={[0, 0.09, -0.02 * s]} scale={[1.5, 0.3, 0.5]} material={mats.line}>
              <sphereGeometry args={[0.11, 10, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* ── Punggung moncong ──
          Rostrum paus balin punya satu rusuk memanjang di tengah dari lubang
          napas ke ujung moncong. Tanpa itu kepalanya cuma kubah licin, dan
          dari samping tidak ada yang menyatakan "ini bagian depan". */}
      {/* Rusuk moncong, MENGIKUTI lengkung punggung.
          Dulu satu bola lonjong lurus. Punggung paus menurun tajam ke arah
          moncong, jadi rusuk lurus yang panjangnya melewati lengkungan itu
          menembus keluar di ujung depan — itulah "bagian lancip" yang
          terlihat aneh. Memendekkannya cuma memindahkan masalah; yang benar
          adalah membuatnya melengkung sama seperti badannya. */}
      <mesh geometry={rusukGeo} material={mats.body} />

      {/* lubang napas: sepasang, duduk di punggung persis di belakang rusuk */}
      {[1, -1].map((s) => (
        <mesh
          key={s}
          position={[1.62, atasDi(1.62) - 0.03, 0.1 * s]}
          scale={[0.14, 0.05, 0.07]}
          material={mats.line}
        >
          <sphereGeometry args={[1, 10, 8]} />
        </mesh>
      ))}

      <group ref={puff} position={[1.9, 1.45, 0]} scale={0.001}>
        {[
          [0, 0.35, 0, 0.2],
          [-0.2, 0.75, 0.05, 0.26],
          [0.22, 0.8, -0.05, 0.24],
          [-0.05, 1.2, 0, 0.3],
          [-0.4, 1.15, 0.1, 0.2],
          [0.42, 1.1, -0.08, 0.18],
        ].map((v, i) => (
          <mesh key={i} position={[v[0], v[1], v[2]]} material={mats.puff}>
            <sphereGeometry args={[v[3], 12, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Titik tertinggi badan paus pada kemiringan tertentu, dalam satuan model.
 *
 * Dipakai scene untuk memastikan paus BENAR-BENAR sudah di bawah air sebelum
 * disembunyikan. Versi lalu menghilang begitu saja padahal ekornya masih di
 * atas permukaan — keluhan "belum sepenuhnya tenggelam dia menghilang".
 */
export function pausPuncak(rotZ: number) {
  const r = 1.03 * GEMUK * 0.94;
  let top = -Infinity;
  for (const x of [-3.64, -3.5, -1.2, 0, 1.9, 2.9]) {
    top = Math.max(top, x * Math.sin(rotZ) + r * Math.cos(rotZ));
  }
  return top;
}

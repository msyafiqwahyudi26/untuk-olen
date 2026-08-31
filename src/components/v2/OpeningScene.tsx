"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PALET, posisiMatahari, posisiBulan, tinggiMatahari, tinggiBulan, type Waktu } from "./waktu";
import { WATERLINE, sandAt } from "./world";
// Camar sudah dihapus atas permintaan Yaya — tiga kali dicoba, bentuknya tetap
// tidak terbaca sebagai burung dari jarak ini. Modelnya masih disimpan di
// assets/Camar.tsx dan bisa dilihat di /aset kalau nanti dipakai lagi.
import Awan from "./assets/Awan";
import Matahari from "./assets/Matahari";
import Bulan from "./assets/Bulan";
import Paus, { pausPuncak, type PausKendali } from "./assets/Paus";
import Beach from "./beach";

/*
 * Langit = gradien CSS di belakang canvas (lihat `.op` di v2.css); canvas
 * transparan. Pernah dicoba pakai scene.background (keluar hitam) dan pakai
 * bidang 3D (malah menutupi seluruh scene). CSS yang paling andal.
 *
 * Ukuran dunia (garis air, tinggi pasir) ada di world.ts — satu sumber untuk
 * shader maupun penempatan benda. Bentuk setiap benda ada di assets/ dan bisa
 * dinilai sendiri-sendiri di /aset. Berkas ini menyusun ketiganya.
 */
/**
 * ═══ CARA MEMBURU SHADER YANG GAGAL — baca ini sebelum menebak-nebak ═══
 *
 * Kalau sebuah bidang tiba-tiba tidak tergambar padahal kodenya "kelihatan
 * benar": shader-nya kemungkinan besar gagal dikompilasi. Yang membuat ini
 * mahal waktunya adalah tiga hal sekaligus:
 *   1. three memanggil console.error, dan pembaca console dari luar halaman
 *      sering tidak kebagian pesannya;
 *   2. draw call-nya TETAP terhitung (onBeforeRender tetap jalan), jadi dari
 *      luar seolah objeknya digambar;
 *   3. tidak ada yang berubah selain: piksel di area itu tetap transparan.
 *
 * Cara tercepat memastikannya, tempel di console:
 *
 *   const p = renderer.properties.get(mesh.material).currentProgram;
 *   gl.getShaderInfoLog(p.fragmentShader);
 *
 * Pernah kejadian di sini: variabel bernama `patch` — kata cadangan GLSL.
 * Pesannya "Illegal use of reserved word". Kata cadangan lain yang gampang
 * kepakai tanpa sadar: sample, filter, input, output, common, resource,
 * active, partition, this, packed, long, short, double, half, fixed.
 * Karena itu nama variabel di shader-shader ini dibuat bahasa Indonesia.
 *
 * Pemeriksa di bawah menyalakan peringatan yang kelihatan saat dev, sekali
 * jalan, supaya kegagalan berikutnya ketahuan dalam hitungan detik.
 */
function ShaderCheck() {
  const { gl, scene } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const id = setTimeout(() => {
      const ctx = gl.getContext();
      scene.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        if (!m || Array.isArray(m) || m.type !== "ShaderMaterial") return;
        const prog = (gl.properties.get(m) as { currentProgram?: { program: WebGLProgram } })
          ?.currentProgram;
        if (!prog?.program) return;
        if (!ctx.getProgramParameter(prog.program, ctx.LINK_STATUS)) {
          const p = prog as unknown as { fragmentShader: WebGLShader; vertexShader: WebGLShader };
          console.error(
            "[olen] shader gagal dikompilasi pada", o.name || o.type,
            "\nVS:", ctx.getShaderInfoLog(p.vertexShader),
            "\nFS:", ctx.getShaderInfoLog(p.fragmentShader)
          );
        }
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [gl, scene]);
  return null;
}

/* ═══════════════════════ langit ═══════════════════════ */

/**
 * Langit digambar CSS di belakang canvas (.op di v2.css); canvas transparan.
 * SUDAH DICOBA DAN GAGAL, jangan diulang:
 *   - scene.background bertekstur → keluar hitam
 *   - bidang 3D bervertex-color / bershader → menutupi SELURUH scene,
 *     meski renderOrder -10 dan depthWrite false
 * CSS satu-satunya yang tidak pernah bermasalah.
 */

/* ═══════════════════════ matahari ═══════════════════════ */

/**
 * Matahari sekarang bola bervolume dari assets/Matahari.tsx.
 *
 * Versi lama tiga cakram datar yang selalu menghadap kamera. Di antara awan,
 * paus dan flamingo yang semuanya punya sisi, satu-satunya benda gepeng
 * langsung ketahuan — keluhan "2D gepeng sendiri".
 */
/**
 * Matahari dan bulan adalah DUA benda berbeda, bukan satu benda yang
 * diwarnai ulang. Bulan memantulkan cahaya — punya sisi terang dan sisi
 * redup, punya kawah. Matahari memancarkan — rata terang tanpa sisi gelap.
 * Kalau bulan dibuat dari matahari yang diputihkan, yang muncul di langit
 * malam adalah lubang putih, bukan benda.
 *
 * Keduanya selalu ada di scene; yang berganti adalah skalanya. Diskalakan
 * ke nol, bukan `visible=false`, supaya pergantiannya ikut teranimasi
 * bersama warna langit dan laut.
 */
function Surya({ waktu, jam }: { waktu: Waktu; jam: number }) {
  const p = PALET[waktu].surya;
  const gMatahari = useRef<THREE.Group>(null);
  const gBulan = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * 0.7);

    // Posisinya dihitung dari JAM, bukan dari empat titik tetap. Waktu jamnya
    // merayap, keduanya ikut merayap — dan waktu Olen menekan tombol waktu,
    // jam tujuannya berpindah dan keduanya MELUNCUR ke posisi baru di
    // busurnya, bukan berpindah lurus menembus langit.
    if (gMatahari.current) {
      v.set(...posisiMatahari(jam));
      gMatahari.current.position.lerp(v, k);
      const s = p.skala * tinggiMatahari(jam);
      gMatahari.current.scale.setScalar(
        gMatahari.current.scale.x + (s - gMatahari.current.scale.x) * k
      );
      gMatahari.current.visible = gMatahari.current.scale.x > 0.05;
    }
    if (gBulan.current) {
      v.set(...posisiBulan(jam));
      gBulan.current.position.lerp(v, k);
      const s = p.skala * 0.62 * tinggiBulan(jam);
      gBulan.current.scale.setScalar(
        gBulan.current.scale.x + (s - gBulan.current.scale.x) * k
      );
      gBulan.current.visible = gBulan.current.scale.x > 0.05;
    }
  });

  return (
    <>
      <group ref={gMatahari} position={posisiMatahari(jam)} scale={p.skala * tinggiMatahari(jam)}>
        <Matahari inti={p.inti} tepi={p.tepi} />
      </group>
      <group ref={gBulan} position={posisiBulan(jam)} scale={p.skala * 0.62 * tinggiBulan(jam)}>
        <Bulan />
      </group>
    </>
  );
}

/* ═══════════════════════ bintang ═══════════════════════
 * Hanya di malam hari. Titik-titik kecil pada bidang jauh di belakang laut,
 * tanpa pencahayaan supaya tetap terang sendiri. */
/**
 * ═══ BINTANG — merata, bukan acak ═══
 *
 * Sebarannya semula memakai hash `fract(sin(i · k) · besar)`, cara yang lazim
 * dan tetap saja salah untuk keperluan ini. Dilaporkan "bintangnya nggak rata
 * di langit", dan diukur di kisi 12 × 12 memang begitu:
 *
 *     hash sinus   33 dari 144 petak KOSONG · terpadat 5 · simpangan 1,21
 *     deret R2      0 dari 144 petak kosong · terpadat 3 · simpangan 0,58
 *
 * Sebabnya bukan hash-nya jelek. Keacakan sungguhan MEMANG menggumpal:
 * titik yang dipilih bebas satu sama lain akan meninggalkan lubang di satu
 * tempat dan tumpukan di tempat lain, dan mata langsung menangkapnya sebagai
 * "tidak rata". Yang dibutuhkan langit bukan acak, melainkan MERATA.
 *
 * Deret R2 (Roberts) menyelesaikannya: kelipatan bilangan plastik yang
 * diambil pecahannya, sehingga tiap titik baru jatuh sejauh mungkin dari
 * yang sudah ada. Ia bukan acak sama sekali — ia dirancang supaya tidak
 * pernah menggumpal.
 *
 * Sedikit goyangan ditambahkan setelahnya, dan itu perlu: R2 murni terlalu
 * teratur dan mulai terbaca sebagai kisi miring. Amplitudonya seperlima
 * jarak antar bintang — cukup memecah keteraturannya, tidak cukup untuk
 * mengembalikan gumpalan.
 *
 * Jumlahnya dinaikkan dari 220 ke 340 karena di layar tegak hanya sekitar
 * 29 persen lebar medan bintang yang terlihat; dengan 220, yang benar-benar
 * tampak cuma sekitar 64 butir.
 */
const PLASTIK = 1.32471795724474602596;

function Bintang({ tampil }: { tampil: boolean }) {
  const geo = useMemo(() => {
    const n = 340;
    const a1 = 1 / PLASTIK;
    const a2 = 1 / (PLASTIK * PLASTIK);
    const pos = new Float32Array(n * 3);
    for (let i = 1; i <= n; i++) {
      const u = (0.5 + a1 * i) % 1;
      const v = (0.5 + a2 * i) % 1;
      /* goyangan tetap — bukan Math.random, supaya bintangnya tidak
         berpindah tiap halaman dimuat */
      const g1 = Math.sin(i * 7.13) * 0.5;
      const g2 = Math.cos(i * 3.71) * 0.5;
      const k = i - 1;
      pos[k * 3] = (u - 0.5) * 620 + g1 * 7;
      pos[k * 3 + 1] = 22 + v * 96 + g2 * 2.4;
      pos[k * 3 + 2] = -258;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useRef<THREE.PointsMaterial>(null);
  useFrame((_, dt) => {
    if (!mat.current) return;
    const tuju = tampil ? 0.9 : 0;
    mat.current.opacity += (tuju - mat.current.opacity) * Math.min(1, dt * 0.8);
    mat.current.visible = mat.current.opacity > 0.01;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial ref={mat} color="#EAF2FF" size={1.5} sizeAttenuation transparent opacity={0} depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════ laut ═══════════════════════
 * Warnanya dijenjangkan menurut JARAK ke pantai, bukan tinggi ombak —
 * itu sebabnya versi sebelumnya jadi gumpalan navy. Tepi tiap pita
 * bergelombang pelan, persis seperti ilustrasi di Figma.
 */

const seaVert = /* glsl */ `
uniform float uTime;
varying vec3 vW;
varying float vH;

float wave(vec2 p, float t){
  float h = 0.0;
  h += sin(p.y * 0.070 + t * 0.55) * 0.80;
  h += sin(p.x * 0.048 - t * 0.40) * 0.50;
  h += sin((p.x * 0.12 + p.y * 0.10) + t * 0.88) * 0.24;
  h += sin((p.x * 0.22 - p.y * 0.17) + t * 1.35) * 0.10;
  return h;
}

void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float amp = mix(0.12, 1.0, 1.0 - smoothstep(-60.0, 28.0, wp.z));
  float h = wave(wp.xz, uTime) * amp;
  wp.y += h;
  vW = wp.xyz;
  vH = h / max(amp, 0.001);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const seaFrag = /* glsl */ `
// Konversi linear → sRGB ditulis sendiri. Memakai #include <colorspace_fragment>
// milik three sempat bentrok dengan fungsi yang sudah disuntikkan lebih dulu
// ('LinearTransferOETF : function already has a body'), jadi jangan dipakai lagi.
vec3 toSRGB(vec3 c){
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0/2.4)) - 0.055,
             step(vec3(0.0031308), c));
}
uniform vec3  uShallow;
uniform vec3  uLight;
uniform vec3  uMid;
uniform vec3  uDeep;
uniform vec3  uFar;
uniform vec3  uFoam;
uniform vec3  uHorizon;
uniform float uTime;
uniform float uWaterline;
varying vec3  vW;
varying float vH;

vec3 ramp(float t){
  vec3 c = uShallow;
  c = mix(c, uLight, smoothstep(0.00, 0.10, t));
  c = mix(c, uMid,   smoothstep(0.08, 0.24, t));
  c = mix(c, uDeep,  smoothstep(0.22, 0.50, t));
  c = mix(c, uFar,   smoothstep(0.62, 0.88, t));
  return c;
}

void main(){
  // 0 di garis air, 1 di cakrawala
  float t = clamp((uWaterline - vW.z) / 260.0, 0.0, 1.0);

  // tepi pita bergelombang pelan — inti tampilan ilustrasi
  float wob =
      sin(vW.x * 0.030 + uTime * 0.22) * 0.020 +
      sin(vW.x * 0.009 - uTime * 0.15) * 0.030 +
      sin(vW.x * 0.070 + uTime * 0.33) * 0.008;
  float tb = clamp(t + wob, 0.0, 1.0);

  // dijenjangkan jadi 7 pita: lebih rapat di dekat pantai
  float steps = 7.0;
  float q = floor(pow(tb, 0.78) * steps) / steps;
  vec3 col = ramp(q);

  // garis buih tipis di setiap batas pita
  float edgeDist = fract(pow(tb, 0.78) * steps);
  float seam = 1.0 - smoothstep(0.0, 0.045, edgeDist);
  col = mix(col, uFoam, seam * 0.5);

  // kilau di puncak ombak — halus, tidak menggumpal
  col = mix(col, uFoam, smoothstep(0.72, 0.98, vH) * 0.35);

  // bibir buih di garis air — sempit, tepinya tegas, maju–mundur
  float lip = uWaterline
            + sin(uTime * 0.45) * 1.3
            + sin(vW.x * 0.045 + uTime * 0.30) * 1.0
            + sin(vW.x * 0.017 - uTime * 0.20) * 0.8;
  float shore = smoothstep(lip - 1.8, lip - 0.9, vW.z);
  col = mix(col, uFoam, shore * 0.95);

  // satu garis buih tipis lagi sedikit di luar bibir — ombak yang baru pecah
  float second = smoothstep(lip - 7.5, lip - 6.6, vW.z) * (1.0 - smoothstep(lip - 6.6, lip - 5.4, vW.z));
  col = mix(col, uFoam, second * 0.55);

  // menyatu ke langit di kejauhan
  col = mix(col, uHorizon, smoothstep(0.80, 1.0, t) * 0.9);

  gl_FragColor = vec4(toSRGB(col), 1.0);
}
`;

function Sea({ seg, waktu }: { seg: number; waktu: Waktu }) {
  /**
   * Warna awal diambil dari palet, BUKAN dibiarkan kosong.
   *
   * `new THREE.Color()` tanpa argumen itu PUTIH. Dulu semua uniform di sini
   * dibuat begitu, dengan anggapan `useFrame` di bawah akan segera menggeser-
   * nya ke warna yang benar. Anggapan itu punya syarat yang tidak selalu
   * terpenuhi: gelung render harus jalan. Kalau Olen membuka halaman ini di
   * tab yang tidak sedang dilihat, browser menghentikan requestAnimationFrame
   * — dan waktu ia berpindah ke tab itu, yang ia lihat adalah laut PUTIH,
   * karena tidak pernah ada satu frame pun untuk menggesernya.
   *
   * Ketahuan waktu menyiapkan design system: tab pemeriksaan kena throttle
   * Chrome, dan lautnya putih selama tiga puluh detik.
   *
   * Warna yang benar sudah diketahui di sini, saat ini juga. Jadi tidak ada
   * alasan memulainya dari warna lain lalu berharap. `useFrame` di bawah
   * tetap berguna — tugasnya sekarang cuma satu: menghaluskan PERGANTIAN
   * waktu, bukan menambal keadaan awal.
   */
  const uniforms = useMemo(
    () => {
      const p = PALET[waktu].laut;
      return {
        uTime: { value: 0 },
        uWaterline: { value: WATERLINE },
        uShallow: { value: new THREE.Color(p.shallow) },
        uLight: { value: new THREE.Color(p.light) },
        uMid: { value: new THREE.Color(p.mid) },
        uDeep: { value: new THREE.Color(p.deep) },
        uFar: { value: new THREE.Color(p.far) },
        uFoam: { value: new THREE.Color(p.foam) },
        uHorizon: { value: new THREE.Color(PALET[waktu].cakrawala) },
      };
    },
    // sengaja sekali saja: sesudah ini `useFrame` yang memegang warnanya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Warna laut BERGESER PELAN ke palet waktu yang baru, tidak melompat.
   *
   * Kalau uniform-nya diganti langsung, peralihan siang → sore terjadi dalam
   * satu frame dan terlihat seperti berkas gambar yang ditukar. Diinterpolasi
   * selama ± 1,5 detik, peralihannya terbaca sebagai cahaya yang berubah.
   */
  const tuju = useMemo(() => PALET[waktu], [waktu]);
  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    const k = Math.min(1, dt * 0.7);
    uniforms.uShallow.value.lerp(new THREE.Color(tuju.laut.shallow), k);
    uniforms.uLight.value.lerp(new THREE.Color(tuju.laut.light), k);
    uniforms.uMid.value.lerp(new THREE.Color(tuju.laut.mid), k);
    uniforms.uDeep.value.lerp(new THREE.Color(tuju.laut.deep), k);
    uniforms.uFar.value.lerp(new THREE.Color(tuju.laut.far), k);
    uniforms.uFoam.value.lerp(new THREE.Color(tuju.laut.foam), k);
    uniforms.uHorizon.value.lerp(new THREE.Color(tuju.cakrawala), k);
  });

  // z dunia: 28 … -252
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -112]}>
      <planeGeometry args={[620, 280, seg, seg]} />
      <shaderMaterial vertexShader={seaVert} fragmentShader={seaFrag} uniforms={uniforms} />
    </mesh>
  );
}

/* ═══════════════════════ pasir ═══════════════════════ */

const sandVert = /* glsl */ `
varying vec3 vW;
varying vec3 vN;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const sandFrag = /* glsl */ `
// Konversi linear → sRGB ditulis sendiri. Memakai #include <colorspace_fragment>
// milik three sempat bentrok dengan fungsi yang sudah disuntikkan lebih dulu
// ('LinearTransferOETF : function already has a body'), jadi jangan dipakai lagi.
vec3 toSRGB(vec3 c){
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0/2.4)) - 0.055,
             step(vec3(0.0031308), c));
}
uniform vec3  uDry;
uniform vec3  uMid;
uniform vec3  uWet;
uniform float uTime;
uniform float uWaterline;
varying vec3  vW;
varying vec3  vN;

/* ── derau bertingkat ──
   Versi lama cuma punya satu lapis hash per piksel. Hash murni tidak punya
   bentuk: dari dekat jadi semut TV, dari jauh jadi kerlip. Pasir sungguhan
   punya bercak besar (lembap/kering), guratan sedang (bekas angin), lalu
   butiran halus. Tiga skala itu yang dibangun di sini. */
float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);       // interpolasi halus, bukan lompatan
  return mix(mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main(){
  // 0 tepat di garis air, 1 jauh ke arah penonton
  float t = clamp((vW.z - uWaterline) / 46.0, 0.0, 1.0);
  float d = length(cameraPosition - vW);

  vec3 col = mix(uWet, uMid, smoothstep(0.02, 0.16, t));
  col = mix(col, uDry, smoothstep(0.14, 0.5, t));

  // ── bercak besar: pasir tidak pernah satu warna ──
  // 0.19 → satu bercak ± 5 satuan. Sempat 0.055 (± 18 satuan): lebih lebar
  // daripada seluruh pantai yang terlihat, jadi terbaca sebagai gradien rata.
  float bercak = fbm(vW.xz * 0.19);
  col = mix(col * 0.82, col * 1.12, bercak);
  // sebagian bercak condong hangat, sebagian condong dingin — ini yang
  // bikin matanya membaca "ada bahannya", bukan bidang cat
  col = mix(col, col * vec3(1.12, 0.98, 0.82), smoothstep(0.5, 0.85, bercak) * 0.75);
  col = mix(col, col * vec3(0.88, 0.94, 1.06), smoothstep(0.5, 0.12, bercak) * 0.6);

  // ── guratan angin: alur sedang yang mengikuti lengkung pantai ──
  float streak = fbm(vec2(vW.x * 0.22, vW.z * 1.4) + bercak * 1.5);
  col *= 0.90 + streak * 0.20;

  // bibir ombak yang sama persis dengan yang di laut
  float lip = uWaterline
            + sin(uTime * 0.45) * 1.3
            + sin(vW.x * 0.045 + uTime * 0.30) * 1.0
            + sin(vW.x * 0.017 - uTime * 0.20) * 0.8;

  /* Lebar pita basah & buih ini yang dulu menghabiskan seluruh pantai.
     Yang terlihat kamera cuma z ≈ 28…38 — sepuluh satuan. Dengan basah
     sampai lip+7 dan buih sampai lip+2.2, tujuh satuan pertama sudah habis
     jadi putih, dan tekstur sebagus apa pun tidak punya tempat untuk muncul.
     Sekarang: buih ±1 satuan, basah ±3, sisanya pasir kering. */
  col = mix(uWet * 0.88, col, smoothstep(lip + 0.3, lip + 3.0, vW.z));

  // ── riak: paling tegas di pasir basah, memudar ke pasir kering ──
  float wet = 1.0 - smoothstep(lip + 0.8, lip + 6.0, vW.z);
  float ripple = sin(vW.z * 3.4 + sin(vW.x * 0.11) * 2.4 + bercak * 4.0) * 0.5 + 0.5;
  ripple = pow(ripple, 1.6);
  col *= 1.0 + (ripple - 0.5) * (0.09 + wet * 0.13);

  // buih menjilat naik ke pasir — inilah yang menghapus garis lurus laut–pasir
  float foam = 1.0 - smoothstep(lip + 0.1, lip + 1.1, vW.z);
  col = mix(col, vec3(1.0), foam * 0.92);

  // ── butiran: hanya dekat kamera. Kalau dipaksa sampai jauh, yang muncul
  //    bukan tekstur melainkan kerlip — persis cacat versi sebelumnya. ──
  float dekat = 1.0 - smoothstep(18.0, 75.0, d);
  float g1 = hash(floor(vW.xz * 26.0));
  float g2 = hash(floor(vW.xz * 61.0) + 7.3);
  col *= 1.0 + ((g1 * 0.6 + g2 * 0.4) - 0.5) * 0.26 * dekat;

  // serpih kerang: bintik terang yang jarang, memberi kesan butir kasar
  float fleck = step(0.972, hash(floor(vW.xz * 14.0) + 31.7));
  col = mix(col, vec3(1.0, 0.97, 0.92), fleck * 0.5 * dekat);
  // dan bintik gelap: butir mineral. Dua arah, bukan cuma menerangkan.
  float mineral = step(0.982, hash(floor(vW.xz * 19.0) + 88.1));
  col = mix(col, col * 0.62, mineral * 0.55 * dekat);

  // pantulan lembut dari langit di permukaan yang basah
  col += vec3(0.03, 0.05, 0.07) * wet * max(0.0, vN.y) * 0.6;

  // sedikit lebih terang mendekati penonton, biar ada kedalaman
  col *= 0.94 + t * 0.10;

  gl_FragColor = vec4(toSRGB(clamp(col, 0.0, 1.0)), 1.0);
}
`;

function Shore({ waktu }: { waktu: Waktu }) {
  // setelah rotasi -90° di sumbu X: (x, y, z) lokal → (x, z, -y) dunia.
  // setZ di sini = ketinggian pasir di dunia.
  //
  // Tingginya diambil dari `sandAt` di world.ts — SATU sumber, dipakai juga
  // oleh tikar, bintang laut, kepiting, dan flamingo. Dulu rumusnya ditulis
  // dua kali dan sempat berbeda; itu sebabnya tikarnya terbenam sebelah.
  //
  // Bidangnya membentang z = 20 … 84. Dulu mulai dari 24; digeser lebih ke
  // laut supaya pasir yang menukik curam di bawah garis air punya tempat.
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(620, 64, 200, 52);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      p.setZ(i, sandAt(p.getX(i), 52 - p.getY(i)));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  /* Warna awal dari palet, bukan putih — alasan lengkapnya di Sea() di atas. */
  const uniforms = useMemo(
    () => {
      const p = PALET[waktu].pasir;
      return {
        uTime: { value: 0 },
        uWaterline: { value: WATERLINE },
        uDry: { value: new THREE.Color(p.dry) },
        uMid: { value: new THREE.Color(p.mid) },
        uWet: { value: new THREE.Color(p.wet) },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const tuju = useMemo(() => PALET[waktu].pasir, [waktu]);
  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    const k = Math.min(1, dt * 0.7);
    uniforms.uDry.value.lerp(new THREE.Color(tuju.dry), k);
    uniforms.uMid.value.lerp(new THREE.Color(tuju.mid), k);
    uniforms.uWet.value.lerp(new THREE.Color(tuju.wet), k);
  });

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 52]}>
      <shaderMaterial vertexShader={sandVert} fragmentShader={sandFrag} uniforms={uniforms} />
    </mesh>
  );
}

/* ═══════════════════════ awan ═══════════════════════ */

const AWAN = [
  { x: -150, y: 40, z: -150, s: 9.5, sp: 0.9, bentuk: 0 },
  { x: -78, y: 66, z: -215, s: 14, sp: 0.42, bentuk: 1 },
  { x: -26, y: 32, z: -132, s: 7, sp: 1.25, bentuk: 1 },
  { x: 52, y: 74, z: -248, s: 16, sp: 0.34, bentuk: 0 },
  { x: 108, y: 36, z: -158, s: 8, sp: 1.05, bentuk: 0 },
  { x: 172, y: 57, z: -196, s: 12, sp: 0.55, bentuk: 1 },
];

function AwanHanyut({ c, waktu }: { c: (typeof AWAN)[0]; waktu: Waktu }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    o.position.x += dt * c.sp;
    if (o.position.x > 230) o.position.x = -230;
    o.position.y = c.y + Math.sin(performance.now() * 0.00013 + c.x) * 0.9;
  });
  return (
    <group ref={g} position={[c.x, c.y, c.z]} scale={c.s}>
      <Awan
        bentuk={c.bentuk}
        warna={PALET[waktu].awan.warna}
        pijar={PALET[waktu].awan.pijar}
        kuat={PALET[waktu].awan.kuat}
      />
    </group>
  );
}

/* ═══════════════════════ perjalanan paus ═══════════════════════ */

/**
 * Bentuk pausnya ada di assets/Paus.tsx. Di sini hanya PERJALANANNYA.
 *
 * ── Tiga versi yang gagal, supaya tidak diulang ──
 *   v1  naik lurus lalu dijatuhkan (-dive² × 14). Terbaca seperti benda
 *       dilempar, bukan hewan menyelam.
 *   v2  menyelam tegak dengan ekor terangkat. Anatominya benar, tapi dari
 *       samping yang tersisa cuma batang ekor — sebilah papan biru.
 *   v3  menyelam sambil berputar terlalu jauh, lalu `visible = false` di
 *       tengah jalan. Keluhan Yaya persis: "kayak kebalik terus ngilang,
 *       dan di akhir belum sepenuhnya tenggelam".
 *
 * Yang dipakai sekarang: paus tidak pernah berputar lebih dari 22°, dan
 * penghilangannya TIDAK ditentukan waktu melainkan oleh geometri — dihitung
 * dari `pausPuncak()`, titik tertinggi badan pada kemiringan saat itu. Paus
 * baru boleh hilang setelah titik itu benar-benar di bawah permukaan air.
 */
const PAUS = { z: -84, skala: 5.6, x0: -76, x1: -30, siklus: 30 };

function PausBerenang() {
  const grp = useRef<THREE.Group>(null);
  /* Objek yang dimutasi tiap frame dan dibaca langsung oleh asetnya — BUKAN
     useState. Lihat catatan PausKendali di assets/Paus.tsx. */
  const kendali = useRef<PausKendali>({ spout: 0 }).current;
  const cepat = useMemo(
    () => typeof window !== "undefined" && window.location.search.includes("cepat"),
    []
  );

  /**
   * ═══ Lintasan paus, sebagai SATU kurva ═══
   *
   * Ini perubahan yang paling menentukan, dan tiga versi sebelumnya semuanya
   * gagal karena hal yang sama: TINGGI dan KEMIRINGAN diatur terpisah.
   * Tingginya dari satu rumus, miringnya dari rumus lain, dan keduanya
   * kebetulan-kebetulan cocok. Begitu tidak cocok, pausnya bergerak ke satu
   * arah sambil menghadap ke arah lain — dan itulah yang terbaca sebagai
   * "kaku" dan "aneh waktu turun".
   *
   * Sekarang cuma ada SATU sumber kebenaran: lintasan `tinggiDi(k)`.
   * Kemiringannya diturunkan dari kemiringan lintasan itu sendiri —
   * arah hadap = arah gerak, seperti makhluk hidup mana pun.
   *
   * Bentuk lintasannya: naik dari dalam, menyembul, meluncur panjang di
   * permukaan, lalu menukik turun. Bagian turunnya sengaja lebih panjang
   * daripada naiknya — hewan menyelam itu meluncur, tidak jatuh.
   */
  /**
   * ═══ SAMBUNGAN ANTAR BABAK HARUS MULUS, DAN DULU TIDAK ═══
   *
   * Lintasan ini punya tiga babak. Yang menentukan bukan bentuk tiap babak,
   * melainkan apa yang terjadi TEPAT DI SAMBUNGANNYA. Diukur pada versi
   * sebelumnya:
   *
   *     k = 0,22   nilai 2,4000 → 2,4000   (nyambung)
   *                laju  2,76   → 10,68    (melompat hampir 4x)
   *
   *     k = 0,62   nilai 1,5916 → 2,4000   (LOMPAT 0,81 satuan)
   *                laju  3,17   → −1,24
   *
   * Lompatan 0,81 satuan itu dikali skala paus 5,6 menjadi sekitar 4,5 satuan
   * dunia dalam SATU bingkai: pausnya benar-benar berpindah tempat seketika di
   * tengah luncuran. Itulah "patah di tengah" yang terlihat.
   *
   * Sebabnya babak permukaan memakai `sin(u · π · 1,6)`. Faktor 1,6 bukan
   * kelipatan bulat, jadi di u = 1 gelombangnya berhenti di tengah ayunan —
   * bukan di nol. Babak berikutnya memulai dari 2,4, dan selisihnya jadi
   * lompatan.
   *
   * Perbaikannya bukan menggeser angka sampai kelihatan benar, melainkan
   * memakai bentuk yang secara matematis WAJIB nol di kedua ujungnya:
   * gelombang penuh `sin(2πu)` dikalikan amplop `sin(πu)`. Keduanya nol di
   * u = 0 dan u = 1, dan karena hasil kalinya, LAJUNYA pun nol di sana
   * (aturan perkalian turunan: kedua sukunya lenyap).
   *
   * Hasilnya keempat sambungan menyambung pada nilai maupun laju. Tidak ada
   * satu pun angka yang perlu disetel dengan mata.
   */
  const tinggiDi = useMemo(() => {
    const halus = (a: number) => a * a * (3 - 2 * a);
    return (k: number) => {
      if (k < 0.22) {
        // naik dari kedalaman ke permukaan; halus() sudah berlaju nol di ujung
        return -20 + halus(k / 0.22) * 22.4;
      }
      if (k < 0.62) {
        // meluncur di permukaan, satu ayunan penuh yang diamplop supaya
        // berangkat dan berakhir tepat di 2,4 dengan laju nol
        const u = (k - 0.22) / 0.4;
        return 2.4 + Math.sin(u * Math.PI * 2) * Math.sin(Math.PI * u) * 1.15;
      }
      // menukik turun, makin lama makin dalam
      const u = (k - 0.62) / 0.38;
      return 2.4 - halus(u) * 30;
    };
  }, []);

  useFrame(() => {
    const o = grp.current;
    if (!o) return;
    const siklus = cepat ? 9 : PAUS.siklus;
    const t = (performance.now() * 0.001) % siklus;
    const k = Math.min(1, Math.max(0, (t - siklus * 0.08) / (siklus * 0.76)));
    const seg = (a: number, b: number) => Math.min(1, Math.max(0, (k - a) / (b - a)));

    const y = tinggiDi(k);
    const x = PAUS.x0 + k * (PAUS.x1 - PAUS.x0);

    /**
     * Kemiringan = arah lintasan, bukan angka terpisah.
     *
     * dy/dx dihitung numerik dari kurva yang sama. Dikalikan 0.055 karena
     * lintasannya jauh lebih curam daripada sudut badan yang enak dilihat:
     * paus yang turun 30 satuan sambil maju 46 akan menukik 33° kalau
     * mengikuti lintasan mentah, dan pada sudut itu siluetnya berhenti
     * terbaca sebagai punggung. Dibatasi ±20°.
     */
    const dk = 0.004;
    const dy = tinggiDi(Math.min(1, k + dk)) - tinggiDi(Math.max(0, k - dk));
    const dx = (PAUS.x1 - PAUS.x0) * dk * 2;
    const miring = Math.max(-0.35, Math.min(0.35, Math.atan2(dy, dx) * 0.055 * 8));

    o.position.set(x, y, PAUS.z);
    o.rotation.set(0, 0.3, miring);

    // Hilang HANYA kalau seluruh badan sudah di bawah air (y = 0).
    const puncak = y + pausPuncak(miring) * PAUS.skala;
    o.visible = k > 0.01 && k < 0.999 && puncak > -1;

    kendali.spout = Math.max(0, Math.sin(seg(0.28, 0.48) * Math.PI) ** 1.3);
  });

  return (
    <group ref={grp} position={[PAUS.x0, -30, PAUS.z]} scale={PAUS.skala} visible={false}>
      <Paus animate={false} kendali={kendali} />
    </group>
  );
}

/* ═══════════════════════ kamera ═══════════════════════ */

/**
 * ═══ DRIFT — kamera mengikuti perhatian ═══
 *
 * Di desktop: kamera menggeser sedikit mengikuti tetikus, jadi pemandangannya
 * terasa punya ruang alih-alih seperti gambar tempel.
 *
 *
 * ── DI HP IA MATI TOTAL, DAN ITU BARU KETAHUAN 31 AGUSTUS ──
 *
 * Ia hanya mendengarkan `pointermove`, yang di layar sentuh tidak pernah
 * terjadi tanpa jari menempel. Jadi selama ini di HP kameranya benar-benar
 * diam — dan justru di HP-lah geser itu paling berguna, karena pandangannya
 * paling sempit dan paling banyak yang di luar layar.
 *
 * Sekarang jari bisa MENYERET pantainya ke kiri dan kanan. Bukan sekadar
 * memindahkan sentuhan ke rumus yang sama: menyeret berarti pemandangan ikut
 * sejauh jarinya bergerak, lalu BERHENTI di situ — bukan kembali ke tengah
 * begitu jari diangkat. Kembali sendiri akan terasa seperti melawan.
 *
 * Batasnya diikat ke seberapa tegak layarnya. Di layar lebar hampir semua
 * sudah terlihat, jadi geserannya cukup sehalus parallaks; di layar tegak
 * ia perlu benar-benar bisa menjangkau tepi pantai.
 */
const GESER_TEGAK = 7.5;

function Drift() {
  const { camera, size, gl } = useThree();
  const aim = useRef({ x: 0, y: 0 });
  /** Geseran hasil seretan jari, dalam satuan dunia. Menetap. */
  const seret = useRef(0);

  useEffect(() => {
    const on = (e: PointerEvent) => {
      /* Sentuhan tidak ikut jalur ini — jari yang menempel di layar akan
         memancarkan pointermove juga, dan kalau keduanya dipakai bersamaan
         kameranya melompat dua kali untuk satu gerakan yang sama. */
      if (e.pointerType === "touch") return;
      aim.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      aim.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  /* ── seret jari ── */
  useEffect(() => {
    const el = gl.domElement;
    let aktif = false;
    let mulaiX = 0;
    let mulaiSeret = 0;

    const batas = () => GESER_TEGAK * tegaknya(size.width / Math.max(1, size.height));

    const turun = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      aktif = true;
      mulaiX = e.clientX;
      mulaiSeret = seret.current;
      /* Memberi tahu lapisan DOM bahwa jari sudah menyentuh, supaya petunjuk
         gesernya bisa pergi. Lewat peristiwa, bukan prop: kanvas ini ada di
         dalam Canvas three, sedangkan petunjuknya HTML biasa di luar sana. */
      window.dispatchEvent(new CustomEvent("olen:geser"));
    };
    const gerak = (e: PointerEvent) => {
      if (!aktif) return;
      /* Sepertiga lebar layar = geser penuh dari tengah ke tepi. Lebih peka
         dari itu terasa liar; kurang dari itu terasa berat. */
      const per = (batas() * 2) / (window.innerWidth / 1.5);
      const b = batas();
      seret.current = Math.max(-b, Math.min(b, mulaiSeret - (e.clientX - mulaiX) * per));
    };
    const naik = () => {
      aktif = false;
    };

    el.addEventListener("pointerdown", turun, { passive: true });
    el.addEventListener("pointermove", gerak, { passive: true });
    el.addEventListener("pointerup", naik, { passive: true });
    el.addEventListener("pointercancel", naik, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", turun);
      el.removeEventListener("pointermove", gerak);
      el.removeEventListener("pointerup", naik);
      el.removeEventListener("pointercancel", naik);
    };
  }, [gl, size.width, size.height]);

  useFrame((_, dt) => {
    const t = performance.now() * 0.001;
    const k = Math.min(1, dt * 1.2);
    const wantX = aim.current.x * 1.3 + seret.current + Math.sin(t * 0.12) * 0.5;
    const wantY = 6.5 + aim.current.y * 0.45 + Math.sin(t * 0.18) * 0.2;
    camera.position.x += (wantX - camera.position.x) * k;
    camera.position.y += (wantY - camera.position.y) * k;
    camera.lookAt(camera.position.x * 0.45, -18, -128);
  });

  return null;
}

/* ═══ BINGKAI — menyesuaikan pemandangan dengan bentuk layar ═══
 *
 * `fov` di three.js adalah bidang pandang TEGAK; bidang mendatarnya ikut
 * nisbah layar. Dengan angka tetap `fov 46, z 48`, HP tegak hanya melihat
 * sekitar 22 derajat melintang lawan 74 derajat di desktop — seperempat
 * lebarnya. Tikar, keranjang, kepiting, dan flamingo semua di luar layar.
 *
 *
 * ── PERCOBAAN PERTAMA MENGEJAR LEBAR, DAN ITU PILIHAN YANG SALAH ──
 *
 * Versi sebelumnya mempertahankan lebar melintang dengan memundurkan kamera
 * sampai z = 72. Lebarnya memang kembali, tapi ongkosnya baru terlihat di
 * layar sungguhan: piknik ada di z ≈ 34, jadi jaraknya melar dari 14 satuan
 * (desktop) jadi 38. Semua bendanya tampil 2,7 kali lebih kecil, dan yang
 * dilaporkan justru "objek masih terlalu jauh".
 *
 * Yang salah bukan angkanya melainkan yang dikejar. Di layar selebar telapak
 * tangan, yang berharga bukan seberapa luas laut yang terlihat melainkan
 * seberapa terbaca benda-bendanya. Melihat pantai yang lapang tapi semua
 * isinya sebesar kuku bukan kemenangan.
 *
 *
 * ── YANG DIKEJAR SEKARANG: JARAK KE SUBJEK ──
 *
 * Isi pantai membentang dari x = −9 (tepi tikar) sampai x = +10,5 (flamingo).
 * Jadi yang dibutuhkan cuma setengah-lebar 12, bukan 36 seperti desktop.
 * Terukur:
 *
 *     desktop 16:9   fov 46  z 48   jarak 14,0   setengah-lebar 36,2
 *     HP (dulu)      fov 64  z 72   jarak 38,0   setengah-lebar 20,8
 *     HP (sekarang)  fov 64  z 44   jarak 10,0   setengah-lebar 12,7
 *
 * Di HP kamera justru berdiri LEBIH DEKAT daripada di desktop, dan fov yang
 * melebar mengurus lebarnya. Hasilnya bendanya sekitar 40 persen lebih besar
 * daripada di desktop — sepadan, karena layarnya jauh lebih kecil.
 *
 * FOV_MAKS 64 tetap jadi rem: di atas itu benda di tepi layar mulai
 * menjulur dan terbaca sebagai lensa lebar, bukan sebagai "lebih banyak yang
 * terlihat".
 *
 * Aman berdampingan dengan `Drift`: Drift hanya menyentuh position.x dan .y.
 */
const FOV_DASAR = 46;
const NISBAH_DASAR = 16 / 9;
const Z_DASAR = 48;
const FOV_MAKS = 64;
/**
 * Jarak kamera di layar paling tegak.
 *
 * Diturunkan dari RAPAT, bukan dipilih. Dengan isi pantai dirapatkan 0,45,
 * batas terjauhnya jadi |−5,6 × 0,45| + 3,3 (separuh lebar tikar) = 5,82,
 * dan setengah-lebar pandangan di bidang piknik adalah
 * (z − 34) × tan(32°) × nisbah. Menyamakan keduanya memberi z ≈ 54.
 *
 * Dua percobaan sebelumnya masing-masing gagal di satu sisi:
 *     z 72  → semuanya muat, tapi bendanya 0,38× ukuran desktop
 *     z 44  → bendanya besar, tapi cuma 27% isinya muat
 * z 54 dengan rapat 0,45 memberi 0,69× dan tidak ada yang terpotong.
 */
/*
 * Didekatkan lagi dari 57 ke 52 atas permintaan pemilik, dan itu boleh
 * sekarang karena ada geser jari: tidak semuanya harus muat sekaligus.
 * Setengah-lebar tersedia jadi 5,20 lawan 6,66 yang dibutuhkan — sekitar
 * 78 persen isi pantai terlihat langsung, sisanya dijangkau dengan menyeret.
 * Ongkosnya terbayar: benda naik dari 0,61x jadi 0,78x ukuran desktop.
 */
const Z_TEGAK = 52;

/**
 * Seberapa dirapatkan isi pantai di layar paling tegak. Mengalikan KOORDINAT
 * benda, bukan ukurannya — lihat catatan panjang di beach.tsx.
 */
export const RAPAT_TEGAK = 0.6;
/** Nisbah tempat penyesuaiannya sudah mentok — kira-kira HP tegak. */
const NISBAH_SEMPIT = 0.5;

/**
 * Seberapa tegak layarnya: 0 selebar desktop, 1 setegak HP.
 *
 * SATU fungsi, dipakai kamera DAN perapatan isi pantai. Kalau keduanya
 * menghitung sendiri-sendiri, cukup satu diubah dan komposisinya langsung
 * meleset — jarak kamera dan kerapatan benda adalah dua besaran yang saling
 * terikat, dan aturan proyek ini jelas: kalau sebuah angka bisa diturunkan
 * dari angka lain, turunkan.
 *
 * Smoothstep supaya layar di antaranya — tablet, jendela setengah — berubah
 * halus dan tidak ada ukuran tertentu yang jadi patahan.
 */
function tegaknya(nisbah: number): number {
  const x = Math.min(1, Math.max(0, (NISBAH_DASAR - nisbah) / (NISBAH_DASAR - NISBAH_SEMPIT)));
  return x * x * (3 - 2 * x);
}

function Bingkai() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = tegaknya(size.width / Math.max(1, size.height));
    cam.fov = FOV_DASAR + (FOV_MAKS - FOV_DASAR) * t;
    cam.position.z = Z_DASAR + (Z_TEGAK - Z_DASAR) * t;
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

/** Pantai yang isinya dirapatkan sesuai tegaknya layar. */
function PantaiSesuaiLayar() {
  const { size } = useThree();
  const t = tegaknya(size.width / Math.max(1, size.height));
  return <Beach rapat={1 + (RAPAT_TEGAK - 1) * t} />;
}

/* ═══════════════════════ ekspor ═══════════════════════ */

function Cahaya({ waktu, jam }: { waktu: Waktu; jam: number }) {
  const amb = useRef<THREE.AmbientLight>(null);
  const utama = useRef<THREE.DirectionalLight>(null);
  const isi = useRef<THREE.DirectionalLight>(null);
  const p = PALET[waktu].cahaya;

  // Lampu ikut bergeser pelan, sama seperti warna laut dan pasir. Kalau
  // lampunya melompat sementara lautnya bergeser halus, peralihannya justru
  // makin terasa patah daripada kalau semuanya melompat sekaligus.
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 0.7);
    if (amb.current) amb.current.intensity += (p.ambient - amb.current.intensity) * k;
    if (utama.current) {
      utama.current.intensity += (p.utama.kuat - utama.current.intensity) * k;
      utama.current.color.lerp(new THREE.Color(p.utama.warna), k);
      // Arah cahaya datang DARI benda langitnya, bukan dari titik tetap.
      // Kalau lampunya diam sementara mataharinya bergerak, bayangan dan sisi
      // terang benda-benda di pantai tidak cocok dengan langitnya — itu yang
      // membuat pemandangan terasa "digambar", bukan disinari.
      const sumber = tinggiMatahari(jam) > 0.05 ? posisiMatahari(jam) : posisiBulan(jam);
      utama.current.position.lerp(
        new THREE.Vector3(sumber[0] * 0.6, Math.max(sumber[1], 14), sumber[2] * 0.25),
        k
      );
    }
    if (isi.current) {
      isi.current.intensity += (p.isi.kuat - isi.current.intensity) * k;
      isi.current.color.lerp(new THREE.Color(p.isi.warna), k);
      isi.current.position.lerp(new THREE.Vector3(...p.isi.pos), k);
    }
  });

  return (
    <>
      <ambientLight ref={amb} intensity={p.ambient} />
      <directionalLight ref={utama} position={p.utama.pos} intensity={p.utama.kuat} color={p.utama.warna} />
      <directionalLight ref={isi} position={p.isi.pos} intensity={p.isi.kuat} color={p.isi.warna} />
    </>
  );
}

export default function OpeningScene({
  quality,
  waktu,
  jam,
}: {
  quality: "low" | "high";
  waktu: Waktu;
  /** jam pecahan 0–24; menentukan letak matahari dan bulan di busurnya */
  jam: number;
}) {
  const seg = quality === "high" ? 220 : 100;
  return (
    <Canvas
      dpr={quality === "high" ? [1, 2] : [1, 1.5]}
      camera={{ position: [0, 6.5, 48], fov: 46, near: 0.1, far: 700 }}
      gl={{ antialias: quality === "high", alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Cahaya waktu={waktu} jam={jam} />
      <ShaderCheck />
      <Bingkai />
      <Drift />
      <Bintang tampil={PALET[waktu].bintang > 0} />
      <Surya waktu={waktu} jam={jam} />
      {AWAN.map((c, i) => (
        <AwanHanyut key={i} c={c} waktu={waktu} />
      ))}
      <Sea seg={seg} waktu={waktu} />
      <Shore waktu={waktu} />
      <PausBerenang />
      <PantaiSesuaiLayar />
    </Canvas>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { journey, samplePath, phase, lerp } from "@/lib/journey";

/* ══════════════════════════════ Kamera ══════════════════════════════ */

function Rig({ quality }: { quality: "low" | "high" }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 2, 0));
  const pos = useRef(new THREE.Vector3(0, 2.4, 26));

  useFrame((_, dt) => {
    journey.tick(Math.min(dt, 0.05));
    const t = journey.value;
    const { pos: p, look: l } = samplePath(t);

    // parallax halus dari pointer / gyro
    const sway = quality === "high" ? 1 : 0.4;
    pos.current.set(p[0] + journey.px * 0.9 * sway, p[1] + journey.py * 0.45 * sway, p[2]);
    look.current.set(l[0] + journey.px * 1.6 * sway, l[1] - journey.py * 0.9 * sway, l[2]);

    camera.position.lerp(pos.current, 0.16);
    camera.lookAt(look.current);

    const ph = phase(t);
    const persp = camera as THREE.PerspectiveCamera;
    const targetFov = lerp(52, 64, ph.underwater);
    persp.fov += (targetFov - persp.fov) * 0.06;
    persp.updateProjectionMatrix();
  });
  return null;
}

/* ══════════════════════════ Kabut & warna dunia ══════════════════════════ */

const C = {
  nightSkyTop: new THREE.Color("#010610"),
  nightSkyLow: new THREE.Color("#061428"),
  seaDeep: new THREE.Color("#0B1E3C"),
  seaMid: new THREE.Color("#0E2848"),
  seaNear: new THREE.Color("#102D52"),
  under: new THREE.Color("#04101f"),
  dawnWarm: new THREE.Color("#E8A87C"),
  dawnSky: new THREE.Color("#123a5e"),
  gold: new THREE.Color("#F4E4B0"),
  sandNight: new THREE.Color("#16283f"),
};

function Atmosphere() {
  const { scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2("#061428", 0.02), []);
  const col = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    scene.fog = fog;
    scene.background = new THREE.Color("#010610");
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(() => {
    const ph = phase(journey.value);
    col.copy(C.nightSkyLow).lerp(C.under, ph.underwater);
    col.lerp(C.dawnSky, ph.dawn * 0.75);
    fog.color.copy(col);
    fog.density = lerp(0.016, 0.062, ph.underwater) * (1 - ph.dawn * 0.45);
    (scene.background as THREE.Color).copy(col).multiplyScalar(0.7);
  });
  return null;
}

/* ══════════════════════════════ Laut ══════════════════════════════ */

const oceanVert = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNrm;
varying float vFoam;

float h(vec2 p, float t){
  float v = 0.0;
  v += sin(p.x * 0.11 + t * 0.55) * 0.60;
  v += sin(p.y * 0.16 - t * 0.44) * 0.44;
  v += sin((p.x * 0.29 + p.y * 0.20) + t * 0.92) * 0.22;
  v += sin((p.x * 0.61 - p.y * 0.45) + t * 1.55) * 0.085;
  v += sin((p.x * 1.20 + p.y * 0.95) + t * 2.30) * 0.030;
  return v;
}

void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec2 p  = wp.xz;
  float e = 0.9;

  // makin dekat pantai (z besar) amplitudo makin kecil — air jadi dangkal
  float shore = smoothstep(30.0, 6.0, wp.z);
  float amp   = mix(0.16, 1.0, clamp((20.0 - wp.z) / 45.0, 0.0, 1.0));

  float c = h(p, uTime) * amp;
  float hx = h(p + vec2(e, 0.0), uTime) * amp;
  float hz = h(p + vec2(0.0, e), uTime) * amp;

  wp.y += c;
  vNrm  = normalize(vec3(c - hx, e, c - hz));
  vWorld = wp.xyz;

  // busa di garis pantai: pita yang maju–mundur, bukan menggeser ke samping
  float band = 20.0 + sin(uTime * 0.62) * 1.6 + sin(uTime * 0.27) * 0.8;
  vFoam = smoothstep(band - 3.4, band, wp.z) * (1.0 - smoothstep(band, band + 2.2, wp.z));
  vFoam += smoothstep(0.55, 0.95, c / max(amp, 0.001)) * 0.25 * shore;

  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const oceanFrag = /* glsl */ `
uniform vec3  uDeep;
uniform vec3  uShallow;
uniform vec3  uGlow;
uniform float uUnder;
uniform float uDawn;
uniform float uTime;
varying vec3  vWorld;
varying vec3  vNrm;
varying float vFoam;

void main(){
  vec3 N = normalize(vNrm);
  vec3 V = normalize(cameraPosition - vWorld);
  if (!gl_FrontFacing) N = -N;

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  vec3 col = mix(uDeep, uShallow, fres * 0.85);

  // sorot bulan / matahari dari arah cakrawala
  vec3 L = normalize(vec3(0.0, 0.42, -1.0));
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 55.0);
  col += uGlow * spec * 1.1;

  // jalur cahaya di tengah air
  float lane = exp(-abs(vWorld.x) * 0.055);
  col += uGlow * lane * 0.055 * (0.55 + 0.45 * sin(vWorld.z * 0.42 + uTime * 0.9));

  // busa
  col = mix(col, vec3(0.72, 0.86, 1.0), clamp(vFoam, 0.0, 1.0) * 0.55);

  // fajar menghangatkan permukaan
  col = mix(col, col * vec3(1.35, 1.08, 0.86) + vec3(0.06, 0.03, 0.0), uDawn * 0.8);

  // dilihat dari bawah permukaan
  col = mix(col, uDeep * 0.30, uUnder);
  float a = mix(0.94, 0.42, uUnder);

  gl_FragColor = vec4(col, a);
}
`;

function Ocean({ quality }: { quality: "low" | "high" }) {
  const seg = quality === "high" ? 192 : 88;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: C.seaDeep.clone() },
      uShallow: { value: C.seaNear.clone() },
      uGlow: { value: C.gold.clone() },
      uUnder: { value: 0 },
      uDawn: { value: 0 },
    }),
    []
  );

  useFrame((_, dt) => {
    const ph = phase(journey.value);
    uniforms.uTime.value += dt;
    uniforms.uUnder.value += (ph.underwater - uniforms.uUnder.value) * 0.08;
    uniforms.uDawn.value += (ph.dawn - uniforms.uDawn.value) * 0.06;
    (uniforms.uGlow.value as THREE.Color).copy(C.gold).lerp(C.dawnWarm, ph.dawn);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -110]}>
      <planeGeometry args={[440, 300, seg, seg]} />
      <shaderMaterial
        vertexShader={oceanVert}
        fragmentShader={oceanFrag}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ═══════════════════════════ Dasar laut ═══════════════════════════ */

function Seabed() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -16, -70]}>
      <planeGeometry args={[400, 300, 1, 1]} />
      <meshBasicMaterial color="#03101f" />
    </mesh>
  );
}

/* ═══════════════════════════ Pasir pantai ═══════════════════════════ */

function Shore() {
  /**
   * Setelah rotasi -90° pada sumbu X, koordinat lokal (x, y, z) jatuh ke dunia
   * (x, z, -y). Jadi `setZ` di sini = ketinggian pasir di dunia.
   * Pasir naik menjauhi air: nol tepat di garis ombak (z dunia ≈ 20).
   */
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(440, 110, 72, 18);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const worldZ = 70 - y;
      const slope = (worldZ - 20) * 0.055;
      const bump = Math.sin(x * 0.045) * 0.34 + Math.cos(y * 0.1 + x * 0.02) * 0.22;
      p.setZ(i, slope + bump);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 70]}>
      <meshStandardMaterial color={C.sandNight} roughness={1} metalness={0} />
    </mesh>
  );
}

/* ═══════════════════════════ Bintang ═══════════════════════════ */

function StarField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const tint = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // kubah setengah bola di atas cakrawala
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 0.92 + 0.04);
      const r = 210 + Math.random() * 60;
      pos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i * 3 + 1] = Math.cos(ph) * r * 0.85 + 12;
      pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r - 60;
      size[i] = 0.7 + Math.random() * 2.4;
      tint[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSize; attribute float aTint;
        uniform float uTime;
        varying float vT; varying float vTw;
        void main(){
          vT = aTint;
          vTw = 0.45 + 0.55 * sin(uTime * (0.5 + aTint * 1.6) + aTint * 40.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        varying float vT; varying float vTw;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d);
          a *= a;
          vec3 warm = vec3(0.957, 0.894, 0.690);
          vec3 cool = vec3(0.910, 0.949, 1.0);
          vec3 col = mix(cool, warm, step(0.82, vT));
          gl_FragColor = vec4(col, a * vTw * uFade);
        }`,
    });
    return { geo: g, mat: m };
  }, [count]);

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
    const ph = phase(journey.value);
    const want = (1 - ph.underwater) * (1 - ph.dawn * 0.9);
    mat.uniforms.uFade.value += (want - mat.uniforms.uFade.value) * 0.05;
    if (ref.current) ref.current.rotation.y += dt * 0.004;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ═══════════════════════ Partikel bawah air ═══════════════════════ */

function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = -Math.random() * 16 - 0.5;
      pos[i * 3 + 2] = -Math.random() * 60 - 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      size: 0.09,
      color: new THREE.Color("#9fd8ff"),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo: g, mat: m };
  }, [count]);

  useFrame((_, dt) => {
    const ph = phase(journey.value);
    mat.opacity += (ph.underwater * 0.5 - mat.opacity) * 0.05;
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = p.getY(i) + dt * 0.25;
      if (y > -0.4) y = -16;
      p.setY(i, y);
    }
    p.needsUpdate = true;
    if (ref.current) ref.current.rotation.y += dt * 0.008;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ═════════════════════════ Bulan & fajar ═════════════════════════ */

function Luminary() {
  const moon = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const dawn = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const ph = phase(journey.value);
    const t = journey.value;
    const mm = moon.current, gg = glow.current, dd = dawn.current;
    if (mm) {
      mm.position.set(-38, 46 - t * 10, -170);
      (mm.material as THREE.MeshBasicMaterial).opacity = (1 - ph.underwater) * (1 - ph.dawn);
    }
    if (gg) {
      gg.position.set(-38, 46 - t * 10, -172);
      (gg.material as THREE.MeshBasicMaterial).opacity = 0.14 * (1 - ph.underwater) * (1 - ph.dawn);
    }
    if (dd) {
      dd.position.set(6, 2 + ph.dawn * 7, -190);
      (dd.material as THREE.MeshBasicMaterial).opacity = ph.dawn * 0.85;
      const s = 1 + ph.dawn * 0.4;
      dd.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      <mesh ref={moon}>
        <circleGeometry args={[5.4, 48]} />
        <meshBasicMaterial color="#FFFBE8" transparent opacity={1} />
      </mesh>
      <mesh ref={glow}>
        <circleGeometry args={[22, 48]} />
        <meshBasicMaterial color="#F4E4B0" transparent opacity={0.14} />
      </mesh>
      <mesh ref={dawn}>
        <circleGeometry args={[52, 48]} />
        <meshBasicMaterial color="#E8A87C" transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════ Dunia ══════════════════════════════ */

export default function World({ quality }: { quality: "low" | "high" }) {
  const high = quality === "high";
  return (
    <>
      <Rig quality={quality} />
      <Atmosphere />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-30, 30, -60]} intensity={0.5} color="#cfe6ff" />
      <StarField count={high ? 1400 : 600} />
      <Luminary />
      <Ocean quality={quality} />
      <Seabed />
      <Shore />
      <Motes count={high ? 420 : 160} />
    </>
  );
}

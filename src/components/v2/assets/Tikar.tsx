"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toonRamp } from "./kit";

/**
 * ═══ TIKAR PIKNIK ═══
 * Rebah di titik nol, y = 0 di permukaan kain. Ukuran `w` × `d`.
 *
 * Kain kotak-kotak dibangkitkan sekali sebagai tekstur kanvas. Ini
 * satu-satunya tempat gambar datar masih tepat di proyek ini, karena kainnya
 * memang datar.
 *
 * `lekuk` memberi tinggi tambahan per titik — scene memakainya untuk membuat
 * tikar mengikuti gundukan pasir. Tanpa itu tikar adalah bidang rata di atas
 * pasir yang miring, dan separuhnya terbenam.
 */

function clothTexture() {
  const n = 512;
  const c = document.createElement("canvas");
  c.width = n;
  c.height = n;
  const g = c.getContext("2d")!;
  g.fillStyle = "#F6F0E4";
  g.fillRect(0, 0, n, n);
  const cells = 8;
  const s = n / cells;
  g.fillStyle = "rgba(224,102,84,0.9)";
  for (let r = 0; r < cells; r++)
    for (let col = 0; col < cells; col++)
      if ((r + col) % 2 === 0) g.fillRect(col * s, r * s, s, s);
  g.globalAlpha = 0.35;
  g.fillStyle = "rgba(224,102,84,0.5)";
  for (let r = 0; r < cells; r++) g.fillRect(0, r * s + s * 0.45, n, s * 0.1);
  for (let col = 0; col < cells; col++) g.fillRect(col * s + s * 0.45, 0, s * 0.1, n);
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export default function Tikar({
  w = 6.6,
  d = 4.8,
  animate = true,
  lekuk,
}: {
  w?: number;
  d?: number;
  animate?: boolean;
  /** tinggi tambahan per titik kain, dari scene (mengikuti pasir) */
  lekuk?: Float32Array;
}) {
  const ramp = toonRamp();
  const cloth = useMemo(clothTexture, []);
  const mat = useMemo(
    () => new THREE.MeshToonMaterial({ map: cloth, gradientMap: ramp, side: THREE.DoubleSide }),
    [cloth, ramp]
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(w, d, 16, 12), [w, d]);
  const base = useMemo(
    () => Float32Array.from((geo.attributes.position as THREE.BufferAttribute).array),
    [geo]
  );
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!animate || !mesh.current) return;
    const t = performance.now() * 0.001;
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      // tepinya yang bergerak, tengahnya ditindih benda-benda
      const edge = Math.max(0, Math.abs(x) / (w * 0.5) - 0.55);
      p.setZ(i, (lekuk ? lekuk[i] : 0) + Math.sin(t * 1.6 + x * 1.4 + y) * 0.045 * edge);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return <mesh ref={mesh} geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} />;
}

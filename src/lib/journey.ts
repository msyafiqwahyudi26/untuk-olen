"use client";

/**
 * Satu sumber kebenaran untuk posisi pembaca di sepanjang perjalanan.
 * Nilai 0 = berdiri di pantai. 1 = fajar di atas laut.
 * Di-update sekali per frame, dibaca oleh dunia 3D lewat ref (tanpa re-render React).
 */

export type Vec3 = [number, number, number];

export type Keyframe = { t: number; pos: Vec3; look: Vec3 };

/** Jalur kamera: pantai → masuk air → menyelam → dasar → naik → langit → fajar */
export const PATH: Keyframe[] = [
  { t: 0.0,  pos: [0,  2.4,  26], look: [0,  2.0,   0] },
  { t: 0.13, pos: [0,  1.7,  15], look: [0,  1.2,  -6] },
  { t: 0.27, pos: [0,  0.7,   5], look: [0,  0.1, -10] },
  { t: 0.42, pos: [0, -3.4,  -1], look: [0, -3.4, -12] },
  { t: 0.57, pos: [0, -8.6,  -8], look: [0, -8.2, -19] },
  { t: 0.71, pos: [0, -3.2, -13], look: [0, -0.6, -23] },
  { t: 0.83, pos: [0,  1.3, -17], look: [0,  7.0, -31] },
  { t: 0.93, pos: [0,  5.0, -21], look: [0, 20.0, -42] },
  { t: 1.0,  pos: [0,  7.6, -25], look: [0, 12.0, -50] },
];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** smoothstep — bikin peralihan antar keyframe tidak patah */
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function samplePath(t: number): { pos: Vec3; look: Vec3 } {
  const p = clamp01(t);
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].t) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const raw = (p - a.t) / (b.t - a.t || 1);
  const k = smooth(clamp01(raw));
  return {
    pos: [lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)],
    look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k)],
  };
}

/* ── store sederhana, tanpa re-render ── */

type Listener = (t: number) => void;

class Journey {
  /** progress mentah dari scroll */
  target = 0;
  /** progress yang sudah dihaluskan — ini yang dipakai dunia 3D */
  value = 0;
  /** pointer -1..1 untuk parallax halus */
  px = 0;
  py = 0;
  private listeners = new Set<Listener>();

  set(t: number) {
    this.target = clamp01(t);
  }
  /** dipanggil tiap frame */
  tick(dt: number) {
    const k = 1 - Math.pow(0.0016, dt); // damping ~frame-rate independent
    this.value += (this.target - this.value) * k;
    if (Math.abs(this.target - this.value) < 1e-5) this.value = this.target;
    this.listeners.forEach((l) => l(this.value));
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

export const journey = new Journey();

/** fase dunia yang diturunkan dari progress */
export function phase(t: number) {
  return {
    /** 0 di darat, 1 saat benar-benar di bawah air */
    underwater: clamp01((t - 0.34) / 0.1) * (1 - clamp01((t - 0.72) / 0.1)),
    /** 0..1 seberapa dekat ke fajar */
    dawn: clamp01((t - 0.88) / 0.12),
    /** 0..1 langit terlihat */
    sky: clamp01((t - 0.78) / 0.1),
    /** 0..1 masih di pantai */
    shore: 1 - clamp01((t - 0.02) / 0.22),
  };
}

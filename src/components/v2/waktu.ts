/**
 * ═══ EMPAT WAKTU ═══
 *
 * Satu pantai, empat cahaya. Halaman memilih sendiri menurut jam saat Olen
 * membukanya, dan bisa diubah manual lewat panel settings.
 *
 * Yang berubah bukan cuma langit. Cahaya sore membuat pasir kemerahan dan
 * laut keunguan; kalau cuma langitnya yang diganti, hasilnya terlihat seperti
 * latar yang ditukar di belakang benda yang tidak ikut berubah. Jadi tiap
 * waktu membawa palet lengkap: langit, laut, pasir, matahari, dan warna dua
 * lampu di scene.
 *
 * Palet siang persis sama dengan yang sudah disetujui Yaya sebelumnya —
 * itu tetap jadi acuan; tiga sisanya diturunkan darinya.
 */

export type Waktu = "pagi" | "siang" | "sore" | "malam";

export const URUT: Waktu[] = ["pagi", "siang", "sore", "malam"];

export const NAMA: Record<Waktu, string> = {
  pagi: "Sunrise",
  siang: "Daylight",
  sore: "Golden hour",
  malam: "Night",
};

export type Palet = {
  /** gradien langit, dipakai sebagai background CSS di belakang canvas */
  langit: [string, string, string, string, string];
  laut: {
    shallow: string;
    light: string;
    mid: string;
    deep: string;
    far: string;
    foam: string;
  };
  pasir: { dry: string; mid: string; wet: string };
  /** posisi matahari/bulan di dunia, dan warnanya */
  surya: { pos: [number, number, number]; inti: string; tepi: string; skala: number };
  cahaya: {
    ambient: number;
    utama: { pos: [number, number, number]; kuat: number; warna: string };
    isi: { pos: [number, number, number]; kuat: number; warna: string };
  };
  /** warna kabut tipis di cakrawala, tempat laut bertemu langit */
  cakrawala: string;
  /**
   * Awan punya warnanya sendiri, terpisah dari pencahayaan.
   * Bahannya emissive supaya tetap cerah di siang hari — dan justru karena
   * itu ia TIDAK ikut gelap waktu malam kalau warnanya tidak diganti. Awan
   * putih terang di langit malam adalah hal pertama yang terlihat salah.
   */
  awan: { warna: string; pijar: string; kuat: number };
  /** bintang hanya muncul di malam hari */
  bintang: number;
};

export const PALET: Record<Waktu, Palet> = {
  /* ── PAGI — matahari baru naik, cahaya rendah dan bersih ── */
  pagi: {
    langit: ["#7FA8D8", "#A9C6E8", "#DCD3E4", "#F6D8CE", "#FDEBDC"],
    laut: {
      shallow: "#9FD8E8",
      light: "#63C0DC",
      mid: "#3F9EC6",
      deep: "#2E7FAE",
      far: "#79B4D2",
      foam: "#FFF6EE",
    },
    pasir: { dry: "#E8D2B4", mid: "#D6BC96", wet: "#B79974" },
    surya: { pos: [96, 22, -240], inti: "#FFF6E2", tepi: "#FFCFA0", skala: 12 },
    cahaya: {
      ambient: 0.95,
      utama: { pos: [90, 30, -60], kuat: 1.7, warna: "#FFD9B0" },
      isi: { pos: [-60, 25, 80], kuat: 0.45, warna: "#AFC9E8" },
    },
    cakrawala: "#FBE4D6",
    awan: { warna: "#FFF0E4", pijar: "#FFDCC4", kuat: 0.4 },
    bintang: 0,
  },

  /* ── SIANG — palet yang sudah disetujui, jangan diubah tanpa alasan ── */
  siang: {
    langit: ["#3FA9E0", "#6FC6EC", "#A3DCF4", "#D2EEFB", "#F0FAFE"],
    laut: {
      shallow: "#8CE2F5",
      light: "#4FD0EE",
      mid: "#26B6E4",
      deep: "#1591D2",
      far: "#4FBDE6",
      foam: "#FFFFFF",
    },
    pasir: { dry: "#EBD5AC", mid: "#DCC08A", wet: "#BE9C68" },
    surya: { pos: [-96, 66, -240], inti: "#FFFDF2", tepi: "#FFE9A8", skala: 11 },
    cahaya: {
      ambient: 1.15,
      utama: { pos: [-90, 70, 40], kuat: 1.9, warna: "#FFF6DC" },
      isi: { pos: [60, 20, 80], kuat: 0.5, warna: "#BFE6FA" },
    },
    cakrawala: "#F0FAFE",
    awan: { warna: "#FFFFFF", pijar: "#E8F4FC", kuat: 0.45 },
    bintang: 0,
  },

  /* ── SORE — golden hour, matahari rendah di kiri ── */
  sore: {
    langit: ["#4E7FB8", "#7E9CC4", "#C6A9B4", "#F2B98B", "#FFD9A0"],
    laut: {
      shallow: "#8FC4D6",
      light: "#5DA6C4",
      mid: "#3F82A8",
      deep: "#33648C",
      far: "#9A8FA8",
      foam: "#FFE9D2",
    },
    pasir: { dry: "#E4BE90", mid: "#CFA271", wet: "#A87F55" },
    surya: { pos: [-118, 16, -235], inti: "#FFF0C8", tepi: "#FF9E52", skala: 16 },
    cahaya: {
      ambient: 0.85,
      utama: { pos: [-110, 18, -20], kuat: 2.1, warna: "#FFC078" },
      isi: { pos: [70, 30, 80], kuat: 0.4, warna: "#8FA8CC" },
    },
    cakrawala: "#FFD3A0",
    awan: { warna: "#FFE2C6", pijar: "#FFC79A", kuat: 0.38 },
    bintang: 0,
  },

  /* ── MALAM — bulan, laut biru tua tapi TIDAK hitam ──
     Aturan lama tetap berlaku: Olen suka biru muda, jadi malamnya biru
     malam yang masih hidup, bukan gelap gulita. Bintang dinyalakan. */
  malam: {
    langit: ["#12294F", "#1C3B6B", "#2E5686", "#4B739C", "#7A9AB4"],
    laut: {
      shallow: "#5C86A4",
      light: "#3E6788",
      mid: "#2C4E6E",
      deep: "#1E3A57",
      far: "#3A5C7E",
      foam: "#CBDCE8",
    },
    pasir: { dry: "#8E8296", mid: "#7A6E84", wet: "#5E5468" },
    surya: { pos: [104, 58, -238], inti: "#F4F7FF", tepi: "#BFD2EE", skala: 7 },
    cahaya: {
      ambient: 0.7,
      utama: { pos: [100, 60, -30], kuat: 1.0, warna: "#C8D8F4" },
      isi: { pos: [-60, 20, 70], kuat: 0.3, warna: "#5E7CA4" },
    },
    cakrawala: "#7A9AB4",
    awan: { warna: "#8FA6C4", pijar: "#5C7CA4", kuat: 0.16 },
    bintang: 1,
  },
};

/**
 * ═══ BUSUR MATAHARI DAN BULAN ═══
 *
 * Sebelumnya matahari punya empat posisi tetap, satu per waktu, dan berpindah
 * dengan lompatan yang di-lerp. Hasilnya benda yang "dipindahkan", bukan
 * benda yang bergerak. Yaya: "mataharinya bergerak terus secara beraturan
 * dan bulannya juga… jadi full animated".
 *
 * Sekarang posisinya dihitung dari JAM, sebagai satu busur menerus:
 *
 *   jam 6   → terbit di timur (kanan layar), tepat di cakrawala
 *   jam 12  → puncak, tepat di atas
 *   jam 18  → terbenam di barat (kiri layar), kembali ke cakrawala
 *
 * Bulan memakai busur yang sama, digeser 12 jam. Jadi begitu matahari turun
 * di kiri, bulan naik di kanan — keduanya selalu berlawanan, seperti aslinya.
 * Karena jamnya pecahan (13.5 = setengah dua), keduanya benar-benar merayap
 * pelan selama halaman dibuka.
 */

/** setengah lebar busur, dan tinggi puncaknya */
const BUSUR_X = 150;
const BUSUR_Y = 88;
const BUSUR_Z = -238;
/** sedikit di bawah cakrawala, supaya terbit dan terbenamnya terlihat */
const BUSUR_DASAR = -16;

function titikBusur(sudut: number): [number, number, number] {
  return [
    Math.cos(sudut) * BUSUR_X,
    BUSUR_DASAR + Math.sin(sudut) * BUSUR_Y,
    BUSUR_Z,
  ];
}

/** posisi matahari pada jam tertentu (0–24, boleh pecahan) */
export function posisiMatahari(jam: number): [number, number, number] {
  // jam 6 → sudut 0 (timur), jam 18 → sudut π (barat)
  return titikBusur((Math.PI * (jam - 6)) / 12);
}

/** posisi bulan — busur yang sama, digeser 12 jam */
export function posisiBulan(jam: number): [number, number, number] {
  return titikBusur((Math.PI * (((jam + 12) % 24) - 6)) / 12);
}

/** seberapa tinggi matahari di atas cakrawala, 0–1. Dipakai untuk memudarkan. */
export function tinggiMatahari(jam: number) {
  const y = posisiMatahari(jam)[1];
  return Math.max(0, Math.min(1, (y + 10) / 30));
}

export function tinggiBulan(jam: number) {
  const y = posisiBulan(jam)[1];
  return Math.max(0, Math.min(1, (y + 10) / 30));
}

/**
 * Jam wakil untuk tiap waktu, dipakai kalau Olen memilih manual.
 * Dipilih di tengah rentangnya masing-masing supaya posisinya khas:
 * pagi matahari rendah di kanan, siang di puncak, sore rendah di kiri.
 */
export const JAM_WAKIL: Record<Waktu, number> = {
  pagi: 7,
  siang: 12.5,
  sore: 17.6,
  malam: 21.5,
};

/** gradien CSS siap pakai untuk latar `.op` */
export function gradienLangit(w: Waktu) {
  const l = PALET[w].langit;
  return `linear-gradient(180deg, ${l[0]} 0%, ${l[1]} 30%, ${l[2]} 62%, ${l[3]} 86%, ${l[4]} 100%)`;
}

/**
 * Waktu menurut jam setempat.
 *
 * Batasnya dipilih supaya "sore" benar-benar jatuh di golden hour, bukan
 * sepanjang petang: 16.00–18.59. Malam mulai jam 19 dan berakhir jam 5.
 */
export function waktuSekarang(jam = new Date().getHours()): Waktu {
  if (jam >= 5 && jam < 10) return "pagi";
  if (jam >= 10 && jam < 16) return "siang";
  if (jam >= 16 && jam < 19) return "sore";
  return "malam";
}

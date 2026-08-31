/**
 * Palet v2 — biru muda, siang hari di pinggir pantai.
 * Perjalanannya nanti: pantai → langit biru → luar angkasa.
 *
 * Aturan: TIDAK ADA navy gelap. Olen suka biru muda.
 * Warna paling gelap di laut (#2091CF) masih lebih terang dari
 * --night-sea-near milik design system lama.
 */

export const SKY = {
  top: "#3FA9E0",
  upper: "#6FC6EC",
  mid: "#A3DCF4",
  low: "#D2EEFB",
  horizon: "#F0FAFE",
};

/** laut dibaca dari pantai ke cakrawala, bukan dari tinggi ombak */
export const SEA = {
  shallow: "#8CE2F5", // paling dekat kaki — muda, tapi bukan putih
  light: "#4FD0EE",
  mid: "#26B6E4",
  deep: "#1591D2", // sedalam-dalamnya cuma sampai sini
  far: "#4FBDE6", // menerang lagi mendekati cakrawala
  foam: "#FFFFFF",
};

/**
 * Pasir sengaja diturunkan dari versi pertama (#F5E6CA / #EAD5AD / #D8BC8C).
 * Warna itu terlalu dekat ke putih: begitu buih dan cahaya ditambahkan,
 * seluruh pantai jadi bidang pucat, dan tekstur apa pun yang digambar di
 * atasnya tidak punya ruang untuk terlihat. Warna butuh jarak dari 1.0 supaya
 * bisa dibuat lebih terang DAN lebih gelap.
 */
export const SAND = {
  dry: "#EBD5AC",
  mid: "#DCC08A",
  wet: "#BE9C68",
};

export const SUN = {
  core: "#FFFDF0",
  glow: "#FFEFB8",
};

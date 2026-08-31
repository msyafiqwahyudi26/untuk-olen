/**
 * ═══ UKURAN DUNIA LAYAR PANTAI ═══
 *
 * Satu-satunya tempat yang tahu di mana air, di mana pasir, dan setinggi apa
 * pasir di satu titik. Shader pasir, tikar piknik, kepiting, flamingo, dan
 * bintang laut semuanya bertanya ke sini.
 *
 * Dulu rumus tinggi pasir ditulis dua kali — sekali di shader, sekali di
 * penempatan benda — lalu keduanya berbeda sedikit. Akibatnya tikar terbenam
 * sebelah dan bintang laut mengambang. Sekarang satu sumber.
 *
 * Tata ruang (semua satuan three, 1 satuan ≈ 30 cm):
 *   kamera     z = 48, y = 6.5, menunduk ± 8°
 *   pasir      z = 20 … 84
 *   garis air  z = 28
 *   laut       z = 30 … -252
 */

export const WATERLINE = 28;

/**
 * Tinggi pasir di satu titik.
 *
 * ── Kenapa ada dua kemiringan ──
 * Di darat pantainya landai (0.05). Tapi TEPAT DI BAWAH GARIS AIR pasir dan
 * laut sama-sama berada di sekitar y = 0, dan ombak beramplitudo ±0.12
 * membuat keduanya saling menembus — dari layar terlihat seperti pasir
 * berkedip di dalam air. Karena itu di bawah garis air kemiringannya
 * dipertajam jadi 0.27, sehingga dalam satu satuan saja pasir sudah jelas
 * berada di bawah air. Ini menyelesaikan tabrakannya lewat KEDALAMAN, bukan
 * dengan menambal warna.
 */
export function sandAt(x: number, z: number) {
  const landai = (z - WATERLINE) * 0.05;
  const curam = z < WATERLINE ? (z - WATERLINE) * 0.22 : 0;
  const gundukan =
    Math.sin(x * 0.03) * 0.12 + Math.cos(x * 0.009 + z * 0.05) * 0.08;
  return landai + curam + gundukan;
}

/**
 * Memeriksa sendiri apakah chrome halaman terbaca di keempat waktu.
 *
 *     node --experimental-strip-types src/design/periksa-kontras.ts
 *
 * Kolom "sebelum" adalah keadaan lama: tulisan putih di atas kaca putih 16%,
 * angka yang tidak pernah dihitung siapa pun. Kolom "sesudah" adalah hasil
 * turunan. Yang di bawah 4,5 ditandai.
 *
 * Jalankan ini lagi setiap kali palet waktu diubah atau waktu baru ditambah.
 * Ia akan keluar dengan kode 1 kalau ada yang gagal, jadi bisa dipasang di CI
 * kalau suatu saat proyek ini punya CI.
 */

import { URUT, PALET, NAMA, type Waktu } from "../components/v2/waktu.ts";
import { kontras, tumpuk } from "./warna.ts";
import { RIAS, PANEL, latarZona, TINTA, type Zona } from "./tema.ts";

const ZONA: { z: Zona; apa: string }[] = [
  { z: "atas", apa: "settings + suara (pojok kanan atas)" },
  { z: "aksi", apa: "tombol besar (tengah layar)" },
  { z: "bawah", apa: "keep going (dasar layar, di atas PASIR)" },
];

const KACA_LAMA = 0.16;
let gagal = 0;

const p2 = (n: number) => n.toFixed(2).padStart(5);

console.log("\n  ═══ KONTRAS CHROME — putih di atas kaca ═══\n");
console.log("  ambang: 4,50 : 1   (teks kecil, WCAG AA)\n");

for (const { z, apa } of ZONA) {
  console.log(`  ── ${apa}`);
  for (const w of URUT as Waktu[]) {
    const latar = latarZona(w, z);
    const lama = kontras(TINTA, tumpuk(TINTA, KACA_LAMA, latar));
    const r = RIAS[w][z];
    const tanda = r.rasio >= 4.5 ? "ok " : "!! ";
    if (r.rasio < 4.5) gagal++;
    console.log(
      `     ${NAMA[w].padEnd(12)} latar ${latar}   sebelum ${p2(lama)}` +
        `   sesudah ${p2(r.rasio)}  ${tanda} ${r.kaca}`
    );
  }
  console.log("");
}

console.log("  ── panel settings (ambang lebih tinggi: 7,00)");
for (const w of URUT as Waktu[]) {
  const p = PANEL[w];
  const tanda = p.rasio >= 7 ? "ok " : "!! ";
  if (p.rasio < 7) gagal++;
  console.log(`     ${NAMA[w].padEnd(12)} ${p.kaca.padEnd(26)} ${p2(p.rasio)}  ${tanda}`);
}

/**
 * Nama besar "Olen" sengaja tidak ikut aturan — lihat catatan di tema.ts.
 * Tetap dicetak supaya keputusan itu terlihat, bukan terlupakan.
 */
console.log("\n  ── nama besar (pengecualian yang disengaja, tidak dihitung gagal)");
for (const w of URUT as Waktu[]) {
  const r = kontras(TINTA, PALET[w].langit[1]);
  console.log(`     ${NAMA[w].padEnd(12)} ${p2(r)}   dibiarkan: dibaca sebagai bentuk, bukan teks`);
}

console.log(
  gagal === 0
    ? "\n  Semua chrome lolos ambang.\n"
    : `\n  ${gagal} tidak lolos.\n`
);
process.exit(gagal === 0 ? 0 : 1);

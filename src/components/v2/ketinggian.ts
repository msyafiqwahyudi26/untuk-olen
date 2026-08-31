import { keRgb, keHex, type Rgb } from "../../design/warna.ts";

/**
 * ═══ KETINGGIAN — cermin dari kedalaman.ts, ke arah sebaliknya ═══
 *
 * Turun ke laut dan naik ke langit adalah dua perjalanan yang setara, jadi
 * keduanya dibangun dengan cara yang sama: SATU angka, dan semua yang
 * terlihat diturunkan darinya. Tidak ada daftar palet di sini juga.
 *
 *
 * ── YANG BERBEDA DARI AIR, DAN KENAPA ──
 *
 * Air MENYERAP cahaya, jadi warnanya bisa dihitung dengan Beer–Lambert dari
 * satu koefisien per saluran. Udara tidak begitu: ia MENGHAMBURKAN. Langit
 * biru bukan karena udara menyerap merah, melainkan karena molekulnya
 * membelokkan cahaya biru jauh lebih kuat — dan kekuatan hamburan itu
 * sebanding pangkat empat kebalikan panjang gelombang (hukum Rayleigh).
 *
 * Naik berarti udara di atas kita makin sedikit, jadi yang dihamburkan makin
 * sedikit, jadi langit makin gelap sampai jadi hitam ruang angkasa. Kerapatan
 * udara turun eksponensial terhadap ketinggian dengan tinggi skala sekitar
 * 8,5 km — itu besaran nyata, bukan angka yang saya pilih.
 *
 * Jadi bentuk rumusnya berbeda dari kedalaman.ts, tapi wataknya sama: satu
 * hukum, menerus, tanpa tahap.
 *
 *
 * ── DAN SATU HAL YANG SENGAJA TIDAK NYATA ──
 *
 * PUNCAK = 120 km, batas Kármán, tempat atmosfer resmi dianggap habis. Itu
 * nyata. Yang TIDAK nyata: bintang tidak benar-benar bertambah banyak saat
 * kita naik — ia cuma jadi terlihat karena langitnya berhenti bersinar.
 * `bintangDi()` di bawah memodelkan yang TERLIHAT, bukan yang ada, dan itu
 * disebut supaya tidak ada yang mengira ia besaran astronomi.
 *
 *     node --experimental-strip-types src/components/v2/ketinggian.ts
 */

/** Batas Kármán, dalam kilometer. Di atas ini tidak ada langit lagi. */
export const PUNCAK = 120;

/** Tinggi skala atmosfer bumi, kilometer. Kerapatan udara turun jadi 1/e
 *  tiap kenaikan sebesar ini. Besaran nyata. */
const TINGGI_SKALA = 8.5;

const jepit = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function halus(v: number, a: number, b: number): number {
  if (a === b) return v < a ? 0 : 1;
  const t = jepit((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/* ═══════════════ udara ═══════════════ */

/**
 * Berapa bagian udara yang masih ada di atas kita pada ketinggian `h` km.
 * 1 di permukaan laut, mendekati nol di batas Kármán.
 *
 * Inilah satu-satunya rumus di berkas ini; sisanya turunan darinya.
 */
export function udaraDi(h: number): number {
  return Math.exp(-Math.max(0, h) / TINGGI_SKALA);
}

/**
 * Warna langit di ketinggian `h`, diturunkan dari warna langit di permukaan.
 *
 * `permukaan` diambil dari palet waktu yang sedang berlaku, jadi naik saat
 * sore memberi langit yang berbeda dari naik saat malam — tanpa satu pun
 * palet tambahan ditulis. Sama persis dengan cara `warnaAirDi` bekerja.
 *
 * Yang memudar bukan warnanya melainkan UDARANYA. Karena hamburan Rayleigh
 * jauh lebih kuat di biru, saluran biru bertahan lebih lama daripada merah
 * saat udaranya menipis — itu sebabnya langit tidak memudar jadi abu-abu
 * melainkan jadi biru tua lalu hitam.
 */
const RAYLEIGH: Rgb = [0.42, 0.72, 1];

/**
 * Angka Rayleigh dipakai sebagai LAJU MEMUDAR, bukan sebagai pengali warna.
 *
 * Versi pertama mengalikannya langsung: `(p - ruang) * u * RAYLEIGH[c]`.
 * Akibatnya di ketinggian NOL warnanya sudah tidak sama dengan langit
 * permukaan — diperiksa, `#4B739C` keluar sebagai `#20549C`. Artinya begitu
 * layar jurnal terbuka, langitnya berkedip berganti warna dari layar
 * pembuka; persis kedipan yang dihindari mati-matian di tirai menyelam.
 *
 * Bentuk yang benar `u^(1/rayleigh)`: di u = 1 semua saluran bernilai 1,
 * jadi ketinggian nol menghasilkan warna permukaan PERSIS. Saat udara
 * menipis, merah memudar dengan pangkat 2,38 sementara biru dengan pangkat 1
 * — jadi langit tidak memudar jadi abu-abu, melainkan membiru dulu lalu
 * menghitam, seperti yang sungguhan.
 */
export function warnaLangitDi(h: number, permukaan: string, ruang = "#01030A"): string {
  const p = keRgb(permukaan);
  const r = keRgb(ruang);
  const u = udaraDi(h);
  const f = (c: 0 | 1 | 2) => Math.pow(u, 1 / RAYLEIGH[c]);
  return keHex([
    r[0] + (p[0] - r[0]) * f(0),
    r[1] + (p[1] - r[1]) * f(1),
    r[2] + (p[2] - r[2]) * f(2),
  ] as Rgb);
}

/**
 * Seberapa banyak bintang yang TERLIHAT di ketinggian `h`, 0 sampai 1.
 *
 * Bukan besaran astronomi. Bintangnya tidak bertambah; langitnya yang
 * berhenti bersinar. Jadi ini murni kebalikan dari sisa udara, dilembutkan
 * supaya bintang pertama muncul sebelum langitnya benar-benar gelap —
 * seperti sungguhan, tempat bintang paling terang sudah kelihatan jauh
 * sebelum senja habis.
 */
export function bintangDi(h: number): number {
  return jepit(1 - udaraDi(h) * 0.92);
}

/** Suhu udara, derajat Celsius. Turun tajam di troposfer lalu berbalik.
 *  Bentuknya nyata; angkanya untuk atmosfer tropis. */
export function suhuUdaraDi(h: number): number {
  if (h < 11) return 29 - h * 6.5;          // troposfer: turun 6,5° tiap km
  if (h < 20) return -42;                    // tropopause: rata
  return -42 + halus(h, 20, 50) * 40;        // stratosfer: menghangat lagi
}

/* ═══════════════ gulir → ketinggian ═══════════════ */

/**
 * Sama alasannya dengan `kedalamanDi()`: gulir dipetakan ke PERUBAHAN, bukan
 * ke kilometer.
 *
 * Kalau lurus, seluruh peristiwa yang terlihat — langit membiru pekat lalu
 * menghitam, bintang muncul — habis di beberapa persen pertama, karena udara
 * berkurang eksponensial. Sisa perjalanannya jadi hitam yang tidak berubah.
 *
 * Tabelnya menumpuk laju bergantinya warna langit dan laju munculnya
 * bintang, ditambah bobot jarak supaya kilometer-kilometer terakhir tetap
 * punya tempat alih-alih habis dalam beberapa piksel.
 */
const BOBOT_JARAK = 0.4;
const LANGKAH = 0.05; // km

const TABEL: Float64Array = (() => {
  const n = Math.round(PUNCAK / LANGKAH) + 1;
  const t = new Float64Array(n);
  let kumpul = 0;
  let udaraLalu = 1;
  let bintangLalu = bintangDi(0);

  for (let i = 1; i < n; i++) {
    const h = i * LANGKAH;
    const u = udaraDi(h);
    const b = bintangDi(h);
    kumpul += Math.abs(u - udaraLalu) + Math.abs(b - bintangLalu) + (BOBOT_JARAK * LANGKAH) / PUNCAK;
    udaraLalu = u;
    bintangLalu = b;
    t[i] = kumpul;
  }
  const total = t[n - 1] || 1;
  for (let i = 0; i < n; i++) t[i] /= total;
  return t;
})();

/** Pecahan gulir (0 di permukaan, 1 di puncak) → ketinggian dalam km. */
export function ketinggianDi(pecahan: number): number {
  const t = jepit(pecahan);
  if (t <= 0) return 0;
  if (t >= 1) return PUNCAK;
  let lo = 0;
  let hi = TABEL.length - 1;
  while (hi - lo > 1) {
    const tengah = (lo + hi) >> 1;
    if (TABEL[tengah] <= t) lo = tengah;
    else hi = tengah;
  }
  const rentang = TABEL[hi] - TABEL[lo];
  const sisip = rentang > 0 ? (t - TABEL[lo]) / rentang : 0;
  return (lo + sisip) * LANGKAH;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Pemeriksaan mandiri.
 * ═══════════════════════════════════════════════════════════════════════ */

declare const process: { argv: string[]; exit(c: number): void } | undefined;

if (typeof process !== "undefined" && process.argv[1]?.endsWith("ketinggian.ts")) {
  const LANGIT = "#4B739C";
  console.log("\n  ═══ PROFIL KETINGGIAN ═══\n");
  console.log("     km   udara    warna langit   bintang   suhu");
  for (const h of [0, 2, 5, 10, 18, 30, 50, 80, PUNCAK]) {
    console.log(
      `   ${String(h).padStart(4)}  ${(udaraDi(h) * 100).toFixed(1).padStart(5)}%  ` +
        `${warnaLangitDi(h, LANGIT)}      ${(bintangDi(h) * 100).toFixed(0).padStart(3)}%   ` +
        `${suhuUdaraDi(h).toFixed(0).padStart(4)}°`,
    );
  }

  console.log("\n  ═══ GULIR → KETINGGIAN ═══\n");
  console.log("   gulir   ketinggian   (linear, sebagai pembanding)");
  for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
    console.log(
      `   ${(t * 100).toFixed(0).padStart(4)}%  ${ketinggianDi(t).toFixed(1).padStart(7)} km` +
        `        ${(t * PUNCAK).toFixed(0).padStart(4)} km`,
    );
  }

  console.log("\n  ═══ PEMERIKSAAN ═══\n");
  let gagal = 0;
  const uji = (nama: string, lulus: boolean, catatan: string) => {
    console.log(`   ${lulus ? "ok  " : "GAGAL"}  ${nama.padEnd(44)} ${catatan}`);
    if (!lulus) gagal++;
  };

  const lompat = (h: number) => {
    let m = 0;
    let a = ketinggianDi(0);
    for (let t = h; t <= 1; t += h) {
      const b = ketinggianDi(t);
      m = Math.max(m, b - a);
      a = b;
    }
    return m;
  };
  const kasar = lompat(0.0005);
  const halusL = lompat(0.00005);
  uji(
    "ketinggian menerus, bukan sekadar curam",
    halusL < kasar * 0.4,
    `${kasar.toFixed(2)} km → ${halusL.toFixed(2)} km saat langkah diperkecil`,
  );

  let mundur = 0;
  let lalu = 0;
  for (let t = 0; t <= 1; t += 0.0005) {
    const h = ketinggianDi(t);
    if (h < lalu - 1e-9) mundur++;
    lalu = h;
  }
  uji("ketinggian tidak pernah mundur", mundur === 0, `${mundur} kali mundur`);

  const tGelap = (() => {
    for (let t = 0; t <= 1; t += 0.002) if (bintangDi(ketinggianDi(t)) > 0.9) return t;
    return 1;
  })();
  uji(
    "langit tidak menghitam di ujung atas gulir",
    tGelap > 0.25 && tGelap < 0.85,
    `bintang penuh di ${(tGelap * 100).toFixed(0)}% gulir`,
  );

  uji(
    "ketinggian nol = warna langit permukaan",
    warnaLangitDi(0, LANGIT).toUpperCase() === LANGIT.toUpperCase(),
    `${warnaLangitDi(0, LANGIT)} lawan ${LANGIT}`,
  );

  uji(
    "warna langit menerus",
    (() => {
      const l = (h: number) => {
        let m = 0;
        let a = keRgb(warnaLangitDi(0, LANGIT));
        for (let x = h; x <= PUNCAK; x += h) {
          const b = keRgb(warnaLangitDi(x, LANGIT));
          m = Math.max(m, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
          a = b;
        }
        return m;
      };
      return l(0.05) < l(0.5) * 0.4;
    })(),
    "lompatan ikut mengecil saat langkah diperkecil",
  );

  console.log(gagal === 0 ? "\n  Semua lolos.\n" : `\n  ${gagal} GAGAL.\n`);
  if (gagal > 0) process.exit(1);
}

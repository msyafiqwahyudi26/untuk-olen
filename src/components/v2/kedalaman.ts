import { keRgb, keHex, type Rgb } from "../../design/warna.ts";

/**
 * ═══ KEDALAMAN — satu angka, seluruh dunia bawah air ═══
 *
 * Saudara dari `world.ts`. Kalau `world.ts` menjawab "di mana pasirnya dan di
 * mana garis airnya", berkas ini menjawab "pada kedalaman sekian, airnya warna
 * apa, seterang apa, sejauh apa yang terlihat, dan siapa yang hidup di situ".
 *
 *
 * ── KENAPA BERKAS INI DITULIS SEBELUM SCENE-NYA ──
 *
 * Yaya memilih turunannya MENERUS TANPA TAHAP: bukan dangkal → sedang → dalam
 * yang dipotong-potong, melainkan satu turunan panjang yang makin gelap.
 *
 * Itu terdengar seperti keputusan gaya. Sebenarnya keputusan arsitektur.
 * Kalau scene dibangun lebih dulu, "tahap" akan muncul dengan sendirinya —
 * karena cara termudah membuat air makin gelap adalah menyiapkan tiga palet
 * lalu menyilangkannya, dan begitu itu terjadi, sambungannya tidak akan pernah
 * benar-benar hilang. Berkas ini ada supaya tahap itu tidak punya tempat untuk
 * lahir: TIDAK ADA satu pun daftar palet di sini. Semuanya fungsi menerus atas
 * satu bilangan.
 *
 *
 * ── KENAPA HUKUM FISIKA, BUKAN PALET PILIHAN ──
 *
 * Warna air tidak dipilih. Ia dihitung dari hukum Beer–Lambert: tiap warna
 * cahaya diserap air dengan laju berbeda, dan merah diserap jauh lebih cepat
 * daripada biru. Itu sebabnya laut dalam berwarna biru — bukan karena "biru
 * itu warna laut", melainkan karena biru satu-satunya yang tersisa.
 *
 * Memakai hukumnya, bukan menirunya, memberi tiga hal sekaligus:
 *
 *   1. Peralihannya menerus dengan sendirinya. Tidak ada sambungan untuk
 *      dicari, karena tidak ada sambungan.
 *   2. Warnanya berangkat dari warna permukaan yang SEDANG berlaku. Menyelam
 *      saat sore memberi air yang berbeda dari menyelam saat malam, tanpa
 *      satu pun palet tambahan ditulis.
 *   3. Angkanya bisa diperiksa orang lain. Koefisien di bawah bukan selera
 *      saya; ia besaran air laut jernih yang bisa dibantah dengan buku.
 *
 * Ini aturan yang sama dengan `warna.ts`, yang menurunkan warna chrome dari
 * langit alih-alih mematoknya. Dan seperti berkas itu, berkas ini murni
 * matematika: ia tidak tahu apa-apa soal React, waktu, kamera, atau 2D lawan
 * 3D. Itu disengaja — turunan ini akan dibangun 2D dulu, dan berkas ini harus
 * tetap berlaku apa adanya kalau kelak ia jadi 3D.
 *
 *     node --experimental-strip-types src/components/v2/kedalaman.ts
 *
 * menjalankan pemeriksaan mandiri di bawah dan mencetak profilnya.
 */

/** Dasar perjalanan, dalam meter. Di bawah ini tidak ada apa-apa lagi. */
export const DASAR = 800;

/**
 * Koefisien serapan air laut jernih, per meter, untuk tiga panjang gelombang
 * yang kira-kira mewakili merah, hijau, dan biru.
 *
 * Perbandingannya yang penting, bukan angka mutlaknya: merah diserap sekitar
 * 15 kali lebih cepat daripada biru. Itu sebabnya warna merah lenyap dalam
 * belasan meter pertama sementara biru bertahan ratusan meter.
 *
 * Diperiksa terhadap kenyataan: model ini memberi sekitar 1,5 persen cahaya
 * permukaan pada 100 meter. Batas zona eufotik yang dipakai ahli kelautan —
 * kedalaman tempat cahaya tinggal 1 persen — jatuh sekitar 110 meter di sini,
 * dan di laut terbuka yang jernih angkanya memang 100 sampai 200 meter.
 */
const SERAP: Rgb = [0.28, 0.055, 0.018];

/** Bobot terang menurut mata (Rec. 709). Mata jauh lebih peka ke hijau. */
const MATA: Rgb = [0.2126, 0.7152, 0.0722];

const jepit = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** smoothstep: 0 di a, 1 di b, dan LAJUNYA nol di kedua ujung. */
function halus(v: number, a: number, b: number): number {
  if (a === b) return v < a ? 0 : 1;
  const t = jepit((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/* ═══════════════ cahaya ═══════════════ */

/**
 * Berapa bagian cahaya permukaan yang masih tersisa di kedalaman `d`,
 * per saluran warna. Inilah satu-satunya rumus di berkas ini; sisanya
 * turunan darinya.
 */
export function teruskanDi(d: number): Rgb {
  const m = Math.max(0, d);
  return [
    Math.exp(-SERAP[0] * m),
    Math.exp(-SERAP[1] * m),
    Math.exp(-SERAP[2] * m),
  ];
}

/**
 * Terang yang TERASA di kedalaman `d`, sebagai pecahan dari terang di
 * permukaan. 1 di permukaan, mendekati nol jauh di bawah.
 *
 * Sengaja BUKAN angka terpisah: ia rata-rata tertimbang dari ketiga saluran
 * di atas. Jadi tidak mungkin warnanya bilang satu hal sementara terangnya
 * bilang hal lain — kesalahan yang persis pernah membuat pausnya bergerak ke
 * satu arah sambil menghadap arah lain.
 *
 * Terang permukaan sendiri TIDAK dihitung di sini. Menyelam tengah malam
 * berangkat dari cahaya yang jauh lebih sedikit daripada menyelam siang hari,
 * dan itu urusan pemanggilnya: kalikan hasil ini dengan terang permukaan yang
 * sedang berlaku.
 */
export function cahayaDi(d: number): number {
  const t = teruskanDi(d);
  return t[0] * MATA[0] + t[1] * MATA[1] + t[2] * MATA[2];
}

/* ═══════════════ warna air ═══════════════ */

/**
 * Warna air di kedalaman `d`, diturunkan dari warna permukaannya.
 *
 * `permukaan` adalah warna laut yang sedang berlaku di atas — ambil dari
 * `PALET[waktu].laut.shallow`. Berkas ini sengaja tidak mengimpornya sendiri:
 * begitu ia tahu soal waktu, ia berhenti jadi fisika dan mulai jadi tata
 * seni, dan yang berikutnya menyentuhnya akan menambahkan pengecualian.
 *
 * `lantai` adalah warna paling gelap yang boleh dicapai. Tanpa itu, air
 * benar-benar menjadi #000000 di bawah 600 meter — betul secara fisika, tapi
 * layar yang hitam pekat terbaca sebagai halaman gagal dimuat, bukan sebagai
 * laut dalam. Nilai bawaannya biru-hitam yang masih menyisakan sedikit warna.
 */
export function warnaAirDi(d: number, permukaan: string, lantai = "#040A14"): string {
  const p = keRgb(permukaan);
  const t = teruskanDi(d);
  const l = keRgb(lantai);
  /* Serapan bekerja pada cahaya, jadi ia mengalikan, bukan mencampur. Yang
     ditambahkan setelahnya cuma lantai gelap tadi. */
  return keHex([
    l[0] + (p[0] - l[0]) * t[0],
    l[1] + (p[1] - l[1]) * t[1],
    l[2] + (p[2] - l[2]) * t[2],
  ] as Rgb);
}

/* ═══════════════ jarak pandang ═══════════════ */

/**
 * Seberapa pekat kaburnya di kedalaman `d`: 0 jernih, 1 tidak terlihat apa pun.
 *
 * INI SATU-SATUNYA ANGKA DI BERKAS INI YANG DIPILIH, BUKAN DITURUNKAN, dan
 * saya sebut supaya tidak ada yang mengira seluruh berkas ini fisika murni.
 *
 * Alasannya: yang mengaburkan air bukan serapan melainkan hamburan oleh
 * benda-benda melayang — plankton di dekat permukaan, lalu "salju laut", yaitu
 * serpihan yang terus turun perlahan. Sebarannya berbeda-beda di tiap laut
 * dan tiap musim, jadi tidak ada satu angka yang benar untuk dipakai.
 *
 * Bentuk yang dipakai: paling keruh di sekitar 40 meter tempat plankton
 * paling padat, menipis terus ke bawah, dan tidak pernah benar-benar nol
 * karena salju laut turun sampai dasar.
 */
export function keruhDi(d: number): number {
  const m = Math.max(0, d);
  const plankton = Math.exp(-(((m - 40) / 55) ** 2)) * 0.5;
  const saljuLaut = 0.1 + 0.18 * Math.exp(-m / 260);
  return jepit(plankton + saljuLaut);
}

/* ═══════════════ angka untuk dibaca di layar ═══════════════ */

/**
 * Suhu air, derajat Celsius. Hangat di permukaan, lalu turun tajam menembus
 * termoklin, lalu nyaris rata di bawah. Bentuk ini nyata dan sama di hampir
 * semua laut tropis; angkanya disetel untuk perairan Indonesia.
 */
export function suhuDi(d: number): number {
  const permukaan = 29;
  const dalam = 4;
  return dalam + (permukaan - dalam) * (1 - halus(d, 60, 620));
}

/** Tekanan dalam atmosfer. Satu atmosfer di permukaan, tambah satu tiap 10 m. */
export const tekananDi = (d: number) => 1 + Math.max(0, d) / 10;

/* ═══════════════ siapa hidup di situ ═══════════════ */

export type Penghuni = {
  kunci: "terumbu" | "lumba" | "paus" | "ubur";
  nama: string;
  /** mulai terlihat, penuh dari, penuh sampai, hilang di — meter */
  rentang: [number, number, number, number];
  /** benar kalau ia bercahaya sendiri; di bawah 500 m cuma ini yang menyala */
  pijar: boolean;
};

/**
 * Rentangnya kira-kira mengikuti kedalaman aslinya, dan sengaja BERTUMPANG
 * TINDIH. Kalau tiap penghuni punya lapisannya sendiri tanpa irisan, yang
 * terbaca adalah tiga ruangan berурutan — tepat "tahap" yang berkas ini ada
 * untuk mencegahnya.
 *
 * Yaya minta objeknya jangan banyak-banyak: hewan saja, empat ini.
 */
export const HUNI: Penghuni[] = [
  { kunci: "terumbu", nama: "terumbu karang", rentang: [0, 0, 30, 70], pijar: false },
  { kunci: "lumba", nama: "lumba-lumba", rentang: [0, 10, 120, 240], pijar: false },
  { kunci: "paus", nama: "paus", rentang: [20, 90, 280, 470], pijar: false },
  /* Habisnya sengaja DI BAWAH dasar, bukan tepat di dasar.
   *
   * Semula ditulis berakhir di DASAR, dan pemeriksa langsung menangkap
   * akibatnya: di meter terakhir perjalanan tidak ada satu pun penghuni.
   * Turunan panjang yang berujung pada kekosongan bukan akhir, melainkan
   * kehabisan. Dengan habis di 900 ia masih hadir penuh di dasar dan tetap
   * terasa seperti tempat, bukan seperti daftar yang habis. */
  { kunci: "ubur", nama: "ubur-ubur", rentang: [40, 160, 700, 900], pijar: true },
];

/**
 * Seberapa hadir seorang penghuni di kedalaman `d`, 0 sampai 1.
 *
 * Naik dan turunnya pakai smoothstep, jadi lajunya nol di keempat titik.
 * Itu bukan hiasan: makhluk yang muncul dengan laju bukan nol akan terbaca
 * seperti disisipkan, bukan seperti didekati.
 */
export function hadirDi(p: Penghuni, d: number): number {
  const [mulai, penuhA, penuhB, habis] = p.rentang;
  /* `<` dan `>`, BUKAN `<=` dan `>=`.
   *
   * Terumbu karang hadir penuh sejak permukaan, jadi rentangnya mulai = 0 dan
   * penuhA = 0 — landaian selebar nol. Dengan `d <= mulai`, kedalaman 0 tepat
   * mengembalikan 0 sementara 0,1 mengembalikan 1: lompatan penuh dari tidak
   * ada menjadi ada, di meter pertama perjalanan.
   *
   * Ditemukan pemeriksa di bawah, bukan dengan membaca ulang kodenya. Persis
   * kelas cacat yang sama dengan lompatan 0,81 satuan pada lintasan paus:
   * sambungan yang terlihat wajar sampai ada yang mengukurnya. */
  if (d < mulai || d > habis) return 0;
  if (d < penuhA) return halus(d, mulai, penuhA);
  if (d > penuhB) return 1 - halus(d, penuhB, habis);
  return 1;
}

/** Semua yang hadir di kedalaman ini, yang paling kuat lebih dulu. */
export function penghuniDi(d: number): { penghuni: Penghuni; hadir: number }[] {
  return HUNI.map((penghuni) => ({ penghuni, hadir: hadirDi(penghuni, d) }))
    .filter((x) => x.hadir > 0.002)
    .sort((a, b) => b.hadir - a.hadir);
}

/**
 * Seberapa kuat cahaya makhluk mengambil alih dari cahaya matahari.
 *
 * Diturunkan, bukan dipilih: ia naik persis seiring cahaya matahari habis,
 * dan hanya sejauh ada penghuni bercahaya di kedalaman itu. Jadi di laut
 * dangkal yang terang nilainya nol meski ubur-uburnya sudah ada, dan di
 * kegelapan penuh ia jadi satu-satunya sumber terang.
 */
export function pijarDi(d: number): number {
  const gelap = 1 - jepit(cahayaDi(d) / cahayaDi(0));
  const yangMenyala = HUNI.filter((p) => p.pijar).reduce(
    (t, p) => Math.max(t, hadirDi(p, d)),
    0,
  );
  return gelap * yangMenyala;
}

/* ═══════════════ gulir → kedalaman ═══════════════ */

/**
 * ═══ SATU LANGKAH GULIR = SATU LANGKAH PERUBAHAN ═══
 *
 * Semula gulir dipetakan lurus ke meter: separuh gulir, separuh kedalaman.
 * Terdengar wajar, dan hasilnya buruk. Diukur pada versi itu:
 *
 *     terumbu karang habis di  9% gulir
 *     air gelap total di      15% gulir
 *
 * Sisanya — 85 persen dari seluruh gerakan jari — tidak ada satu pun yang
 * berubah. Itulah yang dirasakan sebagai "dangkal ke sedang ke dalamnya
 * terlalu dekat": semuanya memang berdesakan di ujung atas.
 *
 * Sebabnya bukan angka yang salah setel, melainkan satuan yang salah. Meter
 * bukan ukuran perjalanan di sini; PERUBAHAN yang ukurannya. Dan perubahan
 * di air tidak merata terhadap meter — cahaya jatuh secara eksponensial,
 * jadi sepuluh meter pertama menyimpan lebih banyak peristiwa daripada tiga
 * ratus meter terakhir.
 *
 * Jadi gulir tidak dipetakan ke meter, melainkan ke perubahan yang menumpuk:
 * berapa cepat cahaya berganti, ditambah berapa cepat penghuninya datang dan
 * pergi. Di kedalaman tempat banyak terjadi, jari bergerak jauh untuk turun
 * sedikit; di kegelapan yang tidak berubah, ia meluncur.
 *
 * Tidak ada pangkat yang disetel dengan mata. Yang ada cuma satu keputusan
 * yang memang harus diambil manusia, dan disebut terus terang di bawah:
 * BOBOT_JARAK.
 */

/**
 * Berapa besar jarak murni ikut dihitung sebagai perjalanan, terlepas dari
 * ada tidaknya yang berubah.
 *
 * Ini SATU-SATUNYA angka yang dipilih di pemetaan ini, dan ia perlu ada.
 * Tanpa dia, ratusan meter terakhir — yang gelap dan nyaris tidak berubah —
 * akan habis dalam beberapa piksel gulir, dan laut dalam kehilangan
 * kedalamannya justru di bagian yang paling ingin terasa dalam.
 *
 * 0,45 berarti kira-kira: hampir separuh perjalanan diukur dari jauhnya,
 * sisanya dari apa yang terjadi.
 */
const BOBOT_JARAK = 0.45;

/** Berapa rapat tabelnya. 0,25 m sudah jauh lebih halus daripada satu piksel
 *  gulir di layar mana pun, jadi tidak ada tangga yang bisa terlihat. */
const LANGKAH = 0.25;

/**
 * Tabel kumulatif perubahan, dihitung sekali saat berkas dimuat.
 *
 * Sengaja tabel, bukan rumus terbalik: `cahayaDi` adalah jumlah tiga
 * eksponensial dan `hadirDi` adalah potongan smoothstep — gabungannya tidak
 * punya kebalikan tertutup. Tabel 3.200 entri berukuran beberapa puluh
 * kilobita dan dihitung dalam hitungan milidetik, jadi mencari bentuk
 * analitiknya cuma akan menukar kejelasan dengan kepintaran.
 */
const TABEL: Float64Array = (() => {
  const n = Math.round(DASAR / LANGKAH) + 1;
  const t = new Float64Array(n);
  const atas = cahayaDi(0);
  let kumpul = 0;
  let cahayaLalu = 1;
  const hadirLalu = HUNI.map((p) => hadirDi(p, 0));

  for (let i = 1; i < n; i++) {
    const d = i * LANGKAH;
    const c = cahayaDi(d) / atas;
    let ubah = Math.abs(c - cahayaLalu);
    cahayaLalu = c;
    for (let k = 0; k < HUNI.length; k++) {
      const h = hadirDi(HUNI[k], d);
      ubah += Math.abs(h - hadirLalu[k]);
      hadirLalu[k] = h;
    }
    kumpul += ubah + (BOBOT_JARAK * LANGKAH) / DASAR;
    t[i] = kumpul;
  }
  /* Dinormalkan ke 0..1 supaya pemanggilnya cukup memberi pecahan gulir. */
  const total = t[n - 1] || 1;
  for (let i = 0; i < n; i++) t[i] /= total;
  return t;
})();

/**
 * Pecahan gulir (0 di permukaan, 1 di dasar) → kedalaman dalam meter.
 *
 * Naik terus dan tidak pernah melompat: tabelnya menaik tegas, dan di antara
 * dua entri nilainya disisipkan lurus.
 */
export function kedalamanDi(pecahan: number): number {
  const t = jepit(pecahan);
  if (t <= 0) return 0;
  if (t >= 1) return DASAR;

  /* Pencarian belah dua. Tabelnya menaik, jadi ini selalu ketemu. */
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
 * Pemeriksaan mandiri. Tidak ikut ke bundel aplikasi — `import.meta.main`
 * hanya benar kalau berkas ini dijalankan langsung oleh node.
 * ═══════════════════════════════════════════════════════════════════════ */

declare const process: { argv: string[]; exit(c: number): void } | undefined;

if (typeof process !== "undefined" && process.argv[1]?.endsWith("kedalaman.ts")) {
  const PERMUKAAN = "#2E7FA8";
  console.log("\n  ═══ PROFIL KEDALAMAN ═══\n");
  console.log("   meter   cahaya     warna air   keruh   suhu    huni");
  for (const d of [0, 10, 25, 50, 80, 120, 180, 260, 380, 520, 680, DASAR]) {
    const huni = penghuniDi(d)
      .map((h) => `${h.penghuni.kunci} ${(h.hadir * 100).toFixed(0)}%`)
      .join(", ");
    console.log(
      `   ${String(d).padStart(5)}  ` +
        `${(cahayaDi(d) * 100).toFixed(3).padStart(7)}%  ` +
        `${warnaAirDi(d, PERMUKAAN)}   ` +
        `${keruhDi(d).toFixed(2)}   ` +
        `${suhuDi(d).toFixed(1).padStart(4)}°  ` +
        (huni || "—"),
    );
  }

  console.log("\n  ═══ PEMERIKSAAN ═══\n");
  let gagal = 0;
  const uji = (nama: string, lulus: boolean, catatan: string) => {
    console.log(`   ${lulus ? "ok  " : "GAGAL"}  ${nama.padEnd(46)} ${catatan}`);
    if (!lulus) gagal++;
  };

  /* Yang benar-benar ingin dijaga: TIDAK ADA LOMPATAN.
   *
   * Uji pertama saya salah, dan ia gagal pada fungsi yang sebenarnya sehat.
   * Ia mengukur "seberapa besar perubahan tiap 0,5 meter" lalu menuntut
   * angkanya kecil. Tapi perubahan besar bukan lompatan: di lima meter
   * pertama, merah memang benar-benar hilang secepat itu. Yang diukurnya
   * KECURAMAN, sedangkan yang berbahaya KETERPUTUSAN, dan keduanya berbeda.
   *
   * Uji yang benar memakai cara yang sama seperti waktu memeriksa lintasan
   * paus: perkecil langkahnya. Fungsi menerus akan ikut mengecilkan lompatan
   * sebanding langkahnya; keterputusan sejati tidak peduli seberapa dekat
   * kita mengukur, lompatannya tetap sebesar itu. */
  const lompatWarna = (h: number) => {
    let m = 0;
    for (let d = 0; d < DASAR; d += h) {
      const a = keRgb(warnaAirDi(d, PERMUKAAN));
      const b = keRgb(warnaAirDi(d + h, PERMUKAAN));
      m = Math.max(m, Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
    }
    return m;
  };
  const lompatHuni = (h: number) => {
    let m = 0;
    for (let d = 0; d < DASAR; d += h) {
      for (const p of HUNI) m = Math.max(m, Math.abs(hadirDi(p, d) - hadirDi(p, d + h)));
    }
    return m;
  };

  const wKasar = lompatWarna(0.5);
  const wHalus = lompatWarna(0.05);
  uji(
    "warna air menerus, bukan sekadar landai",
    wHalus < wKasar * 0.4,
    `langkah 0,5 m → ${wKasar.toFixed(2)} · langkah 0,05 m → ${wHalus.toFixed(2)} (ikut mengecil = menerus)`,
  );

  const hKasar = lompatHuni(0.5);
  const hHalus = lompatHuni(0.05);
  uji(
    "kehadiran penghuni menerus",
    hHalus < hKasar * 0.4,
    `langkah 0,5 m → ${hKasar.toFixed(4)} · langkah 0,05 m → ${hHalus.toFixed(4)}`,
  );

  const eufotik = (() => {
    for (let d = 0; d <= DASAR; d += 0.5) if (cahayaDi(d) / cahayaDi(0) < 0.01) return d;
    return DASAR;
  })();
  uji("batas zona eufotik masuk akal", eufotik >= 80 && eufotik <= 200, `cahaya tinggal 1% di ${eufotik} m (laut jernih: 100–200 m)`);

  uji("ada penghuni di setiap kedalaman", (() => {
    for (let d = 0; d <= DASAR; d += 1) if (penghuniDi(d).length === 0) return false;
    return true;
  })(), "tidak ada kedalaman yang kosong melompong");

  uji("yang bercahaya mengambil alih di kegelapan", pijarDi(680) > 0.9 && pijarDi(20) < 0.1,
    `pijar 20 m = ${pijarDi(20).toFixed(2)}, 680 m = ${pijarDi(680).toFixed(2)}`);

  /* ── pemetaan gulir ── */
  console.log("\n  ═══ GULIR → KEDALAMAN ═══\n");
  console.log("   gulir   kedalaman   (linear, sebagai pembanding)");
  for (const t of [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1]) {
    console.log(
      `   ${(t * 100).toFixed(0).padStart(4)}%  ${kedalamanDi(t).toFixed(0).padStart(6)} m` +
        `        ${(t * DASAR).toFixed(0).padStart(4)} m`,
    );
  }
  console.log();

  const kapan = (syarat: (d: number) => boolean) => {
    for (let t = 0; t <= 1; t += 0.002) if (syarat(kedalamanDi(t))) return t;
    return 1;
  };
  const tReef = kapan((d) => hadirDi(HUNI[0], d) < 0.01);
  const tGelap = kapan((d) => cahayaDi(d) / cahayaDi(0) < 0.01);

  uji(
    "terumbu tidak habis di ujung atas gulir",
    tReef > 0.2,
    `habis di ${(tReef * 100).toFixed(0)}% gulir (linear dulu: 9%)`,
  );
  uji(
    "gelap total tidak datang terlalu cepat",
    tGelap > 0.3,
    `gelap di ${(tGelap * 100).toFixed(0)}% gulir (linear dulu: 15%)`,
  );

  let mundur = 0;
  let lalu = 0;
  for (let t = 0; t <= 1; t += 0.0005) {
    const d = kedalamanDi(t);
    if (d < lalu - 1e-9) mundur++;
    lalu = d;
  }
  uji("kedalaman tidak pernah mundur saat digulir turun", mundur === 0, `${mundur} kali mundur`);

  /*
   * KESALAHAN YANG SAMA, DIULANGI.
   *
   * Uji ini semula berbunyi "lompatan terbesar harus di bawah 6 meter tiap
   * 0,05% gulir", dan ia gagal di 7,07 m. Bukan karena pemetaannya cacat,
   * melainkan karena di ujung bawah ia memang CURAM: 365 meter terakhir
   * lewat dalam sepersepuluh gulir, dan itu disengaja — di sana tidak ada
   * yang berubah, jadi tidak ada alasan menahan jari.
   *
   * Ini persis kekeliruan yang sudah diperbaiki beberapa jam sebelumnya pada
   * uji warna air: mengukur KECURAMAN lalu menyebutnya keterputusan.
   * Terulang karena ambang berupa angka mutlak selalu terlihat masuk akal
   * waktu ditulis. Cara yang benar tidak memakai ambang sama sekali:
   * perkecil langkahnya, lalu lihat apakah lompatannya ikut mengecil.
   */
  const lompat = (h: number) => {
    let m = 0;
    let a = kedalamanDi(0);
    for (let t = h; t <= 1; t += h) {
      const b = kedalamanDi(t);
      m = Math.max(m, b - a);
      a = b;
    }
    return m;
  };
  const kasar = lompat(0.0005);
  const halus = lompat(0.00005);
  uji(
    "kedalaman menerus, bukan sekadar curam",
    halus < kasar * 0.4,
    `langkah 0,05% → ${kasar.toFixed(2)} m · langkah 0,005% → ${halus.toFixed(2)} m (ikut mengecil = menerus)`,
  );

  console.log(gagal === 0 ? "\n  Semua lolos.\n" : `\n  ${gagal} GAGAL.\n`);
  if (gagal > 0) process.exit(1);
}

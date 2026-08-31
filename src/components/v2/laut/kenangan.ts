import { DASAR } from "../kedalaman";

/**
 * ═══ KENANGAN — apa yang ditemui di sepanjang turunan ═══
 *
 * Berkas ini adalah SATU-SATUNYA tempat isi cerita ditulis. Tidak ada satu
 * pun kalimat Olen di dalam `Turunan.tsx` maupun di CSS mana pun. Batas itu
 * disengaja: yang mengisi berkas ini adalah orang yang membaca ulang ekspor
 * WhatsApp, dan orang itu tidak seharusnya perlu membaca kode React untuk
 * menaruh satu kalimat.
 *
 *
 * ── CARA KEDALAMAN DIPILIH ──
 *
 * `di` adalah kedalaman dalam meter tempat kenangan ini berada. Yang perlu
 * diketahui sebelum memilih angkanya: gulir TIDAK dipetakan lurus ke meter.
 * Ia dipetakan ke perubahan, jadi meter-meter pertama jauh lebih lapang
 * daripada yang terakhir (lihat `kedalamanDi()`). Kira-kira begini letaknya:
 *
 *       0 –  70 m   separuh pertama gulir. Terumbu, cahaya masih ada.
 *      70 – 210 m   seperempat berikutnya. Air membiru pekat, paus lewat.
 *     210 – 800 m   seperempat terakhir. Gelap, hanya ubur-ubur bercahaya.
 *
 * Jadi kenangan yang ingin dibaca pelan-pelan sebaiknya di atas 70 m, dan
 * yang ingin terasa jauh serta sunyi di bawah 300 m. Menaruh sepuluh
 * kenangan di 400–800 m akan membuat semuanya berlalu terlalu cepat.
 *
 *
 * ── ATURAN YANG TIDAK BOLEH DILANGGAR ──
 *
 * 1. Kalimat Olen ditulis APA ADANYA. Jangan dirapikan ejaannya, jangan
 *    dibetulkan tata bahasanya. Yang membuat sebuah kalimat terasa miliknya
 *    justru bagian yang tidak rapi.
 * 2. Jangan mengarang. Kalau sebuah kalimat tidak ada di ekspornya, ia tidak
 *    boleh ada di sini — sekalipun terdengar pas.
 * 3. `catatan` adalah suara Yaya, bukan suara Olen. Pisahkan jelas-jelas.
 *    Kalau ragu apakah sesuatu ucapan Olen atau tafsir atasnya, itu catatan.
 * 4. Isi berkas ini IKUT GIT, jadi ia bukan tempat untuk apa pun yang tidak
 *    boleh dibaca orang lain. Foto, suara, dan basis data tetap di luar git.
 *    Kalau sebuah kutipan terasa terlalu pribadi untuk itu, jangan ditaruh
 *    di sini — bicarakan dulu dengan Yaya.
 */

export type Kenangan = {
  /** Kedalaman dalam meter, 0 sampai DASAR. */
  di: number;
  /** Kalimatnya. Apa adanya. */
  kutipan: string;
  /** Tanggal seperti di ekspor, mis. "07/12/24". Boleh kosong. */
  tanggal?: string;
  /** Siapa yang mengucapkannya. Bawaannya Olen. */
  dari?: "olen" | "yaya";
  /** Satu kalimat dari Yaya. Bukan bagian dari kutipannya. */
  catatan?: string;
  /**
   * TIDAK DIPAKAI LAGI. Dulu kenangan muncul berselang-seling kiri dan kanan.
   *
   * Kelihatannya bagus di tangkapan layar diam, dan buruk waktu dibaca: mata
   * harus melompat menyeberangi layar untuk tiap kalimat berikutnya. Yaya:
   * "biar Olen beneran enak bacanya". Membaca lama butuh tempat baca yang
   * TETAP — satu kolom, di posisi yang sama tiap kali.
   *
   * Nilainya dibiarkan supaya berkas ini tidak perlu diedit ulang, tapi
   * `Turunan.tsx` tidak lagi membacanya.
   */
  sisi?: "kiri" | "kanan";
  /**
   * Nama berkas VN di `public/memori/vn`, TANPA ekstensi. Dimuat `.m4a`
   * lebih dulu, `.opus` sebagai cadangan — sama seperti audio lain di
   * halaman ini.
   *
   * Kenangan yang punya suara memberi tombol dengar di bawah kutipannya.
   * Ini yang membuat turunan ini bukan sekadar bacaan: di beberapa titik,
   * yang terdengar Olen sendiri.
   */
  suara?: string;
};

/**
 * Seberapa jauh sebelum dan sesudah `di` sebuah kenangan masih terlihat,
 * dalam meter. Bukan tetap: makin dalam, makin longgar — karena di bawah
 * sana gulir bergerak jauh lebih cepat dalam meter, jadi jendela yang sempit
 * akan membuatnya berkelebat dan tak sempat terbaca.
 */
export function jendelaDi(d: number): number {
  return 6 + (d / DASAR) * 120;
}

/**
 * ═══ ISINYA ═══
 *
 * Semua kutipan di bawah SUNGGUHAN, disalin apa adanya dari ekspor WhatsApp,
 * dan sudah diperiksa siapa pengucapnya satu per satu.
 *
 * Pemeriksaan itu bukan formalitas. Daftar "momen lucu" yang pertama kali
 * diusulkan berisi tujuh kalimat; setelah dicocokkan ke ekspornya, ENAM di
 * antaranya ternyata ucapan Yaya, bukan Olen. Kalau diambil apa adanya,
 * halaman ini akan menempelkan kalimat kakaknya ke nama adiknya — persis
 * jenis kesalahan yang paling mudah lolos, karena hasilnya terdengar masuk
 * akal dan tidak ada yang menandainya.
 *
 *
 * ── SUSUNANNYA ──
 *
 * Kronologis? Tidak. Yang menentukan letaknya BOBOT, bukan tanggal — karena
 * yang dibaca Olen di sini bukan riwayat, melainkan dirinya sendiri:
 *
 *     4 –  55 m   terang. Hal-hal random, konyol, kecil.
 *    75 – 195 m   mulai jujur. Ia menjelaskan dirinya.
 *   265 – 340 m   paling berat. Dua kalimat, diberi jarak jauh.
 *   480 – 640 m   yang ia pegang. Di sini ubur-ubur mulai menyala.
 *   735 – 775 m   dasar. Yang ingin dikatakan Yaya.
 *
 * Dua kalimat terberat sengaja berjarak 75 meter — di kedalaman itu gulir
 * bergerak cepat, dan menaruhnya berdekatan akan membuat keduanya lewat
 * hampir bersamaan. Yang berat butuh ruang kosong di sekelilingnya.
 *
 *
 * ── TIGA KUTIPAN YANG DITAHAN ──
 *
 * Yaya memilih tiga kalimat lagi yang TIDAK dimasukkan di sini, dan alasannya
 * bukan selera:
 *
 *   · dua tentang orang tuanya
 *   · satu menyebut nama temannya
 *
 * Berkas ini ikut git, dan repo GitHub-nya per 31 Agustus 2026 masih PUBLIK.
 * Kalimat seorang anak tentang orang tuanya, sekali masuk riwayat git, ada di
 * sana selamanya dan bisa dicari siapa pun. Hari ini terasa sekadar cerita;
 * beberapa tahun lagi ia jadi catatan permanen tentang keluarganya — dan
 * tentang seorang teman yang tidak pernah dimintai pendapat.
 *
 * Ketiganya menunggu satu hal: repo dijadikan PRIVATE. Sesudah itu boleh
 * ditambahkan. Teksnya sengaja tidak ditulis di sini supaya tidak ikut masuk
 * riwayat git lewat komentar.
 */
export const KENANGAN: Kenangan[] = [
  /* ───────────── 4–55 m · terang ───────────── */
  {
    di: 5,
    kutipan: "PAS MPLS ITU SERU BANGET, TAPI GA KERASA UDAH MAU NAIK KELAS",
    tanggal: "02/01/24",
    catatan: "Kamu kelas tujuh waktu nulis ini. Sekarang kamu SMA.",
  },
  {
    di: 13,
    kutipan: "AKU DULU SUKA BGT MAIN ICE SKATING DISITU",
    tanggal: "18/11/24",
    sisi: "kanan",
  },
  {
    di: 21,
    kutipan: "MIMPI DIKEJAR TUYUL KALI DIA MAU LARI TP MASI GENGGAM HANDPHONE",
    suara: "ketawa-nular",
    tanggal: "29/12/23",
    catatan: "Kamu selalu punya penjelasan untuk hal yang nggak perlu dijelasin.",
  },
  {
    di: 31,
    kutipan: "ABISTU SUMPAH PALAKU SAKIT BGTT INI KEJEDOT UJUNG LANTAI KAYANYA",
    tanggal: "02/12/24",
    sisi: "kanan",
  },
  {
    di: 42,
    kutipan: "KAYAK ROTI",
    suara: "nahan-ketawa",
    tanggal: "09/11/24",
    catatan: "Itu jawabanmu waktu ditanya kenapa suaramu serak.",
  },
  {
    di: 55,
    kutipan: "ktnya pemikiran aku detail trs ak jawab soalnya jg detail sama kyk yg dibuku",
    tanggal: "19/08/26",
    sisi: "kanan",
    catatan: "Kamu menyampaikannya seperti mengulang kata orang lain. Padahal itu memang kamu.",
  },

  /* ───────────── 75–195 m · mulai jujur ───────────── */
  {
    di: 76,
    kutipan: "kalo aku ngomong cape itu karna malas",
    tanggal: "30/11/24",
    catatan: "Nggak banyak orang tahu bedanya pada dirinya sendiri. Kamu tahu.",
  },
  {
    di: 96,
    kutipan: "kek gw suka aja seneng liat tmn gw happy",
    suara: "ketawa-2026",
    tanggal: "29/08/26",
    sisi: "kanan",
  },
  {
    di: 122,
    kutipan:
      "KADANG WALAU GW BAWA DUIT PAS PASAN YA TRS TMN GW MAU INI ITU TP DIA GAMAU BELI, GW BELIIN JIR",
    tanggal: "29/08/26",
    catatan: "Ini bukan sifat yang kebetulan. Ini yang kamu pilih, berkali-kali.",
  },
  {
    di: 156,
    kutipan:
      "sebenernya aku mau cerita kalo aku udh tras bgt ke orgnya trs kalo orgnya cerita duluan baru aku mau cerita",
    tanggal: "07/12/24",
    sisi: "kanan",
  },
  {
    di: 195,
    kutipan:
      "aku lebih pengen terbuka ke orang2, aku pengen bisa lancar kalo cerita tentang masalah aku ke orang yg udah aku percaya",
    tanggal: "13/11/24",
    catatan: "Kamu nggak bilang kamu tertutup. Kamu bilang kamu pengen bisa. Itu beda.",
  },

  /* ───────────── 265–340 m · paling berat ─────────────
     Dua saja, berjarak jauh. Di kedalaman ini gulir bergerak cepat; kalau
     didekatkan, keduanya lewat hampir bersamaan dan tidak sempat mengendap. */
  {
    di: 265,
    kutipan:
      "sekarang aku jadi lebih susah buat ngejalanin masalah2 yg aku hadapin, aku skrg jadi sering bgt gelisah aku gatau karena apa",
    tanggal: "12/11/24",
    catatan: "Kamu nggak minta apa-apa waktu nulis ini. Kamu cuma bilang apa adanya.",
  },
  {
    di: 340,
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    sisi: "kanan",
    catatan:
      "Kamu yang dulu nggak hilang. Dia cuma jadi bagian dari kamu yang sekarang — yang lebih tahu banyak hal, dan karena itu lebih capek.",
  },

  /* ───────────── 480–640 m · yang ia pegang ─────────────
     Di sini ubur-ubur mulai menyala. Yang menerangi datang dari makhluknya
     sendiri, bukan dari matahari — dan yang dibaca di sini juga begitu. */
  {
    di: 480,
    kutipan:
      "MENDING SAMA YG BENER2 SAYANG SAMA KT DAN BENER2 MAU JADI TEMEN KITA TANPA MANDANG EKONOMI",
    tanggal: "08/12/24",
    catatan: "Umur tiga belas, dan kamu sudah tahu ini.",
  },
  {
    di: 560,
    kutipan:
      "iya aku seneng banget rasanya kalo aku bisa deket sama orang2 baik jadinya aku gaperlu haus kasih sayang sama mereka",
    tanggal: "13/11/24",
    sisi: "kanan",
  },
  {
    di: 640,
    kutipan: "prioritasin diri sendiri dulu kata gw mah yak",
    tanggal: "10/12/24",
    catatan: "Kamu bilang ini ke orang lain. Sekarang giliran kamu yang dengar.",
  },

  /* ───────────── 735–775 m · dasar ─────────────
     Dua-duanya suara Yaya, dan ditandai begitu. Ini satu-satunya tempat di
     seluruh turunan yang bukan kalimat Olen — dan letaknya paling bawah,
     sesudah semua yang dia katakan sendiri. */
  {
    di: 735,
    dari: "yaya",
    kutipan:
      "Kamu bisa nahan nangis di depan orang bukan karena kamu tertutup, tapi karena kamu milih kapan mau nunjukinnya. Kamu beliin temenmu jajan waktu uangmu sendiri pas-pasan. Kamu nanya orang baik-baik aja duluan, bahkan waktu kamu sendiri lagi enggak.",
    catatan: "Itu semua kamu tulis sendiri, di hari yang berbeda-beda, tanpa sadar lagi menjelaskan siapa kamu.",
  },
  {
    di: 775,
    dari: "yaya",
    sisi: "kanan",
    kutipan:
      "Jaga itu. Jangan sampai ada yang bikin kamu ngira itu kelemahan. Dan kalau nanti kamu ragu, dengerin dulu yang ada di hatimu — kadang kita takut, dan tetap tahu mana yang paling bener buat diri sendiri. Takut bukan tanda kamu salah.",
  },
];

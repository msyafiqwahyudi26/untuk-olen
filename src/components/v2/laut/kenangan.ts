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
  /**
   * Nama berkas video note di `public/memori/video`, TANPA ekstensi.
   * Dimuat `.mp4`, dengan `.jpg` bernama sama sebagai bingkai pertamanya.
   *
   * Video note WhatsApp itu bulat, dan bentuk bulat itu bagian dari
   * ingatannya — jadi di sini juga bulat, bukan kotak pemutar biasa.
   *
   * Berkasnya dikompres dulu (480 px, CRF 30, audio 64 kbps mono): yang asli
   * 2,6 MB dan halaman ini harus tetap ringan di HP. `preload="none"`, jadi
   * tidak ada satu bita pun yang diunduh sampai Olen menekannya.
   */
  video?: string;
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
    catatan: "Kelas tujuh, dan kamu udah heran sama waktu yang jalan sendiri. Sekarang kamu SMA dan mungkin masih heran. Kakak juga, Len. Nggak ada yang pernah benar-benar terbiasa.",
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
    catatan: "Kamu selalu punya penjelasan buat hal yang sebenernya nggak perlu dijelasin. Itu bukan aneh — itu kepala yang nggak pernah bener-bener berhenti kerja, bahkan buat hal receh.",
  },
  {
    di: 26,
    kutipan: "daun telingaku tbtb layu dikit",
    video: "telinga-layu",
    tanggal: "11/11/24",
    catatan:
      "Kamu ngomongin daun telinga kamu kayak lagi ngomongin tanaman. Cara kamu nyebut sesuatu emang selalu beda satu langkah dari orang lain.",
  },
  {
    di: 36,
    kutipan: "UDAH DI LEMARI",
    video: "udah-di-lemari",
    tanggal: "30/11/24",
    catatan: "Nggak ada yang bisa niru timing kamu, Len.",
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
    catatan: "Ditanya kenapa suaramu serak, dan itu jawabanmu. Nggak ada orang lain yang bakal ngejawab begitu. Simpan cara kamu ngeliat sesuatu — itu punya kamu.",
  },
  {
    di: 55,
    kutipan: "ktnya pemikiran aku detail trs ak jawab soalnya jg detail sama kyk yg dibuku",
    tanggal: "19/08/26",
    sisi: "kanan",
    catatan: "Kamu nyampeinnya kayak lagi ngutip orang. Padahal itu emang kamu. Kamu boleh ngakuin hal baik tentang diri sendiri tanpa nunggu ada yang ngomongin duluan.",
  },

  /* ───────────── 75–195 m · mulai jujur ───────────── */
  {
    di: 76,
    kutipan: "kalo aku ngomong cape itu karna malas",
    tanggal: "30/11/24",
    catatan: "Banyak orang seumur hidup nggak bisa bedain dua itu di diri sendiri. Kamu udah bisa umur segini. Yang jujur sama diri sendiri biasanya juga jujur sama orang lain — dan itu kenapa orang gampang percaya sama kamu.",
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
    catatan: "Ini bukan kebetulan. Ini kamu milih, berkali-kali, waktu nggak ada yang liat dan nggak ada yang bakal muji. Yang kayak gitu namanya watak, bukan sikap.",
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
    catatan: "Kamu nggak bilang kamu tertutup. Kamu bilang kamu pengen bisa. Itu beda jauh — yang satu vonis, yang satu arah. Kamu selalu milih yang kedua, bahkan waktu lagi susah.",
  },

  /* ───────────── 265–340 m · paling berat ─────────────
     Dua saja, berjarak jauh. Di kedalaman ini gulir bergerak cepat; kalau
     didekatkan, keduanya lewat hampir bersamaan dan tidak sempat mengendap. */
  {
    di: 265,
    kutipan:
      "sekarang aku jadi lebih susah buat ngejalanin masalah2 yg aku hadapin, aku skrg jadi sering bgt gelisah aku gatau karena apa",
    tanggal: "12/11/24",
    catatan: "Kamu nulis ini tanpa minta apa-apa. Nggak minta dikasihani, nggak minta dibenerin, nggak minta siapa-siapa panik. Cuma bilang apa adanya — dan buat ngaku lagi nggak baik-baik aja itu sendiri udah butuh berani.",
  },
  {
    di: 340,
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    sisi: "kanan",
    catatan:
      "Kamu yang dulu nggak hilang, Len. Dia cuma jadi bagian dari kamu yang sekarang — yang tahu lebih banyak, dan justru karena itu lebih capek. Capeknya bukan tanda kamu mundur. Itu ongkos dari tumbuh, dan semua orang bayar.",
  },

  /* ───────────── 480–640 m · yang ia pegang ─────────────
     Di sini ubur-ubur mulai menyala. Yang menerangi datang dari makhluknya
     sendiri, bukan dari matahari — dan yang dibaca di sini juga begitu. */
  {
    di: 480,
    kutipan:
      "MENDING SAMA YG BENER2 SAYANG SAMA KT DAN BENER2 MAU JADI TEMEN KITA TANPA MANDANG EKONOMI",
    tanggal: "08/12/24",
    catatan: "Umur tiga belas dan kamu udah tahu ini. Banyak orang yang jauh lebih tua masih belum. Pegang terus — ini yang bakal nentuin siapa yang ada di sekitar kamu sepuluh tahun lagi.",
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
    catatan: "Kamu bilang ini ke orang lain waktu dia lagi berantakan. Sekarang giliran kamu yang dengerin sendiri. Nasihat kamu bagus, Len — sayang kalau cuma buat orang lain.",
  },

  /* ───────────── 735–775 m · dasar ─────────────
     Dua-duanya suara Yaya, dan ditandai begitu. Ini satu-satunya tempat di
     seluruh turunan yang bukan kalimat Olen — dan letaknya paling bawah,
     sesudah semua yang dia katakan sendiri. */
  {
    di: 735,
    dari: "yaya",
    kutipan:
      "Kakak nggak pernah ngajarin satu pun dari ini ke kamu. Kamu bisa nahan nangis di depan orang bukan karena tertutup — kamu milih kapan mau nunjukinnya. Kamu beliin temenmu jajan waktu duitmu sendiri pas-pasan. Kamu nanya orang baik-baik aja duluan, bahkan waktu kamu sendiri lagi enggak. Semua itu kamu yang bawa sendiri, dari dalam.",
    catatan: "Kamu nulisnya kepisah-pisah, di hari yang beda-beda, tanpa sadar lagi ngejelasin siapa kamu. Kakak cuma ngumpulin.",
  },
  {
    di: 775,
    dari: "yaya",
    sisi: "kanan",
    kutipan:
      "Jaga itu, Len. Nanti bakal ada yang bilang kamu kebanyakan mikirin orang, atau kamu kegampangan kasihan. Jangan langsung percaya. Dan kalau kamu ragu sama sesuatu, dengerin dulu yang di dalem — kadang kita takut dan tetep tahu mana yang bener buat diri sendiri. Takut itu tandanya kamu peduli sama hasilnya, bukan tandanya kamu salah jalan.",
  },
];

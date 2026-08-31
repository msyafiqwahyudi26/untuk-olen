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
  /* ───────────── 0 m · pembuka ─────────────
     Yang pertama terbaca BUKAN kalimat Olen, tapi kalimat Yaya. Alasannya:
     tanpa premis, dua puluh kutipan cuma jadi kumpulan potongan bagus. Dengan
     premis, semuanya jadi bukti dari satu hal yang sudah disebut di depan. */
  {
    di: 2,
    dari: "yaya",
    kutipan:
      "Aku dengerin ulang semua VN kamu, Len. Yang ketawa, yang nangis, yang marah, yang capek banget. Terus aku sadar satu hal. Kamu selalu nyampe ke seberang. Belum pernah sekali pun enggak.",
  },

  /* ───────────── 6–55 m · terang ───────────── */
  {
    di: 6,
    kutipan: "PAS MPLS ITU SERU BANGET, TAPI GA KERASA UDAH MAU NAIK KELAS",
    tanggal: "02/01/24",
    catatan:
      "Kamu kelas tujuh waktu nulis ini. Aku juga masih suka kaget sama waktu, jadi kita sama. Kayaknya emang nggak ada yang pernah bener-bener siap.",
  },
  {
    di: 14,
    kutipan: "AKU DULU SUKA BGT MAIN ICE SKATING DISITU",
    tanggal: "18/11/24",
    catatan: "Kamu nyimpen hal kecil kayak gini rapi banget di kepala. Aku suka cara kamu inget sesuatu.",
  },
  {
    di: 22,
    kutipan: "MIMPI DIKEJAR TUYUL KALI DIA MAU LARI TP MASI GENGGAM HANDPHONE",
    suara: "ketawa-nular",
    tanggal: "29/12/23",
    catatan:
      "Kepala kamu nggak pernah bener-bener off ya. Mimpi orang lain aja kamu bikinin teorinya. Lucu sih, tapi itu juga yang bikin kamu nangkep hal yang orang lain lewatin.",
  },
  {
    di: 30,
    kutipan: "daun telingaku tbtb layu dikit",
    video: "telinga-layu",
    tanggal: "11/11/24",
    catatan:
      "Kamu ngomongin telinga kamu kayak lagi ngomongin tanaman. Cara kamu nyebut sesuatu selalu beda satu langkah dari orang lain. Jangan diilangin ya.",
  },
  {
    di: 38,
    kutipan: "ABISTU SUMPAH PALAKU SAKIT BGTT INI KEJEDOT UJUNG LANTAI KAYANYA",
    tanggal: "02/12/24",
    catatan: "Kamu cerita sakit sambil ketawa. Itu kamu banget.",
  },
  {
    di: 46,
    kutipan: "UDAH DI LEMARI",
    video: "udah-di-lemari",
    tanggal: "30/11/24",
    catatan: "Timing kamu nggak bisa ditiru, serius. Aku ketawa lama banget waktu itu, dan sampai sekarang masih.",
  },
  {
    di: 55,
    kutipan: "KAYAK ROTI",
    suara: "nahan-ketawa",
    tanggal: "09/11/24",
    catatan: "Ditanya kenapa suara kamu serak, dan itu jawabannya. Nggak ada yang bakal jawab gitu selain kamu.",
  },

  /* ───────────── 72–195 m · mulai jujur ───────────── */
  {
    di: 72,
    kutipan: "ktnya pemikiran aku detail trs ak jawab soalnya jg detail sama kyk yg dibuku",
    tanggal: "19/08/26",
    catatan:
      "Kamu nyampeinnya kayak lagi ngutip orang lain. Padahal itu emang kamu, Len. Kamu boleh ngaku hal bagus tentang diri sendiri tanpa nunggu ada yang bilang duluan.",
  },
  {
    di: 92,
    kutipan: "kalo aku ngomong cape itu karna malas",
    tanggal: "30/11/24",
    catatan:
      "Kamu bisa bedain dua itu di diri sendiri. Banyak orang nggak bisa, seumur hidup. Yang jujur sama diri sendiri biasanya jujur juga sama orang lain, dan itu kenapa orang gampang percaya kamu.",
  },
  {
    di: 118,
    kutipan: "kek gw suka aja seneng liat tmn gw happy",
    suara: "ketawa-2026",
    tanggal: "29/08/26",
    catatan: "Kamu ikut seneng tanpa mikir apa untungnya buat kamu. That is rare, Len. Jangan sampe ada yang bikin kamu ngerasa itu bodoh.",
  },
  {
    di: 148,
    kutipan:
      "KADANG WALAU GW BAWA DUIT PAS PASAN YA TRS TMN GW MAU INI ITU TP DIA GAMAU BELI, GW BELIIN JIR",
    tanggal: "29/08/26",
    catatan: "Duit kamu pas-pasan dan kamu tetep beliin. Nggak ada yang liat, nggak ada yang muji. Itu bukan sikap, itu watak.",
  },
  {
    di: 178,
    kutipan:
      "sebenernya aku mau cerita kalo aku udh tras bgt ke orgnya trs kalo orgnya cerita duluan baru aku mau cerita",
    tanggal: "07/12/24",
    catatan: "Kamu nunggu orang buka duluan sebelum kamu buka. Aku ngerti kenapa. Nggak apa-apa pelan-pelan, Len.",
  },
  {
    di: 208,
    kutipan:
      "aku lebih pengen terbuka ke orang2, aku pengen bisa lancar kalo cerita tentang masalah aku ke orang yg udah aku percaya",
    tanggal: "13/11/24",
    catatan:
      "Kamu nggak bilang kamu tertutup. Kamu bilang kamu pengen bisa. Beda jauh itu. Yang satu vonis, yang satu arah.",
  },

  /* ───────────── 245 m · yang berubah ─────────────
     Ini satu-satunya kenangan yang isinya POLA, bukan momen. Angkanya dihitung
     dari ekspornya, bukan dikira-kira: sebaran kata ganti Olen per kuartal.
     Perubahan tiga tahun tidak pernah muncul di satu pesan mana pun, jadi ia
     tidak akan pernah ketemu kalau yang dicari cuma kalimat bagus. */
  {
    di: 245,
    dari: "yaya",
    kutipan:
      "Tahun pertama kamu manggil aku kak hampir tiap kalimat. Sekarang kamu bilang gw terus langsung nyerocos. Aku ngecek beneran: dulu kamu nulis aku 1500 kali dan gw 353. Tahun ini kebalik. Kamu berhenti jaga jarak, dan itu salah satu hal paling bagus yang pernah kejadian.",
  },

  /* ───────────── 300–380 m · paling berat ───────────── */
  {
    di: 300,
    kutipan:
      "sekarang aku jadi lebih susah buat ngejalanin masalah2 yg aku hadapin, aku skrg jadi sering bgt gelisah aku gatau karena apa",
    tanggal: "12/11/24",
    catatan:
      "Kamu nulis ini nggak minta apa-apa. Nggak minta dikasihani, nggak minta dibenerin. Aku ngerti ini berat dan chaos banget rasanya. Kamu nggak sendiri ya, Len.",
  },
  {
    di: 380,
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    catatan:
      "Kamu yang dulu nggak ilang. Dia cuma jadi bagian dari kamu yang sekarang, yang tau lebih banyak. Capek itu ongkosnya, bukan tanda kamu mundur. It will pass.",
  },

  /* ───────────── 480–640 m · yang ia pegang ─────────────
     Di sini ubur-ubur mulai menyala. Yang menerangi datang dari makhluknya
     sendiri, bukan dari matahari, dan yang dibaca di sini juga begitu. */
  {
    di: 480,
    kutipan:
      "MENDING SAMA YG BENER2 SAYANG SAMA KT DAN BENER2 MAU JADI TEMEN KITA TANPA MANDANG EKONOMI",
    tanggal: "08/12/24",
    catatan: "Umur tiga belas dan kamu udah tau ini. Banyak orang jauh lebih tua masih belum. Pegang terus ya.",
  },
  {
    di: 560,
    kutipan:
      "iya aku seneng banget rasanya kalo aku bisa deket sama orang2 baik jadinya aku gaperlu haus kasih sayang sama mereka",
    tanggal: "13/11/24",
    catatan: "Kamu ngomong ini pelan, kayak lagi mikir sambil ngomong. Itu bukan kalimat hafalan. Itu kesimpulan kamu sendiri.",
  },
  {
    di: 640,
    kutipan: "prioritasin diri sendiri dulu kata gw mah yak",
    tanggal: "10/12/24",
    catatan:
      "Kamu bilang ini ke orang lain waktu dia lagi hancur. Sekarang giliran kamu yang dengerin. Nasihat kamu bagus, sayang kalau cuma buat orang lain.",
  },

  /* ───────────── 730–780 m · dasar ───────────── */
  {
    di: 730,
    dari: "yaya",
    kutipan:
      "Aku nggak pernah ngajarin satu pun dari ini ke kamu. Kamu bisa nahan nangis bukan karena tertutup, tapi karena kamu milih kapan mau nunjukin. Kamu beliin temen jajan waktu duit kamu pas-pasan. Kamu nanya orang baik-baik aja duluan padahal kamu sendiri lagi enggak. Semua itu kamu bawa sendiri, Len.",
    catatan: "Kamu nulisnya kepisah-pisah, di hari yang beda-beda. Aku cuma ngumpulin.",
  },
  {
    di: 780,
    dari: "yaya",
    kutipan:
      "Nanti bakal ada yang bilang kamu kebanyakan mikirin orang. Jangan langsung percaya. Kalau kamu ragu, dengerin dulu yang di dalem, karena kadang kita takut dan tetep tau mana yang bener. It will pass, Oleeen. Kamu udah buktiin itu ke diri kamu sendiri berkali-kali, tinggal kamu percaya aja.",
  },
];

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
  /**
   * Kalimat Kakak SEBELUM kutipan. Biasanya pertanyaan yang mengajak Olen
   * mengingat dulu: "Olen inget nggak, waktu itu kita…".
   *
   * Ini yang membuat kutipannya punya tempat. Kutipan yang berdiri sendiri
   * cuma potongan bagus; kutipan yang didahului pertanyaan jadi bagian dari
   * percakapan yang masih berlangsung.
   */
  pembuka?: string;
  /** Kata Olen. Apa adanya. Ditampilkan di dalam tanda petik. */
  kutipan: string;
  /** Tanggal seperti di ekspor, mis. "07/12/24". Boleh kosong. */
  tanggal?: string;
  /** Siapa yang mengucapkannya. Bawaannya Olen. */
  dari?: "olen" | "yaya";
  /**
   * Yang Kakak katakan SESUDAH kutipan, satu paragraf per baris.
   *
   * Dipisah jadi larik, bukan satu teks panjang: tiap paragraf diberi jeda
   * dan muncul terpisah, jadi terbaca seperti pesan yang dikirim berturut-
   * turut, bukan surat.
   */
  cerita?: string[];
  /**
   * Nama berkas VN di `public/memori/vn`, TANPA ekstensi. Dimuat `.m4a`
   * lebih dulu, `.opus` sebagai cadangan.
   */
  suara?: string;
  /**
   * Nama berkas video note di `public/memori/video`, TANPA ekstensi.
   * `.mp4` plus `.jpg` bernama sama sebagai bingkai pertamanya.
   */
  video?: string;
};

export const KENANGAN: Kenangan[] = [
  /* ───────────── 0 m · pembuka ─────────────
     Yang pertama terbaca kalimat Kakak, bukan kutipan Olen. Tanpa premis,
     kutipan-kutipan di bawah cuma kumpulan potongan bagus. Dengan premis,
     semuanya jadi bukti dari satu hal yang sudah disebut di depan. */
  {
    di: 3,
    dari: "yaya",
    kutipan: "Olen udah dengerin ulang semua VN yang kakak coba kumpulin? Gimana rasanya?",
    cerita: [
      "Floren, adik kakak yang cantik. Itu momen-momen di mana Olen ketawa, nangis, marah, capek.",
      "And what we listen, every cry, every laugh, and every heavy path, Olen bisa melewati semuanya dengan baik.",
      "It will pass. So let's enjoy our life right now, in every breath we take.",
    ],
  },

  /* ───────────── 8–60 m · terang ───────────── */
  {
    di: 8,
    pembuka: "Olen pernah ngomong ke kakak",
    kutipan: "PAS MPLS ITU SERU BANGET, TAPI GA KERASA UDAH MAU NAIK KELAS",
    tanggal: "02/01/24",
    cerita: [
      "Waktu Floren nulis ini, Olen masih kelas 7 SMP. Kakak tau ada banyak ketakutan yang lagi Olen hadapin waktu itu.",
      "Kakak sadar, Olen saat itu masih banyak belajar buat bisa melangkah lebih jauh.",
      "Tapi lihat sekarang. Olen udah jauh melampaui fase itu. Jujur, bahagia banget lihat Olen bertahan sejauh ini. So proud of you, my little sister.",
    ],
  },
  {
    di: 18,
    pembuka: "Olen ingat nggak, kita sempat bahas satu mall yang ada ice skating-nya?",
    kutipan: "AKU DULU SUKA BGT MAIN ICE SKATING DISITU",
    tanggal: "18/11/24",
    cerita: [
      "Sadar nggak, momen bahagia itu selalu tersimpan rapi di kepala kita.",
      "Kadang kita nggak perlu balik ke tempatnya. Cuma perlu mengenang momennya, ngerasain lagi di dalam diri, dan bersyukur pernah ada masa di mana kita sebahagia itu.",
      "Mungkin kita nggak bisa ngulang buat yang kedua kali. Tapi rasanya tetap punya Olen, dan nggak ada yang bisa ngambil itu.",
    ],
  },
  {
    di: 30,
    pembuka:
      "Olen inget nggak, dulu kita sering banget bikin teori konspirasi. Olen yang cerita, Olen yang mendongeng.",
    kutipan: "MIMPI DIKEJAR TUYUL KALI DIA MAU LARI TP MASI GENGGAM HANDPHONE",
    tanggal: "29/12/23",
    cerita: [
      "Ingat nggak kita lagi bahas apa waktu itu? Hahaha, lupa ya pasti. Di situ kita ketawa bareng, karena kita bikin teori yang absurd tapi lucu di imajinasi kita.",
      "Tapi kakak sadar, kepala Olen itu nggak pernah bener-bener off. Mimpi orang lain aja Olen bikinin teorinya.",
      "Olen anak yang punya imajinasi tinggi. Olen bisa mikirin hal yang orang lain nggak kepikiran. Itu yang bikin Olen spesial. You are the special one, Olen.",
    ],
  },
  {
    di: 44,
    pembuka: "Coba inget nggak, Olen kenapa ngirimin video note ini ke kakak?",
    kutipan: "daun telingaku tbtb layu dikit",
    video: "telinga-layu",
    tanggal: "11/11/24",
    cerita: [
      "Waktu itu Olen mau gambarin telinga Olen yang tiba-tiba layu. Kakak mau lihat, dan Olen nunjukin pakai tangan. Jujur, gong banget.",
      "Lihat seberapa randomnya Olen. Tapi justru itu uniknya. Olen bisa ngegambarin hal yang orang lain bingung mau dideskripsiin gimana.",
    ],
  },
  {
    di: 60,
    pembuka: "Olen selalu punya cerita yang nggak habis-habis.",
    kutipan: "ABISTU SUMPAH PALAKU SAKIT BGTT INI KEJEDOT UJUNG LANTAI KAYANYA",
    tanggal: "02/12/24",
    cerita: [
      "Kita ketawa, walaupun kakak khawatir sedikit.",
      "Olen punya cerita yang mungkin sedih, mungkin sakit, tapi Olen bisa bawain itu dengan senyum dan tawa. Itu Floren banget. It's Floren that I know.",
    ],
  },
  {
    di: 78,
    pembuka: "Olen lihat apa yang ada di video ini?",
    kutipan: "UDAH DI LEMARI",
    video: "udah-di-lemari",
    tanggal: "30/11/24",
    cerita: [
      "Senyuman. Senyuman bahagia Olen, waktu kalian rebutan boneka Stitch.",
      "Itu momen yang sampai sekarang kalau kakak lihat lagi rasanya hangat dan lucu. Kakak ketawa lama banget nonton video itu, bahkan sampai hari ini.",
    ],
  },
  {
    di: 96,
    pembuka:
      "Olen selalu punya jawaban yang nyeleneh. Waktu suara Olen serak karena lagi sakit, terus ditanya kenapa, jawabannya",
    kutipan: "KAYAK ROTI",
    tanggal: "09/11/24",
    cerita: [
      "Cuma Floren yang bisa jawab begitu.",
      "Dibalut tawa dan rasa hangat, Olen selalu punya jawaban yang out of the box.",
    ],
  },

  /* ───────────── 120–230 m · Olen menjelaskan dirinya ───────────── */
  {
    di: 120,
    pembuka: "Ada yang pernah bilang ke Olen kalau cara mikir Olen itu detail. Terus Olen cerita ke kakak",
    kutipan: "ktnya pemikiran aku detail trs ak jawab soalnya jg detail sama kyk yg dibuku",
    tanggal: "19/08/26",
    cerita: [
      "Olen nyampeinnya kayak lagi ngutip orang lain. Padahal itu emang Olen.",
      "Olen boleh ngaku hal bagus tentang diri sendiri tanpa nunggu ada yang bilang duluan. Itu bukan sombong, itu tau diri sendiri.",
    ],
  },
  {
    di: 148,
    pembuka: "Suatu hari Olen cerita soal temen Olen, dan kakak inget banget kalimat ini",
    kutipan: "kek gw suka aja seneng liat tmn gw happy",
    tanggal: "29/08/26",
    cerita: [
      "Olen ikut seneng tanpa mikir apa untungnya buat Olen sendiri. That is rare, Olen. Beneran jarang.",
      "Jangan sampai ada yang bikin Olen ngerasa itu bodoh atau kebanyakan mikirin orang.",
    ],
  },
  {
    di: 178,
    pembuka: "Terus Olen cerita ini, soal temen Olen yang lagi pengen sesuatu",
    kutipan:
      "KADANG WALAU GW BAWA DUIT PAS PASAN YA TRS TMN GW MAU INI ITU TP DIA GAMAU BELI, GW BELIIN JIR",
    tanggal: "29/08/26",
    cerita: [
      "Duit Olen pas-pasan dan Olen tetap beliin. Nggak ada yang lihat, nggak ada yang muji.",
      "Yang kayak gitu namanya watak, bukan sikap. Sikap bisa dipasang kalau lagi diperhatiin. Watak keluar waktu nggak ada siapa-siapa.",
    ],
  },
  {
    di: 210,
    pembuka: "Olen pernah bilang ke kakak, soal kenapa Olen susah mulai cerita duluan",
    kutipan:
      "sebenernya aku mau cerita kalo aku udh tras bgt ke orgnya trs kalo orgnya cerita duluan baru aku mau cerita",
    tanggal: "07/12/24",
    cerita: [
      "Olen nunggu orang buka duluan sebelum Olen buka. Kakak ngerti kenapa, dan itu nggak salah.",
      "Terus beberapa hari setelahnya Olen bilang Olen pengen bisa lebih terbuka. Olen nggak bilang Olen tertutup. Olen bilang Olen pengen bisa.",
      "Beda jauh itu. Yang satu vonis, yang satu arah. Dan Olen selalu milih yang kedua, pelan-pelan.",
    ],
  },

  /* ───────────── 255 m · kenapa kita nggak pernah canggung ───────────── */
  {
    di: 255,
    dari: "yaya",
    kutipan:
      "Kakak sadar satu hal. Kenapa kakak nggak pernah merasa canggung sama Olen, padahal kita sempat lama nggak kontakan, atau kita sibuk sama urusan masing-masing.",
    cerita: [
      "Karena kakak nggak pernah merasa Floren pergi.",
      "Kita juga nggak pernah jadi kakak-adik yang satu ngatur dan satu nurut. Kita ketawa di hal yang sama, berantem soal hal receh, dan Olen berani bilang kalau kakak yang salah. Itu yang bikin ini awet.",
      "Kakak selalu ada di belakang Floren, di samping Floren. So that's why I always say I'm always at your side, and I promise that.",
      "Dan lihat perkembangan Floren yang makin dewasa dan bisa melewati semuanya, kakak percaya Floren siap menghadapi dunia ini. Ada atau tanpa adanya kakak.",
    ],
  },

  /* ───────────── 320–420 m · yang paling berat ───────────── */
  {
    di: 320,
    pembuka: "Ada satu malam, Olen nulis ini ke kakak",
    kutipan:
      "sekarang aku jadi lebih susah buat ngejalanin masalah2 yg aku hadapin, aku skrg jadi sering bgt gelisah aku gatau karena apa",
    tanggal: "12/11/24",
    cerita: [
      "Olen nggak minta apa-apa waktu nulis itu. Nggak minta dikasihani, nggak minta dibenerin, nggak minta siapa-siapa panik.",
      "Kakak ngerti, ini pasti berat dan chaos banget rasanya. Gelisah yang nggak ketahuan sebabnya itu yang paling bikin capek, karena Olen nggak tau harus mulai benerin dari mana.",
      "Tapi Olen nggak sendiri ya. Olen always have me at your side. Kalau lagi muak sama hari itu, Olen berhak banget buat istirahat dulu.",
    ],
  },
  {
    di: 420,
    pembuka: "Dua minggu setelahnya, Olen bilang",
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    cerita: [
      "Kakak paham kenapa Olen pengen balik. Yang dulu kelihatannya lebih ringan, lebih sedikit yang dipikirin.",
      "Tapi Olen yang dulu nggak hilang. Dia cuma jadi bagian dari Olen yang sekarang, yang tau lebih banyak hal. Capek itu ongkosnya, bukan tanda Olen mundur.",
      "It will pass, Olen. Selalu begitu, dan Olen udah buktiin berkali-kali.",
    ],
  },

  /* ───────────── 500–650 m · yang Olen pegang ─────────────
     Di sini ubur-ubur mulai menyala. Yang menerangi datang dari makhluknya
     sendiri, bukan dari matahari, dan yang dibaca di sini juga begitu. */
  {
    di: 500,
    pembuka: "Umur tiga belas, Olen nulis ini",
    kutipan:
      "MENDING SAMA YG BENER2 SAYANG SAMA KT DAN BENER2 MAU JADI TEMEN KITA TANPA MANDANG EKONOMI",
    tanggal: "08/12/24",
    cerita: [
      "Banyak orang yang jauh lebih tua masih belum sampai ke kesimpulan itu.",
      "Pegang terus ya. Ini yang bakal nentuin siapa yang ada di sekitar Olen sepuluh tahun lagi.",
    ],
  },
  {
    di: 580,
    pembuka: "Terus di malam yang sama Olen bilang",
    kutipan:
      "iya aku seneng banget rasanya kalo aku bisa deket sama orang2 baik jadinya aku gaperlu haus kasih sayang sama mereka",
    tanggal: "13/11/24",
    cerita: [
      "Olen ngomong ini pelan, kayak lagi mikir sambil ngomong.",
      "Itu bukan kalimat hafalan. Itu kesimpulan Olen sendiri, dan Olen sampai ke situ tanpa ada yang ngajarin.",
    ],
  },
  {
    di: 650,
    pembuka: "Waktu ada orang lain yang lagi hancur, Olen yang bilang",
    kutipan: "prioritasin diri sendiri dulu kata gw mah yak",
    tanggal: "10/12/24",
    cerita: [
      "Sekarang giliran Olen yang dengerin kalimat Olen sendiri.",
      "Nasihat Olen bagus. Sayang banget kalau cuma dipakai buat orang lain.",
    ],
  },

  /* ───────────── 730–790 m · dasar ───────────── */
  {
    di: 730,
    dari: "yaya",
    kutipan: "Kakak nggak pernah ngajarin satu pun dari ini ke Olen.",
    cerita: [
      "Olen bisa nahan nangis bukan karena tertutup, tapi karena Olen milih kapan mau nunjukin.",
      "Olen beliin temen jajan waktu duit Olen sendiri pas-pasan. Olen nanya orang baik-baik aja duluan, padahal Olen sendiri lagi enggak.",
      "Semua itu Floren bawa sendiri. Olen nulisnya kepisah-pisah, di hari yang beda-beda, tanpa sadar lagi ngejelasin siapa Olen. Kakak cuma ngumpulin.",
    ],
  },
  {
    di: 790,
    dari: "yaya",
    kutipan: "Setelah kita journey sedalam ini, setelahnya apa? Apa ada laut yang lebih dalam lagi, atau cuma segini?",
    cerita: [
      "Itu cuma Olen yang bisa jawab. Cuma Floren seorang yang tau jawabannya.",
      "Mungkin sekarang laut ini cuma sedalam 800 meter. Tapi hidup Olen terus jalan, dan kakak harap hal-hal baik terus nyertain Olen.",
      "Jadikan hal-hal baik di dalam diri Olen sebagai fondasi yang terus bikin Floren maju dan kuat. I know you are strong, you have to believe it.",
      "Jadi gimana, mau menyelam lebih jauh lagi?",
    ],
  },
];

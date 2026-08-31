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
 * yang ingin terasa jauh serta sunyi di bawah 300 m.
 *
 *
 * ── CARA MENULIS `cerita` (diubah 31 Agustus 2026) ──
 *
 * Yaya: "masih beberapa ada yang kerasa cringe dan juga kurang elaboratif."
 *
 * Sesudah dibaca ulang, yang bikin cringe bisa ditunjuk: KALIMAT PEPATAH.
 * Bentuk "yang satu A, yang satu B", "itu namanya X, bukan Y". Kalimat
 * begitu terdengar pintar waktu ditulis dan terdengar menggurui waktu
 * dibaca, apalagi oleh anak SMP yang sedang dibicarakan.
 *
 * Aturannya sekarang:
 *
 *   1. Bangun ULANG kejadiannya dulu. Kita lagi ngapain, Olen bilangnya
 *      gimana, kakak reaksinya apa. Baru sesudah itu kesimpulannya.
 *   2. Kesimpulan ditujukan ke Olen, bukan ke udara. "Olen boleh kok..."
 *      bukan "Kita semua sebenarnya...".
 *   3. Kalau satu paragraf bisa dipindah ke kenangan lain tanpa terasa
 *      aneh, paragraf itu terlalu umum. Buang atau ganti dengan yang
 *      cuma berlaku di sini.
 *   4. Boleh mengaku tidak tahu, boleh mengaku lupa, boleh minta maaf.
 *      Yang paling tidak cringe justru yang paling tidak sok tahu.
 *   5. Tanpa tanda pisah panjang. Kalimat pendek lebih baik.
 *
 *
 * ── ATURAN YANG TIDAK BOLEH DILANGGAR ──
 *
 * 1. Kalimat Olen ditulis APA ADANYA. Jangan dirapikan ejaannya, jangan
 *    dibetulkan tata bahasanya. Yang membuat sebuah kalimat terasa miliknya
 *    justru bagian yang tidak rapi.
 * 2. Jangan mengarang. Kalau sebuah kalimat tidak ada di ekspornya, ia tidak
 *    boleh ada di sini, sekalipun terdengar pas. Ini berlaku juga untuk
 *    KEJADIAN di sekitar kutipan: kalau tidak ingat kita lagi ngapain,
 *    tulis "lupa", jangan dikarang biar mulus.
 * 3. `cerita` adalah suara Yaya, bukan suara Olen. Pisahkan jelas-jelas.
 * 4. Isi berkas ini IKUT GIT, jadi ia bukan tempat untuk apa pun yang tidak
 *    boleh dibaca orang lain. Foto, suara, dan basis data tetap di luar git.
 */

/** Satu foto di dalam sebuah kenangan. */
export type Foto = {
  /** Nama berkas di `public/memori`, LENGKAP dengan ekstensi. */
  berkas: string;
  /**
   * Keterangan untuk pembaca layar dan untuk saat gambarnya gagal dimuat.
   * WAJIB, dan bukan formalitas: kalau koneksi Olen lagi jelek, kalimat ini
   * yang dia baca sebagai ganti fotonya.
   */
  alt: string;
  /** Keterangan yang TAMPIL di bawah foto. Boleh kosong. */
  ket?: string;
};

export type Kenangan = {
  /** Kedalaman dalam meter, 0 sampai DASAR. */
  di: number;
  /**
   * Kalimat Kakak SEBELUM kutipan. Biasanya pertanyaan yang mengajak Olen
   * mengingat dulu: "Olen inget nggak, waktu itu kita…".
   */
  pembuka?: string;
  /** Kata Olen. Apa adanya. Ditampilkan di dalam tanda petik. */
  kutipan: string;
  /** Tanggal seperti di ekspor, mis. "07/12/24". Boleh kosong. */
  tanggal?: string;
  /** Siapa yang mengucapkannya. Bawaannya Olen. */
  dari?: "olen" | "yaya";
  /** Yang Kakak katakan SESUDAH kutipan, satu paragraf per baris. */
  cerita?: string[];
  /**
   * Foto yang menyertai kenangan ini. Satu foto tampil besar; dua atau tiga
   * tampil sebagai galeri kecil yang saling bertumpuk sedikit.
   */
  foto?: Foto[];
  /**
   * Nama berkas VN di `public/memori/vn`, TANPA ekstensi. Dimuat `.m4a`
   * lebih dulu, `.opus` sebagai cadangan.
   */
  suara?: string;
  /**
   * Nama berkas video note di `public/memori/video`, TANPA ekstensi.
   * `.mp4` plus `.jpg` bernama sama sebagai bingkai pertamanya.
   *
   * JANGAN mengisi ini sebelum berkasnya benar-benar ada di server. Sampai
   * 31 Agustus 2026 dua kenangan memanggil `telinga-layu` dan
   * `udah-di-lemari` yang tidak pernah diunggah, dan hasilnya kotak pemutar
   * kosong tepat di kalimat "coba lihat video ini". Tidak ada galat, tidak
   * ada yang gagal; cuma tidak ada apa-apa di sana.
   */
  video?: string;
};

export const KENANGAN: Kenangan[] = [
  /* ───────────── 3 m · premis ─────────────
     Yang pertama terbaca kalimat Kakak, bukan kutipan Olen. Tanpa premis,
     yang di bawah cuma kumpulan potongan bagus. Dengan premis, semuanya jadi
     bukti dari satu hal yang sudah disebut di depan. */
  {
    di: 3,
    dari: "yaya",
    kutipan: "Olen udah dengerin ulang semua VN yang kakak coba kumpulin? Gimana rasanya?",
    cerita: [
      "Floren, adik kakak yang cantik. Itu semua momen di mana Olen ketawa, nangis, marah, capek, terus besoknya bangun lagi dan ngejalanin harinya kayak nggak ada apa-apa.",
      "Kakak dengerin semuanya. Setiap tawa, setiap tangis, setiap bagian yang berat. Dan dari semuanya ada satu yang paling kelihatan: Olen selalu nemu jalannya, walaupun kadang lama.",
      "Sebelum kita turun, kakak mau Olen tau dulu apa yang bakal Olen temuin di bawah sana. Ini bukan kalimat-kalimat random yang kakak susun. Ini yang Olen sendiri pernah bilang, di hari-hari yang mungkin Olen udah lupa.",
      "Jadi kalau nanti ada yang bikin Olen kaget, itu bukan kakak yang ngarang. Itu Olen.",
      "It will pass. So let's enjoy our life right now, in every breath we take.",
    ],
  },

  /* ───────────── 8–96 m · masih terang ───────────── */
  {
    di: 8,
    pembuka: "Olen pernah ngomong ke kakak",
    kutipan: "PAS MPLS ITU SERU BANGET, TAPI GA KERASA UDAH MAU NAIK KELAS",
    tanggal: "02/01/24",
    cerita: [
      "Waktu Olen nulis ini, Olen masih kelas 7. Baru masuk SMP, baru kenal semuanya, dan tau-tau udah mau naik kelas aja rasanya.",
      "Kakak tau waktu itu ada banyak yang Olen takutin. Takut nggak punya temen, takut nggak nyambung, takut jadi yang paling ketinggalan. Olen nggak pernah bilang persis kayak gitu, tapi kelihatan dari cara Olen cerita.",
      "Dan kakak sadar, Olen saat itu emang masih banyak yang harus dipelajarin buat bisa melangkah lebih jauh. Itu wajar banget. Semua orang gitu di tahun pertamanya.",
      "Tapi coba lihat sekarang. Olen udah lewat jauh dari fase itu. Yang dulu bikin Olen deg-degan sekarang jadi cerita lama yang bisa diketawain.",
      "Jujur, kakak bahagia banget lihat Olen bertahan sejauh ini. So proud of you, my little sister.",
    ],
  },
  {
    di: 18,
    pembuka: "Olen ingat nggak, kita sempat bahas satu mall yang ada ice skating-nya?",
    kutipan: "AKU DULU SUKA BGT MAIN ICE SKATING DISITU",
    tanggal: "18/11/24",
    foto: [
      {
        berkas: "miniso-stitch.jpg",
        alt: "Lorong mall dengan patung Stitch besar di depan gerai Miniso",
        ket: "mall, dan Stitch yang nungguin di depan",
      },
    ],
    cerita: [
      "Kita lagi ngobrolin tempat, terus tiba-tiba Olen inget itu. Cepet banget, kayak udah nunggu buat diceritain.",
      "Sadar nggak, momen bahagia itu selalu kesimpen rapi di kepala kita? Nggak perlu diinget-inget. Dia dateng sendiri begitu ada pemicunya, bahkan waktu kita lagi bahas hal lain.",
      "Dan kadang kita nggak perlu balik ke tempatnya. Cukup inget momennya, terus rasain lagi dari dalem, sambil bersyukur pernah ada masa di mana kita sebahagia itu.",
      "Mungkin kita nggak bisa ngulang buat yang kedua kali. Tempatnya bisa tutup, orangnya bisa pindah, kitanya sendiri bisa berubah. Tapi rasanya tetep punya Olen, dan nggak ada satu pun yang bisa ngambil itu.",
    ],
  },
  {
    di: 30,
    pembuka:
      "Olen inget nggak, dulu kita sering banget bikin teori konspirasi? Olen yang cerita, Olen yang mendongeng.",
    kutipan: "MIMPI DIKEJAR TUYUL KALI DIA MAU LARI TP MASI GENGGAM HANDPHONE",
    tanggal: "29/12/23",
    cerita: [
      "Ingat nggak kita lagi bahas apa waktu itu? Hahaha, lupa ya pasti. Kakak juga setengah lupa, jujur.",
      "Yang kakak inget kita ketawa lama banget. Bukan karena lucunya doang, tapi karena Olen bawainnya serius, kayak lagi jelasin teori beneran yang ada dasarnya.",
      "Terus kakak sadar satu hal. Kepala Olen itu nggak pernah bener-bener off ya. Mimpi orang lain aja Olen bikinin teorinya.",
      "Olen punya imajinasi yang tinggi, dan yang lebih penting, Olen bisa nyusun imajinasi itu jadi cerita yang orang lain mau dengerin. Itu dua hal yang beda, dan Olen punya dua-duanya.",
      "Itu yang bikin Olen spesial. You are the special one, Olen.",
    ],
  },
  {
    di: 44,
    pembuka: "Coba inget nggak, Olen kenapa ngirimin video note soal telinga ke kakak?",
    kutipan: "daun telingaku tbtb layu dikit",
    tanggal: "11/11/24",
    cerita: [
      "Waktu itu Olen mau gambarin telinga Olen yang tiba-tiba layu. Kakak nggak ngerti maksudnya, terus kakak minta liat, dan Olen nunjukin pakai tangan.",
      "Jujur, gong banget. Nggak ada yang nyebut telinga pakai kata layu selain Olen. Layu itu kata buat tanaman.",
      "Tapi justru itu uniknya. Olen bisa ngegambarin hal yang orang lain bingung mau dideskripsiin gimana. Cara Olen nyebut sesuatu selalu beda satu langkah dari cara orang lain nyebutnya.",
      "Jangan diilangin ya. Itu bukan aneh, itu punya Olen.",
    ],
  },
  {
    di: 60,
    pembuka: "Olen selalu punya cerita yang nggak habis-habis.",
    kutipan: "ABISTU SUMPAH PALAKU SAKIT BGTT INI KEJEDOT UJUNG LANTAI KAYANYA",
    tanggal: "02/12/24",
    cerita: [
      "Olen cerita ini sambil ketawa. Padahal isinya Olen kesakitan.",
      "Kakak khawatir dikit waktu itu, tapi susah juga mau khawatir serius kalau orangnya sendiri lagi ngakak duluan.",
      "Dan itu kelihatan terus, di banyak cerita Olen yang lain. Isinya bisa sedih, bisa sakit, tapi Olen selalu bisa bawain itu dengan senyum. It's Floren that I know.",
      "Cuma kakak mau nitip satu hal. Olen boleh kok cerita yang sakit tanpa harus dilucuin dulu. Nggak semua cerita perlu jadi enak dulu buat didengerin. Kakak tetep dengerin.",
    ],
  },
  {
    di: 78,
    pembuka: "Olen lihat apa yang ada di foto ini?",
    kutipan: "UDAH DI LEMARI",
    tanggal: "30/11/24",
    foto: [
      {
        berkas: "senyum-2024.jpg",
        alt: "Floren tersenyum lebar sambil memeluk boneka Stitch, memakai filter topi dan janggut",
        ket: "senyumnya, dan Stitch yang jadi rebutan",
      },
      {
        berkas: "senyum-2024-b.jpg",
        alt: "Floren dan boneka Stitch dari sudut lain di sesi foto yang sama",
      },
    ],
    cerita: [
      "Senyum Olen. Itu yang kakak lihat duluan, sebelum yang lain.",
      "Waktu itu Olen sama Ken lagi rebutan boneka Stitch, terus Olen jawab gitu. Datar banget, dan timing-nya pas.",
      "Kakak ketawa lama banget waktu itu. Dan sampai sekarang masih. Tiap kali kakak buka lagi, rasanya hangat, bukan cuma lucu.",
      "Timing Olen itu nggak bisa ditiru. Serius, kakak udah coba.",
    ],
  },
  {
    di: 96,
    pembuka:
      "Suara Olen lagi serak karena sakit, terus ada yang nanya kenapa suaranya begitu. Jawaban Olen",
    kutipan: "KAYAK ROTI",
    tanggal: "09/11/24",
    cerita: [
      "Nggak ada yang bakal jawab gitu selain Olen.",
      "Orang lain bakal jawab lagi radang, atau kena angin, atau kebanyakan es. Olen jawab kayak roti. Dan anehnya, kebayang.",
      "Olen lagi nggak enak badan waktu itu, dan jawabannya tetep jawaban Olen. Sakit nggak bikin Olen berhenti jadi Olen.",
    ],
  },

  /* ───────────── 120–210 m · Olen menjelaskan dirinya sendiri ───────────── */
  {
    di: 120,
    pembuka:
      "Ada yang pernah bilang ke Olen kalau cara mikir Olen itu detail. Terus Olen cerita ke kakak",
    kutipan: "ktnya pemikiran aku detail trs ak jawab soalnya jg detail sama kyk yg dibuku",
    tanggal: "19/08/26",
    foto: [
      {
        berkas: "tulisan-2024.jpg",
        alt: "Buku tulis Floren, catatan Bahasa Indonesia bertanggal Kamis 11 Januari 2024, tulisan tangan rapi dan panjang",
        ket: "bukunya, 11 Januari 2024",
      },
    ],
    cerita: [
      "Perhatiin nggak cara Olen nyampeinnya? Olen bawa nama orang lain dulu. Katanya. Bukan menurut aku.",
      "Padahal yang dibilang orang itu bener, dan Olen sendiri tau itu bener. Kakak lihat sendiri bukunya, dan emang serapi itu.",
      "Olen boleh kok ngaku hal bagus tentang diri sendiri tanpa nunggu ada yang bilang duluan. Itu bukan sombong. Itu cuma tau apa yang Olen punya.",
      "Kakak tulis ini di sini biar kalau nanti Olen lagi ragu sama kepala sendiri, Olen bisa balik ke halaman ini dan baca lagi.",
    ],
  },
  {
    di: 148,
    pembuka: "Suatu hari Olen cerita soal temen Olen, dan kakak inget banget kalimat ini",
    kutipan: "kek gw suka aja seneng liat tmn gw happy",
    tanggal: "29/08/26",
    foto: [
      {
        berkas: "nasgor-2026.jpg",
        alt: "Nasi goreng dan ayam di atas meja, di belakangnya tumpukan buku psikologi",
        ket: "meja Olen, 2026",
      },
    ],
    cerita: [
      "Olen bilangnya santai, kayak lagi nyebut hal yang biasa aja.",
      "Padahal itu nggak biasa. Olen ikut seneng tanpa mikir apa untungnya buat Olen sendiri. Nggak nunggu giliran, nggak ngitung.",
      "That is rare, Olen. Beneran jarang. Banyak orang yang senengnya baru keluar kalau dia juga dapet sesuatu.",
      "Nanti bakal ada yang bilang Olen kebanyakan mikirin orang. Jangan langsung percaya. Kalau Olen ragu, dengerin dulu yang di dalem, karena kadang kita lagi takut dan tetep tau mana yang bener.",
    ],
  },
  {
    di: 178,
    pembuka: "Terus Olen cerita ini, soal temen Olen yang lagi pengen sesuatu",
    kutipan:
      "KADANG WALAU GW BAWA DUIT PAS PASAN YA TRS TMN GW MAU INI ITU TP DIA GAMAU BELI, GW BELIIN JIR",
    tanggal: "29/08/26",
    foto: [
      {
        berkas: "mie-2026.jpg",
        alt: "Mie goreng dalam kotak, foto dari dekat",
        ket: "yang dibeliin, biasanya begini",
      },
    ],
    cerita: [
      "Duit Olen sendiri pas-pasan, dan Olen tetep beliin.",
      "Nggak ada yang nyuruh, nggak ada yang lihat, dan Olen nyeritain itu ke kakak kayak lagi cerita hal receh. Bukan kayak lagi cerita kebaikan.",
      "Kakak nggak mau bikin ini jadi kalimat bijak. Kakak cuma mau nyatet bahwa Olen pernah ngelakuin itu, dan Olen ngelakuinnya justru waktu Olen sendiri lagi nggak berlebih.",
      "Satu pesan kakak: jangan sampai Olen kehabisan buat diri sendiri. Olen boleh baik, tapi Olen juga masuk daftar orang yang harus Olen jagain.",
    ],
  },
  {
    di: 210,
    pembuka: "Olen pernah bilang ke kakak, soal kenapa Olen susah mulai cerita duluan",
    kutipan:
      "sebenernya aku mau cerita kalo aku udh tras bgt ke orgnya trs kalo orgnya cerita duluan baru aku mau cerita",
    tanggal: "07/12/24",
    cerita: [
      "Jadi Olen nunggu orangnya buka duluan sebelum Olen buka. Kakak ngerti kenapa.",
      "Itu bukan tertutup. Itu jaga-jaga. Olen nggak mau naruh cerita Olen di orang yang belum jelas bakal jagain apa nggak.",
      "Beberapa hari setelahnya Olen bilang Olen pengen bisa lebih terbuka. Perhatiin kalimatnya: Olen nggak bilang aku emang tertutup. Olen bilang aku pengen bisa.",
      "Kakak seneng banget baca itu. Artinya Olen lagi jalan ke arah situ, pelan-pelan, dengan cara Olen sendiri, tanpa ada yang maksa.",
    ],
  },

  /* ───────────── 255 m · kenapa kita nggak pernah canggung ───────────── */
  {
    di: 255,
    dari: "yaya",
    kutipan:
      "Kakak sadar satu hal. Kenapa kakak nggak pernah ngerasa canggung sama Olen, padahal kita sempat lama nggak kontakan, atau kita sibuk sama urusan masing-masing.",
    cerita: [
      "Karena kakak nggak pernah ngerasa Floren pergi.",
      "Dan mungkin juga karena kita nggak pernah jadi kakak-adik yang satu ngatur dan satu nurut. Kakak nggak pernah minta Olen manggil kakak buat nunjukin siapa yang lebih tua di sini.",
      "Kita ketawa di hal yang sama. Berantem soal hal receh. Olen berani bilang kalau kakak yang salah, dan kakak dengerin. Olen boleh nggak setuju sama kakak tanpa mikir dulu kakak bakal marah apa nggak.",
      "Itu yang bikin ini awet. Bukan karena kakak jagain Olen dari atas, tapi karena kita berdiri sejajar.",
      "Kakak selalu ada di belakang Floren, di samping Floren. So that's why I always say I'm always at your side, and I promise that.",
      "Dan lihat Floren yang sekarang, makin dewasa dan bisa lewatin semuanya, kakak percaya Floren siap ngadepin dunia ini. Ada atau tanpa adanya kakak.",
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
      "Olen cuma naruh itu di situ. Kayak lagi naruh barang yang kebanyakan buat dibawa sendirian.",
      "Kakak ngerti ini berat. Dan yang paling capek dari gelisah itu justru bagian nggak tau karena apa. Kalau ada sebabnya, kita bisa benerin. Kalau nggak ketauan, kita cuma bisa nunggu sambil ngerasa aneh sama diri sendiri.",
      "Kakak mau bilang satu hal. Nggak apa-apa kalau Olen nggak bisa jelasin. Nggak semua yang kita rasa harus ada alasannya dulu baru boleh dirasain.",
      "Dan Olen nggak sendiri ya. Olen always have me at your side. Kalau lagi muak sama hari itu, Olen berhak banget istirahat dulu. Nggak ada yang nagih apa-apa ke Olen di sini.",
    ],
  },
  {
    di: 420,
    pembuka: "Dua minggu setelahnya, Olen bilang",
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    cerita: [
      "Kakak paham kenapa Olen pengen balik. Yang dulu kelihatannya lebih ringan. Lebih dikit yang dipikirin, lebih dikit yang harus dijagain.",
      "Tapi Olen yang dulu nggak hilang ke mana-mana. Dia masih ada di dalam, jadi bagian dari Olen yang sekarang.",
      "Bedanya cuma satu: Olen yang sekarang tau lebih banyak. Dan tau lebih banyak itu emang bikin capek. Capek itu ongkosnya, bukan tanda Olen mundur.",
      "Jadi kalau Olen ngerasa berubah jadi lebih berat, itu bukan karena Olen makin lemah. Itu karena Olen makin ngerti.",
      "It will pass, Oleeen. Olen udah buktiin itu ke diri sendiri berkali-kali. Tinggal Olen percaya aja.",
    ],
  },

  /* ───────────── 500–650 m · yang Olen pegang sendiri ─────────────
     Di sini ubur-ubur mulai menyala. Yang menerangi datang dari makhluknya
     sendiri, bukan dari matahari, dan yang dibaca di sini juga begitu. */
  {
    di: 500,
    pembuka: "Umur tiga belas, Olen nulis ini",
    kutipan:
      "MENDING SAMA YG BENER2 SAYANG SAMA KT DAN BENER2 MAU JADI TEMEN KITA TANPA MANDANG EKONOMI",
    tanggal: "08/12/24",
    cerita: [
      "Kakak baca ulang tanggalnya dua kali, karena nggak nyangka itu ditulis anak umur tiga belas.",
      "Banyak orang yang jauh lebih tua masih belum sampai ke kesimpulan itu. Masih ngejar lingkaran yang sebenernya nggak sayang sama mereka.",
      "Pegang terus ya. Ini yang bakal nentuin siapa yang masih ada di sekitar Olen sepuluh tahun lagi.",
    ],
  },
  {
    di: 580,
    pembuka: "Di bulan yang sama Olen bilang",
    kutipan:
      "iya aku seneng banget rasanya kalo aku bisa deket sama orang2 baik jadinya aku gaperlu haus kasih sayang sama mereka",
    tanggal: "13/11/24",
    cerita: [
      "Olen ngomong ini pelan, kayak lagi mikir sambil ngomong.",
      "Yang bikin kakak diem sebentar itu bagian nggak perlu haus. Artinya Olen pernah ngerasa haus.",
      "Dan Olen nemu sendiri jalan keluarnya. Bukan dengan minta lebih banyak, tapi dengan milih siapa yang Olen deketin.",
      "Itu bukan kalimat hafalan dari mana-mana. Itu kesimpulan Olen sendiri, dan Olen sampai ke situ tanpa ada yang ngajarin.",
    ],
  },
  {
    di: 650,
    pembuka: "Waktu ada orang lain yang lagi hancur, Olen yang bilang ini ke dia",
    kutipan: "prioritasin diri sendiri dulu kata gw mah yak",
    tanggal: "10/12/24",
    cerita: [
      "Sekarang giliran Olen yang dengerin kalimat Olen sendiri.",
      "Olen gampang banget ngasih nasihat bagus ke orang lain. Yang susah itu makenya buat diri sendiri, dan kakak tau itu susah.",
      "Kakak nggak nyuruh Olen jadi egois. Kakak cuma minta Olen masukin nama Olen sendiri ke daftar orang yang Olen jagain.",
    ],
  },

  /* ───────────── 730–790 m · dasar ───────────── */
  {
    di: 730,
    dari: "yaya",
    kutipan: "Kakak nggak pernah ngajarin satu pun dari ini ke Olen.",
    cerita: [
      "Olen bisa nahan nangis bukan karena tertutup, tapi karena Olen milih kapan mau nunjukinnya.",
      "Olen beliin temen jajan waktu duit Olen sendiri pas-pasan.",
      "Olen nanya orang baik-baik aja duluan, padahal Olen sendiri lagi enggak.",
      "Semua itu Floren bawa sendiri. Nggak ada yang ngajarin, nggak ada yang nyuruh, dan nggak ada yang lihat waktu Olen ngelakuinnya.",
      "Yang bikin kakak lama mikir: Olen nulisnya kepisah-pisah, di hari yang beda-beda, tanpa sadar lagi ngejelasin siapa Olen. Kakak cuma ngumpulin, terus nyusun biar kelihatan sebagai satu orang.",
    ],
  },
  {
    di: 790,
    dari: "yaya",
    kutipan:
      "Setelah kita journey sedalam ini, setelahnya apa? Apa ada laut yang lebih dalam lagi, atau cuma segini?",
    cerita: [
      "Itu cuma Olen yang bisa jawab. Cuma Floren seorang yang tau jawabannya.",
      "Mungkin sekarang laut ini cuma sedalam 800 meter. Tapi hidup Olen terus jalan, dan kakak harap hal-hal baik terus nyertain Olen di sepanjang jalannya.",
      "Semua yang Olen baca dari atas sampai ke sini bukan kakak yang bikin. Itu Olen yang nulis, Olen yang ngomong, Olen yang ngelakuin. Kakak cuma ngumpulin dan naruhnya berurutan.",
      "Jadi kalau nanti Olen lagi ragu sama diri sendiri, balik ke sini. Baca dari atas lagi, pelan-pelan.",
      "Jadikan hal-hal baik di dalem diri Olen sebagai fondasi yang terus bikin Floren maju dan kuat. I know you are strong, you have to believe it.",
      "Jadi gimana, mau menyelam lebih jauh lagi?",
    ],
  },
];

/**
 * Pemeriksaan yang BISA GAGAL, dijalankan saat modul dimuat.
 *
 * Sebelumnya `DASAR` cuma disebut di komentar, jadi impornya hiasan: kalau
 * suatu hari ada yang menulis `di: 900` sementara lautnya cuma 800 m,
 * kenangan itu tidak akan pernah tercapai dan tidak ada satu pun yang
 * memberi tahu. Sekarang berkasnya menolak dimuat.
 *
 * Urutan ikut diperiksa: `Turunan.tsx` membaca larik ini apa adanya, jadi
 * satu baris yang salah tempat berarti meter kedalamannya mundur di tengah
 * perjalanan.
 */
KENANGAN.forEach((k, i) => {
  if (!(k.di >= 0 && k.di <= DASAR)) {
    throw new Error(`Kenangan ke-${i} ada di ${k.di} m, di luar 0..${DASAR} m.`);
  }
  if (i > 0 && k.di <= KENANGAN[i - 1].di) {
    throw new Error(
      `Kenangan ke-${i} (${k.di} m) tidak lebih dalam dari sebelumnya (${KENANGAN[i - 1].di} m). Urutkan dari dangkal ke dalam.`,
    );
  }
});

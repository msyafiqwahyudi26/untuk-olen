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

/** Satu kalimat kecil di dalam sebuah kumpulan. */
export type Sisipan = {
  /** Kata Olen, apa adanya. */
  kutipan: string;
  tanggal?: string;
  /** Satu kalimat Kakak, pendek. Bukan paragraf. */
  catatan: string;
};

export type Kenangan = {
  /** Kedalaman dalam meter, 0 sampai DASAR. */
  di: number;
  /**
   * Kalau diisi, kenangan ini MEMBUKA sebuah babak, dan judulnya tampil
   * besar di atasnya.
   *
   * Babaknya bukan pembagian sembarangan. Ia mengikuti fisika turunannya,
   * yang sudah ada duluan di `kedalaman.ts`:
   *
   *   0 –  70 m   cahaya matahari masih sampai
   *   70 – 260 m  air membiru pekat, cahaya tinggal sisa
   *   260 m ke bawah  gelap total, yang menyala cuma makhluknya sendiri
   *
   * Yaya: "harusnya di kaitin sama eksplorasi bawah laut sih setiap alur
   * bagian ceritanya." Jadi babaknya dipaksa berimpit dengan batas cahaya
   * itu, bukan dengan jumlah kenangan. Yang paling berat ditaruh di zona
   * yang tidak lagi menerima cahaya dari atas, karena di situ yang menyala
   * memang Olen sendiri. Itu bukan hiasan; itu memang yang digambar layarnya.
   */
  babak?: string;
  /** Satu atau dua kalimat pembuka babak, tampil di bawah judulnya. */
  pengantar?: string[];
  /**
   * Kalimat Kakak SEBELUM kutipan. Biasanya pertanyaan yang mengajak Olen
   * mengingat dulu: "Olen inget nggak, waktu itu kita…".
   */
  pembuka?: string;
  /** Kata Olen. Apa adanya. Ditampilkan di dalam tanda petik.
   *  Kosong kalau kenangan ini memakai `kumpulan`. */
  kutipan?: string;
  /** Tanggal seperti di ekspor, mis. "07/12/24". Boleh kosong. */
  tanggal?: string;
  /** Siapa yang mengucapkannya. Bawaannya Olen. */
  dari?: "olen" | "yaya";
  /**
   * Beberapa kutipan KECIL sekaligus, sebagai ganti satu kutipan besar.
   *
   * Ada waktu 31 Agustus 2026, dan alasannya dari Yaya: "kutipan olen itu
   * jangan di jadiin premis utama sih kalo emang nggak begitu kuat, kaya
   * yang dia ngomong 'kayak roti' itu kan sebenernya absurd nggak kuat di
   * memori jadi aneh rasanya."
   *
   * Benar. Kalimat absurd yang dipasang sebesar judul menagih bobot yang
   * tidak dipunyainya, dan hasilnya justru terasa dipaksakan. Tapi kalimat
   * yang sama, dikumpulkan bertiga, berhenti jadi lelucon lepas dan berubah
   * jadi BUKTI dari satu pola.
   *
   * Jadi aturannya: satu kutipan berdiri sendiri HANYA kalau ia sanggup
   * menahan satu layar penuh. Kalau tidak, ia masuk kumpulan.
   */
  kumpulan?: Sisipan[];
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
  /* ═════════════════════ BABAK 1 · 0–70 m ═════════════════════
     Cahaya matahari masih sampai. Yang di sini Olen yang semua orang lihat:
     cepat, lucu, gampang diingat. Kenangannya juga dipilih yang paling
     ringan diangkat. */
  {
    di: 3,
    dari: "yaya",
    babak: "Yang kelihatan dari atas",
    pengantar: [
      "Delapan ratus meter ke bawah, dan makin ke bawah makin sedikit cahaya yang nyampe.",
      "Itu bukan kebetulan. Yang di atas sini gampang dilihat siapa aja. Yang di paling bawah cuma kelihatan kalau kita bener-bener turun ke situ.",
    ],
    kutipan: "Olen udah dengerin ulang semua VN yang kakak coba kumpulin? Gimana rasanya?",
    cerita: [
      "Sebelum kita turun, kakak mau kasih tau dulu kita mau ke mana.",
      "Di sepanjang jalan turun nanti kakak naruh sesuatu. Bukan kalimat yang kakak karang buat bikin Olen terharu. Itu kalimat Olen sendiri, dari hari-hari yang mungkin udah Olen lupa pernah ada.",
      "Floren, adik kakak yang cantik. Semua ini momen di mana Olen ketawa, nangis, marah, capek, terus besoknya bangun lagi kayak nggak ada apa-apa.",
      "It will pass. So let's enjoy our life right now, in every breath we take.",
      "Ayo turun.",
    ],
  },
  {
    di: 10,
    pembuka: "Kita mulai dari yang paling dangkal. Olen pernah ngomong ke kakak",
    kutipan: "PAS MPLS ITU SERU BANGET, TAPI GA KERASA UDAH MAU NAIK KELAS",
    tanggal: "02/01/24",
    cerita: [
      "Waktu Olen nulis ini, Olen masih kelas 7. Baru masuk SMP, baru kenal semuanya, dan tau-tau udah mau naik kelas aja rasanya.",
      "Kakak tau waktu itu ada banyak yang Olen takutin. Takut nggak punya temen, takut nggak nyambung, takut jadi yang paling ketinggalan. Olen nggak pernah bilang persis kayak gitu, tapi kelihatan dari cara Olen cerita.",
      "Kakak sengaja naruh yang ini paling atas. Karena semua yang bakal Olen baca di bawah nanti berangkatnya dari sini, dari anak kelas 7 yang masih takut sama tahun pertamanya.",
      "Sekarang lihat sendiri seberapa jauh Olen udah turun dari titik itu. So proud of you, my little sister.",
    ],
  },
  {
    di: 24,
    pembuka:
      "Masih terang di sini, dan yang di kedalaman segini paling gampang diambil. Olen ingat nggak, kita sempat bahas satu mall yang ada ice skating-nya?",
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
      "Tempatnya bisa tutup, orangnya bisa pindah, kitanya sendiri bisa berubah. Tapi rasanya tetep punya Olen, dan nggak ada satu pun yang bisa ngambil itu.",
    ],
  },
  {
    di: 40,
    pembuka:
      "Ini yang kakak baru sadar setelah baca ulang semuanya sekaligus. Olen nyebut dunia pakai kata yang beda satu langkah dari orang lain.",
    kumpulan: [
      {
        kutipan: "daun telingaku tbtb layu dikit",
        tanggal: "11/11/24",
        catatan: "Layu itu kata buat tanaman. Olen pakai buat telinga, dan anehnya kebayang.",
      },
      {
        kutipan: "KAYAK ROTI",
        tanggal: "09/11/24",
        catatan:
          "Ditanya kenapa suaranya serak waktu lagi sakit. Orang lain jawab radang. Olen jawab ini.",
      },
      {
        kutipan: "ABISTU SUMPAH PALAKU SAKIT BGTT INI KEJEDOT UJUNG LANTAI KAYANYA",
        tanggal: "02/12/24",
        catatan: "Cerita kesakitan sambil ngakak duluan, jadi kakak bingung mau khawatir apa ikut ketawa.",
      },
    ],
    cerita: [
      "Satu-satu, kalimat ini absurd dan nggak berarti apa-apa. Kakak sempat mau naruh masing-masing sendirian, dan rasanya aneh, kayak maksa lelucon jadi penting.",
      "Dikumpulin baru kelihatan polanya. Olen nggak pernah ngambil kata yang paling gampang. Olen ngambil kata yang paling kebayang, walaupun kedengarannya salah.",
      "Itu bukan aneh. Itu cara Olen ngeliat, dan itu susah banget diajarin ke orang.",
      "Jangan diilangin ya.",
    ],
  },
  {
    di: 58,
    pembuka:
      "Dan kalau kata-katanya aja udah begitu, ceritanya lebih parah lagi. Olen inget nggak, dulu kita sering banget bikin teori konspirasi?",
    kutipan: "MIMPI DIKEJAR TUYUL KALI DIA MAU LARI TP MASI GENGGAM HANDPHONE",
    tanggal: "29/12/23",
    cerita: [
      "Ingat nggak kita lagi bahas apa waktu itu? Hahaha, lupa ya pasti. Kakak juga setengah lupa, jujur.",
      "Yang kakak inget kita ketawa lama banget. Bukan karena lucunya doang, tapi karena Olen bawainnya serius, kayak lagi jelasin teori beneran yang ada dasarnya.",
      "Kepala Olen itu nggak pernah bener-bener off ya. Mimpi orang lain aja Olen bikinin teorinya.",
      "You are the special one, Olen.",
    ],
  },

  /* ═════════════════════ BABAK 2 · 70–260 m ═════════════════════
     Cahaya matahari berhenti sekitar 70 m. Di sini semuanya masih terlihat
     tapi harus lebih dekat, dan isinya juga begitu: cara Olen memperlakukan
     orang, dan cara Olen memperlakukan dirinya sendiri. */
  {
    di: 78,
    babak: "Yang harus didekati dulu",
    pengantar: [
      "Cahaya matahari berhenti sekitar sini. Di bawah ini semuanya masih kelihatan, tapi harus lebih deket.",
      "Pas, karena yang di bawah ini bagian Olen yang nggak semua orang sempat lihat.",
    ],
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
      "Kakak ketawa lama banget waktu itu, dan sampai sekarang masih.",
      "Tapi yang bikin kakak simpen ini bukan lucunya. Di situ kelihatan Olen sama orang yang Olen sayang: nggak jaga image, nggak nyari aman, nggak mikirin kelihatannya gimana.",
    ],
  },
  {
    di: 120,
    pembuka:
      "Turun lagi, dan sekarang soal isi kepalanya. Ada yang pernah bilang ke Olen kalau cara mikir Olen itu detail. Terus Olen cerita ke kakak",
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
      "Dan ini nyambung sama yang tadi di atas. Yang bikin kalimat Olen absurd dan yang bikin catatan Olen serapi ini itu satu hal yang sama: Olen merhatiin. Cuma keluarnya beda-beda.",
      "Jadi Olen boleh ngaku hal bagus tentang diri sendiri tanpa nunggu ada yang bilang duluan. Itu bukan sombong, itu cuma tau apa yang Olen punya.",
    ],
  },
  {
    di: 150,
    pembuka:
      "Dan yang Olen perhatiin bukan cuma soal pelajaran. Suatu hari Olen cerita soal temennya",
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
      "Padahal itu nggak biasa. Olen ikut seneng tanpa mikir apa untungnya buat Olen sendiri. Nggak nunggu giliran, nggak ngitung siapa duluan.",
      "That is rare, Olen. Beneran jarang. Banyak orang yang senengnya baru keluar kalau dia juga kebagian.",
    ],
  },
  {
    di: 180,
    pembuka: "Di hari yang sama, Olen cerita ini juga",
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
      "Kakak nggak mau bikin ini jadi kalimat bijak. Kakak cuma mau nyatet bahwa Olen ngelakuin itu justru waktu Olen sendiri lagi nggak berlebih.",
      "Cuma ada satu hal yang bikin kakak agak khawatir. Nanti kakak bahas, di bagian yang lebih dalam.",
    ],
  },
  {
    di: 215,
    pembuka:
      "Sekarang kebalikannya. Kalau soal orang lain Olen cepet, soal diri sendiri Olen pelan. Olen pernah bilang ke kakak",
    kutipan:
      "sebenernya aku mau cerita kalo aku udh tras bgt ke orgnya trs kalo orgnya cerita duluan baru aku mau cerita",
    tanggal: "07/12/24",
    cerita: [
      "Jadi Olen nunggu orangnya buka duluan sebelum Olen buka. Kakak ngerti kenapa.",
      "Itu bukan tertutup. Itu jaga-jaga. Olen nggak mau naruh cerita Olen di orang yang belum jelas bakal jagain apa nggak.",
      "Beberapa hari setelahnya Olen bilang Olen pengen bisa lebih terbuka. Perhatiin kalimatnya: bukan aku emang tertutup, tapi aku pengen bisa.",
      "Kakak seneng banget baca itu. Artinya Olen lagi jalan ke arah situ, pelan-pelan, dengan cara Olen sendiri, tanpa ada yang maksa.",
    ],
  },
  {
    di: 255,
    dari: "yaya",
    kutipan:
      "Kakak sadar satu hal. Kenapa kakak nggak pernah ngerasa canggung sama Olen, padahal kita sempat lama nggak kontakan.",
    cerita: [
      "Karena kakak nggak pernah ngerasa Floren pergi.",
      "Dan mungkin juga karena kita nggak pernah jadi kakak-adik yang satu ngatur dan satu nurut. Kakak nggak pernah minta Olen manggil kakak buat nunjukin siapa yang lebih tua di sini.",
      "Kita ketawa di hal yang sama. Berantem soal hal receh. Olen berani bilang kalau kakak yang salah, dan kakak dengerin.",
      "Mungkin itu juga jawaban buat yang barusan Olen bilang di atas. Olen susah mulai cerita duluan, tapi ke kakak Olen mulai. Artinya bukan Olen yang berubah, tapi Olen ngerasa aman.",
      "Kakak selalu ada di belakang Floren, di samping Floren. So that's why I always say I'm always at your side, and I promise that.",
      "Dan lihat Floren yang sekarang, kakak percaya Floren siap ngadepin dunia ini. Ada atau tanpa adanya kakak.",
    ],
  },

  /* ═════════════════════ BABAK 3 · 260–800 m ═════════════════════
     Tidak ada lagi cahaya dari atas. Yang terlihat cuma makhluk yang
     membuat cahayanya sendiri, dan yang dibaca di sini juga begitu. */
  {
    di: 320,
    babak: "Yang nyala sendiri",
    pengantar: [
      "Mulai dari sini nggak ada lagi cahaya dari atas. Yang keliatan cuma yang bikin cahayanya sendiri.",
      "Kakak naruh bagian paling berat di sini bukan biar dramatis. Tapi karena di bagian inilah yang nyala itu Olen sendiri.",
    ],
    pembuka: "Ada satu malam, Olen nulis ini ke kakak",
    kutipan:
      "sekarang aku jadi lebih susah buat ngejalanin masalah2 yg aku hadapin, aku skrg jadi sering bgt gelisah aku gatau karena apa",
    tanggal: "12/11/24",
    cerita: [
      "Olen nggak minta apa-apa waktu nulis itu. Nggak minta dikasihani, nggak minta dibenerin, nggak minta siapa-siapa panik.",
      "Olen cuma naruh itu di situ. Kayak lagi naruh barang yang kebanyakan buat dibawa sendirian.",
      "Kakak ngerti ini berat. Dan yang paling capek dari gelisah itu justru bagian nggak tau karena apa. Kalau ada sebabnya kita bisa benerin. Kalau nggak ketauan, kita cuma bisa nunggu sambil ngerasa aneh sama diri sendiri.",
      "Nggak apa-apa kalau Olen nggak bisa jelasin. Nggak semua yang kita rasa harus ada alasannya dulu baru boleh dirasain.",
      "Dan Olen nggak sendiri ya. Olen always have me at your side. Kalau lagi muak sama hari itu, Olen berhak banget istirahat dulu.",
    ],
  },
  {
    di: 420,
    pembuka: "Dua minggu setelahnya, Olen bilang",
    kutipan: "kalo bisa aku mau kayak diri aku yang dulu",
    tanggal: "26/11/24",
    cerita: [
      "Kakak paham kenapa Olen pengen balik. Yang dulu kelihatannya lebih ringan. Lebih dikit yang dipikirin, lebih dikit yang harus dijagain.",
      "Tapi Olen yang dulu nggak hilang ke mana-mana. Dia masih ada di dalem, jadi bagian dari Olen yang sekarang.",
      "Bedanya cuma satu: Olen yang sekarang tau lebih banyak. Dan tau lebih banyak itu emang bikin capek. Capek itu ongkosnya, bukan tanda Olen mundur.",
      "Inget yang di atas tadi, anak kelas 7 yang takut sama tahun pertamanya? Dia juga ngerasa berat waktu itu. Terus dia lewat.",
      "It will pass, Oleeen. Olen udah buktiin itu ke diri sendiri berkali-kali.",
    ],
  },
  {
    di: 500,
    pembuka:
      "Dan justru di bagian paling gelap ini kakak nemu kalimat-kalimat Olen yang paling terang. Umur tiga belas, Olen nulis ini",
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
    pembuka:
      "Nah, ini yang tadi kakak bilang mau kakak bahas. Waktu ada orang lain yang lagi hancur, Olen yang bilang ini ke dia",
    kutipan: "prioritasin diri sendiri dulu kata gw mah yak",
    tanggal: "10/12/24",
    cerita: [
      "Inget yang di 180 meter tadi? Olen beliin temen jajan waktu duit Olen sendiri pas-pasan.",
      "Nasihat yang Olen kasih ke orang lain ini persis yang Olen sendiri nggak pakai.",
      "Kakak nggak nyuruh Olen jadi egois. Kakak cuma minta Olen masukin nama Olen sendiri ke daftar orang yang Olen jagain. Satu nama lagi doang.",
    ],
  },
  {
    di: 730,
    dari: "yaya",
    kutipan: "Kakak nggak pernah ngajarin satu pun dari ini ke Olen.",
    cerita: [
      "Olen bisa nahan nangis bukan karena tertutup, tapi karena Olen milih kapan mau nunjukinnya.",
      "Olen beliin temen jajan waktu duit Olen sendiri pas-pasan. Olen nanya orang baik-baik aja duluan, padahal Olen sendiri lagi enggak.",
      "Semua itu Floren bawa sendiri. Nggak ada yang ngajarin, dan nggak ada yang lihat waktu Olen ngelakuinnya.",
      "Yang bikin kakak lama mikir: Olen nulisnya kepisah-pisah, di hari yang beda-beda, tanpa sadar lagi ngejelasin siapa Olen. Kakak cuma ngumpulin, terus nyusun biar kelihatan sebagai satu orang.",
      "Nanti bakal ada yang bilang Olen kebanyakan mikirin orang. Jangan langsung percaya. Kalau Olen ragu, dengerin dulu yang di dalem, karena kadang kita lagi takut dan tetep tau mana yang bener.",
    ],
  },
  {
    di: 790,
    dari: "yaya",
    kutipan:
      "Setelah kita journey sedalam ini, setelahnya apa? Apa ada laut yang lebih dalam lagi, atau cuma segini?",
    cerita: [
      "Itu cuma Olen yang bisa jawab. Cuma Floren seorang yang tau jawabannya.",
      "Kita turun dari permukaan yang terang, lewat bagian yang harus didekati dulu, sampai ke gelap yang nggak dapet cahaya dari atas sama sekali. Dan di bagian paling gelap itu ternyata isinya kalimat-kalimat Olen yang paling terang.",
      "Itu bukan kakak yang atur. Kakak cuma nyusun urut dari yang paling gampang dilihat ke yang paling dalam, dan kebetulan begitu hasilnya.",
      "Mungkin sekarang laut ini cuma sedalam 800 meter. Tapi hidup Olen terus jalan, dan kakak harap hal-hal baik terus nyertain Olen di sepanjang jalannya.",
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

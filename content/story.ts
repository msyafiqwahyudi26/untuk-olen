/**
 * Sumber kebenaran naskah. Seed script menulis ini ke SQLite.
 * Semua teks POV untuk Olen. Nada: setara, tenang, tanpa memuji diri penulis.
 */

export type Thing = { key: string; label: string; body: string; x: number };

export type Moment = {
  key: string;
  date: string;
  title: string;
  body: string;
  said?: string;
  photo?: string | null;
};

export type Shift = { then: string; now: string };

export type Quote = { text: string; date: string; weight?: "normal" | "heavy" };

export type Star = {
  key: string;
  title: string;
  date: string;
  body: string;
  photo?: string | null;
  /** nama file di /public/memori/vn TANPA ekstensi — dimuat .m4a lalu .opus */
  audio?: string | null;
  ra: number;   // -1..1  posisi horizontal di kubah langit
  dec: number;  // 0..1   posisi vertikal
  mag: number;  // 0.8..1.4 ukuran
  group: string;
};

/* ───────────────────────────  PEMBUKA  ──────────────────────────── */

export const HERO = {
  name: "Len",
  lines: [
    "Halaman ini isinya kamu.",
    "Bukan versi yang orang lain lihat — versi yang kamu tulis sendiri, sedikit-sedikit, tanpa sadar, selama hampir tiga tahun.",
  ],
  cue: "geser ke bawah",
};

/* ─────────────────────  BAB 1 — GARIS PANTAI  ───────────────────── */

export const THINGS: Thing[] = [
  {
    key: "bakso",
    label: "Bakso bakar",
    x: 0.08,
    body: "Kamu bilang sebenarnya nggak suka bakso. Tapi kalau dibakar, kamu suka. Terus tanpa diminta kamu langsung nawarin: sini, aku kasih.",
  },
  {
    key: "stitch",
    label: "Stitch",
    x: 0.2,
    body: "Boneka biru itu ikut di banyak fotomu. Waktu ketemu Stitch segede orang di Miniso, kamu foto dulu sebelum ngapa-ngapain.",
  },
  {
    key: "lagu",
    label: "月亮代表我的心",
    x: 0.33,
    body: "Lagu Mandarin favoritmu. Kamu nyanyi sendiri jam sebelas malam, terus bilang orang lain kudet karena nggak kenal lagunya.",
  },
  {
    key: "anak-kecil",
    label: "Anak kecil",
    x: 0.45,
    body: "Kamu yang ngurus sepupu-sepupumu waktu yang lain milih main. Kamu bilang ngurus anak kecil itu ada tantangannya sendiri — kalimat yang jarang keluar dari anak umur tiga belas.",
  },
  {
    key: "gambar",
    label: "Menggambar",
    x: 0.56,
    body: "Januari kamu bilang nggak suka melukis, kecuali kalau sudah ada sketsanya. Agustus kamu gambar sampai lewat tengah malam, tanpa sketsa siapa pun.",
  },
  {
    key: "tulisan",
    label: "Tulisan tangan",
    x: 0.67,
    body: "Kecil, rapat, rapi, agak miring ke kanan. Waktu ada yang bilang tulisanmu bagus, jawabanmu cuma: ih.",
  },
  {
    key: "begadang",
    label: "Jam satu pagi",
    x: 0.76,
    body: "Ditegur karena belum tidur, balasanmu satu baris: kakak juga. Sejak itu argumen ini nggak pernah bisa dimenangkan siapa pun.",
  },
  {
    key: "stiker",
    label: "Stiker",
    x: 0.85,
    body: "Nggak pernah satu. Lima, kadang tujuh, dalam empat detik. Kalau lagi nggak tahu mau jawab apa, kamu kirim stiker. Itu juga jawaban.",
  },
  {
    key: "ketawa",
    label: "Ketawa kamu",
    x: 0.72,
    body: "Ini bukan pendapat, ini catatan. Kalimat yang berulang selama tiga tahun: ketawanya nular, renyah banget, bikin kangen, gua jadi ikutan ketawa. Kamu nggak pernah tahu itu efeknya sebesar apa.",
  },
  {
    key: "ngasih",
    label: "Lima puluh ribu",
    x: 0.94,
    body: "Kamu kasih ke orang yang duduk sama anaknya di depan Alfa. Yang kamu ingat bukan uangnya. Kamu bilang rasanya happy banget.",
  },
];

/* ─────────────────────  BAB 2 — TURUN KE LAUT  ──────────────────── */

export const MOMENTS: Moment[] = [
  {
    key: "awal",
    date: "23 November 2023",
    title: "Kamu kelas tujuh",
    body: "Balasan pertamamu dua kata. Besok paginya jadi satu pertanyaan. Itu polamu sampai sekarang: pelan di awal, terus nanya.",
    said: "oh oke",
  },
  {
    key: "bego",
    date: "2 Januari 2024, 01.43",
    title: "Malam kamu bilang kamu paling bego",
    body: "Kamu nulis itu jam setengah dua pagi. Padahal malam itu kamu ngikutin semua yang dibahas, termasuk istilah-istilah yang belum kamu pelajari di mana pun. Kamu bukan nggak ngerti. Kamu cuma belum punya kata untuk hal yang kamu ngerti.",
    said: "aku rasa paling bego",
  },
  {
    key: "tulisan-2024",
    date: "11 Januari 2024",
    title: "Teks Berita",
    body: "Buku tulis, meja kelas, pulpen 0.5. Ini tulisanmu waktu kelas tujuh. Simpan baik-baik — kamu nggak akan nulis persis seperti ini lagi.",
    photo: "tulisan-2024.jpg",
  },
  {
    key: "gambar-2024",
    date: "12 Agustus 2024",
    title: "Ternyata kamu bisa",
    body: "Tujuh bulan sebelumnya kamu bilang nggak suka melukis. Malam itu kamu gambar sampai larut dan hasilnya lebih baik dari yang kamu kira. Kamu sering meremehkan hal yang belum kamu coba dua kali.",
    said: "aku mau gambar jekyung",
  },
  {
    key: "bakso-enak",
    date: "2 September 2024",
    title: "Kamu berubah pikiran",
    body: "Dua kalimat di minggu yang sama: bakso ternyata enak, dan aku mah jago mandarin. Delapan bulan sebelumnya kamu bilang kamu paling bego. Nggak ada yang mengumumkan perubahan ini. Kamu cuma pelan-pelan berhenti percaya versi lama tentang dirimu.",
    said: "aku mah jago mandarin",
  },
  {
    key: "jujur",
    date: "13 November 2024",
    title: "Malam kamu ngomong jujur",
    body: "Kamu cerita hal yang paling susah diomongin, dan kamu nggak minta dikasihani — kamu cuma nanya, hati-hati, apakah kamu bermasalah. Jawabannya waktu itu tidak berubah sampai sekarang: tidak. Dan kamu tidak pernah jadi beban siapa pun.",
    said: "makasih karena kakak selalu ngertiin aku dan selalu ngerti perasaan aku",
  },
  {
    key: "dengerin",
    date: "10 Januari 2025",
    title: "Giliran kamu yang dengerin",
    body: "Kali ini yang berantakan bukan kamu. Kamu tetap di sana, nanya terus, lalu minta maaf karena kebanyakan nanya. Nggak usah minta maaf untuk itu. Nanya adalah cara kamu menjaga orang.",
    said: "cerita ajaaa",
  },
  {
    key: "gw",
    date: "Sepanjang 2025",
    title: "Kamu berhenti sungkan",
    body: "Pelan-pelan aku jadi gw, kakak jadi lu. Bukan jadi kurang sopan — kamu cuma udah nggak merasa perlu jaga jarak. Butuh waktu satu setengah tahun untuk sampai ke situ.",
    said: "yaudah si ngalir aja",
  },
  {
    key: "sma",
    date: "22 Agustus 2026",
    title: "Kamu SMA",
    body: "Kamu sendiri kaget waktu ngetiknya. Kelas delapan — eh, tujuh. Tiga tahun lewat tanpa pemberitahuan.",
    said: "sekarang SMA ni boz",
  },
  {
    key: "hati-hati",
    date: "29 Agustus 2026",
    title: "Kamu yang bilang hati-hati",
    body: "Malam itu kamu sakit kepala, habis nangis, dan capek. Tapi yang kamu ketik: pulang dulu, hati-hati, jangan ngebut. Orang yang lagi susah biasanya berhenti mikirin orang lain. Kamu nggak.",
    said: "jan mengebut punya kalau bawa kendaraan",
  },
];

/* ────────────────  BAB 3 — DASAR: YANG BERUBAH  ────────────────── */

export const SHIFTS: Shift[] = [
  { then: "Kamu bilang nggak suka melukis.", now: "Kamu gambar sampai lewat tengah malam, dan itu bagus." },
  { then: "Kamu bilang kamu paling bego.", now: "Kamu bilang kamu jago mandarin — dan kamu benar." },
  { then: "Kalau sedih, semua orang langsung tahu.", now: "Kamu bisa nahan sampai kamu siap. Itu bukan menutup diri, itu kendali." },
  { then: "Kamu yang ditemenin sampai jam dua pagi.", now: "Kamu yang bilang cerita aja, waktu orang lain yang berantakan." },
  { then: "Banyak minta maaf untuk hal yang bukan salahmu.", now: "Masih sering. Tapi sekarang kamu tahu itu kebiasaan, bukan kenyataan." },
  { then: "Kelas tujuh, canggung, hati-hati sama setiap kalimat.", now: "SMA, santai, dan yang pertama nanya orang lain baik-baik aja atau enggak." },
];

/* ───────────────  BAB 4 — NAIK: KALIMATMU SENDIRI  ─────────────── */

export const QUOTES: Quote[] = [
  {
    text: "Ka Syafiq ngomong apa aja aku nangkep kak. Tapi kadang enggak — terus aku mikir-mikir lagi, baru nangkep deh.",
    date: "2 Januari 2024",
    weight: "heavy",
  },
  { text: "Aku seneng banget dipuji gini.", date: "2 Januari 2024" },
  {
    text: "Aku seneng banget kayak ngurus anak kecil gitu, karena aku suka banget sama anak kecil.",
    date: "2 Januari 2024",
    weight: "heavy",
  },
  { text: "Punya tantangan sendiri buat ngurus anak kicik.", date: "2 Januari 2024" },
  { text: "Ngakak banget kalau ka Syafiq nabrak rumah. Rumah kucing.", date: "2 Januari 2024" },
  {
    text: "Sebenarnya aku nggak suka bakso sih. Tapi kalau bakso bakar aku sukaaa. Makanya kakak sini, aku kasih.",
    date: "26 Agustus 2024",
  },
  { text: "Abis hapalin mandarin nih. Otaknya mandarin semua.", date: "2 September 2024" },
  {
    text: "Makasih karena kakak selalu ngertiin aku dan selalu ngerti perasaan aku.",
    date: "12 November 2024",
    weight: "heavy",
  },
  {
    text: "Aku seneng banget rasanya kalau aku bisa deket sama orang-orang baik.",
    date: "13 November 2024",
    weight: "heavy",
  },
  { text: "Aku tetep bersyukur, karena aku lebih disayang sama pho-pho aku.", date: "13 November 2024" },
  {
    text: "Menurut aku kamu itu orangnya ya nggak gimana-gimana lah, biasa-biasa aja. Tapi kamu tu baikkkkk banget gitu loh.",
    date: "10 Januari 2025",
  },
  { text: "Eh maaf banyak nanya. — Oke. Aku bakal nanya lagi nanti.", date: "10 Januari 2025" },
  {
    text: "Semoga di tahun 2024 ini kaka jadi lebih bahagia, dan apa yang kaka mau semoga tercapai ya.",
    date: "1 Januari 2024",
  },
  { text: "Ni wen wo ai ni you duo shen. Itu lagu Mandarin fav gw. Ih kamu kudet banget ya.", date: "22 Agustus 2026" },
  {
    text: "Waktu itu aku ngasih 50 ribu ke pengemis, happy banget. Kasian, di depan Alfa duduk sama anaknya.",
    date: "29 Agustus 2026",
    weight: "heavy",
  },
  {
    text: "Kalau misal gw mau nangis tapi gw malu, gw tahan bisa. Nggak kelepasan.",
    date: "29 Agustus 2026",
    weight: "heavy",
  },
  { text: "Semuanya aja lucu diisengin.", date: "29 Agustus 2026" },
  {
    text: "Lanjut nanti lagi di rumah. Lu balik dulu. Tiati. Jangan mengebut kalau bawa kendaraan.",
    date: "29 Agustus 2026",
    weight: "heavy",
  },
];

/* ──────────────────  BAB 5 — LANGIT / KONSTELASI  ──────────────── */
/* photo: nama file di /public/memori — null = bintang tanpa foto */

export const STARS: Star[] = [
  {
    key: "senyum",
    title: "Senyum yang itu",
    date: "1 Desember 2024",
    body: "Topi bucket, Stitch di sebelah, dan kumis-jenggot gambaran sendiri di muka. Kamu kirim ini bukan waktu lagi bagus-bagusnya — waktu lagi biasa aja. Itu bedanya orang yang nyaman sama dirinya.",
    photo: "senyum-2024.jpg",
    ra: -0.42,
    dec: 0.74,
    mag: 1.4,
    group: "kamu",
  },
  {
    key: "stitch-2",
    title: "Masih Stitch",
    date: "1 Desember 2024",
    body: "Menit yang sama, sudut yang beda. Kamu kirim dua-duanya karena nggak bisa milih.",
    photo: "senyum-2024-b.jpg",
    ra: -0.24,
    dec: 0.84,
    mag: 1.0,
    group: "kamu",
  },
  {
    key: "tulisan",
    title: "Kamis, 11 Januari 2024",
    date: "11 Januari 2024",
    body: "Teks Berita, B. Indo. Meja kelas, pulpen 0.5. Kalau nanti kamu lupa pernah serapi apa kamu waktu kelas tujuh — ini buktinya.",
    photo: "tulisan-2024.jpg",
    ra: -0.06,
    dec: 0.63,
    mag: 1.2,
    group: "sekolah",
  },
  {
    key: "miniso",
    title: "Stitch segede orang",
    date: "6 Desember 2024",
    body: "Kamu foto ini dulu sebelum ngapa-ngapain. Reaksi waktu itu: mau beliin semua buat kamu. Nggak jadi, tapi niatnya nyata.",
    photo: "miniso-stitch.jpg",
    ra: 0.16,
    dec: 0.79,
    mag: 1.1,
    group: "kamu",
  },
  {
    key: "nasgor",
    title: "Makan malam, difoto dulu",
    date: "15 Agustus 2026",
    body: "Nasi goreng, ayam, kerupuk, dan tumpukan buku psikologi di belakangnya. Kamu selalu foto makanan sebelum makan. Nggak pernah dijelasin kenapa.",
    photo: "nasgor-2026.jpg",
    ra: 0.42,
    dec: 0.58,
    mag: 1.0,
    group: "makan",
  },
  {
    key: "mie",
    title: "Mie",
    date: "22 Agustus 2026",
    body: "Dua tahun berlalu dan urutannya tetap sama: foto dulu, baru makan.",
    photo: "mie-2026.jpg",
    ra: 0.58,
    dec: 0.7,
    mag: 0.9,
    group: "makan",
  },
  {
    key: "suara-2024",
    title: "Ketawa kamu, 2024",
    date: "6 Desember 2024",
    body: "Dua puluh satu detik. Yang ditulis setelah ini: “olen ketawanya nular banget”. Kalau suatu hari kamu lupa kamu menyenangkan buat berada di dekatnya, putar ini.",
    photo: null,
    audio: "ketawa-nular",
    ra: -0.78,
    dec: 0.66,
    mag: 1.35,
    group: "suara",
  },
  {
    key: "suara-nahan",
    title: "Nahan ketawa jam sebelas malam",
    date: "21 Desember 2024",
    body: "Lima detik. Kamu ngomong sambil nahan suara karena pho-pho kamu lagi tidur. Kamu tetap peduli sama orang lain bahkan waktu lagi ngakak sendirian.",
    photo: null,
    audio: "nahan-ketawa",
    ra: -0.86,
    dec: 0.46,
    mag: 1.05,
    group: "suara",
  },
  {
    key: "suara-2026",
    title: "Ketawa kamu, 2026",
    date: "22 Agustus 2026",
    body: "Dua tahun kemudian. Suaranya beda, ketawanya sama. Ini yang bikin balasan malam itu cuma: “anjir gua jadi ikutan ketawa”.",
    photo: null,
    audio: "ketawa-2026",
    ra: 0.86,
    dec: 0.6,
    mag: 1.2,
    group: "suara",
  },
  {
    key: "malam-jujur",
    title: "13 November 2024",
    date: "13 November 2024",
    body: "Nggak ada fotonya. Cuma percakapan panjang sampai malam. Kamu nanya sesuatu yang berat, dan jawabannya masih sama sampai hari ini: kamu nggak bermasalah, dan kamu nggak pernah jadi beban.",
    photo: null,
    ra: -0.63,
    dec: 0.5,
    mag: 1.3,
    group: "malam",
  },
  {
    key: "jam-dua",
    title: "Jam dua pagi",
    date: "2 Januari 2024",
    body: "Obrolan panjang yang pertama. Kamu bilang kamu paling bego, terus lanjut ngobrol dua jam lagi dan membuktikan sebaliknya tanpa sadar.",
    photo: null,
    ra: -0.5,
    dec: 0.36,
    mag: 1.0,
    group: "malam",
  },
  {
    key: "sma",
    title: "Tiba-tiba SMA",
    date: "22 Agustus 2026",
    body: "Kamu sendiri yang kaget. Kelas delapan — eh, tujuh. Sekarang SMA.",
    photo: null,
    ra: 0.69,
    dec: 0.43,
    mag: 1.1,
    group: "sekolah",
  },
  {
    key: "hati-hati",
    title: "Pulang dulu, hati-hati",
    date: "29 Agustus 2026",
    body: "Kalimat terakhir yang kamu ketik malam itu, waktu kamu sendiri lagi nggak enak badan.",
    photo: null,
    ra: 0.3,
    dec: 0.33,
    mag: 1.25,
    group: "malam",
  },
];

export const STAR_LINKS: [string, string][] = [
  ["senyum", "stitch-2"],
  ["stitch-2", "miniso"],
  ["senyum", "malam-jujur"],
  ["malam-jujur", "jam-dua"],
  ["tulisan", "sma"],
  ["tulisan", "senyum"],
  ["nasgor", "mie"],
  ["miniso", "nasgor"],
  ["hati-hati", "malam-jujur"],
  ["hati-hati", "sma"],
  ["suara-2024", "suara-nahan"],
  ["suara-2024", "senyum"],
  ["suara-2026", "mie"],
  ["suara-2026", "sma"],
];

/* ────────────────────────────  FAJAR  ──────────────────────────── */

export const CLOSING = {
  title: "Kalau kamu buka ini lagi nanti",
  paragraphs: [
    "Kemungkinan besar kamu buka halaman ini bukan waktu lagi senang. Biasanya begitu. Jadi bagian ini ditulis untuk hari itu.",
    "Kamu jujur, bahkan waktu jujur bikin kamu kelihatan lemah. Kamu perhatian sama orang lain sebelum diminta, dan kamu sering lupa itu bukan hal biasa. Ketawa kamu bikin orang lain ikut ketawa. Dan kamu masih di sini, setelah semua yang sudah kamu lewatin.",
    "Kalau nanti ada yang bikin kamu ngerasa kurang — orang, nilai, keluarga, siapa pun — baca ulang bagian mana pun di halaman ini. Semuanya kalimat kamu sendiri. Nggak ada yang ditambah-tambahin.",
    "Nggak ada yang minta kamu jadi lebih dari ini.",
  ],
  noteInvite: "Ada ruang kosong di bawah. Buat kamu, bukan buat siapa-siapa.",
  notePlaceholder: "tulis apa aja…",
  sign: "— dari yang kamu panggil Ka Sapik",
};

export const CHAPTERS = [
  { key: "things", eyebrow: "Garis pantai", title: "Yang menempel" },
  { key: "moments", eyebrow: "Turun", title: "Yang sudah kamu lewati" },
  { key: "shifts", eyebrow: "Dasar", title: "Yang berubah" },
  { key: "quotes", eyebrow: "Naik", title: "Kalimatmu sendiri" },
  { key: "sky", eyebrow: "Langit", title: "Yang nggak hilang" },
  { key: "dawn", eyebrow: "Fajar", title: CLOSING.title },
];

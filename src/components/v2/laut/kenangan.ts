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
  /** Di sisi mana ia muncul. Berselang-seling kalau tidak diisi. */
  sisi?: "kiri" | "kanan";
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
 * KOSONG, dan itu bukan kelalaian.
 *
 * Yang boleh mengisinya adalah orang yang memegang ekspor WhatsApp-nya, dan
 * ekspor itu ada di komputer Yaya — bukan di server ini, dan memang tidak
 * boleh ada di sini. Menaruh kutipan karangan sebagai contoh akan lebih
 * buruk daripada membiarkannya kosong: kalimat yang terdengar masuk akal
 * paling mudah lolos tanpa ada yang memeriksa apakah Olen benar-benar pernah
 * mengucapkannya.
 *
 * Dua contoh di bawah sengaja dibuat MUSTAHIL disangka sungguhan, supaya
 * mekanismenya bisa dilihat bekerja tanpa satu pun kalimat palsu yang
 * ditempelkan ke nama seorang anak.
 */
export const KENANGAN: Kenangan[] = [
  {
    di: 24,
    kutipan: "[ contoh tempat — kutipan pertama akan berdiri di sini ]",
    tanggal: "—",
    catatan: "Catatan dari Yaya muncul di bawah kutipannya, dengan huruf lebih kecil.",
  },
  {
    di: 260,
    kutipan: "[ contoh tempat — yang lebih dalam terasa lebih sunyi ]",
    tanggal: "—",
    sisi: "kanan",
  },
];

import type { Mood } from "@/lib/mood";

/**
 * ═══ RUPA PERASAAN ═══
 *
 * Sembilan wajah, digambar sendiri sebagai SVG.
 *
 *
 * ── KENAPA TIDAK EMOJI ──
 *
 * Sampai 1 September 2026 barisnya memakai emoji. Tiga hal yang bikin itu
 * tidak jalan di sini:
 *
 *   1. Warnanya tidak bisa diatur. Emoji digambar peramban dengan paletnya
 *      sendiri, jadi ia tetap oranye terang di atas langit apa pun. Di
 *      seluruh halaman ini tinta ikut warna langit; cuma emoji yang tidak,
 *      dan itu yang bikin barisnya terlihat seperti tempelan.
 *   2. Bentuknya beda-beda tiap perangkat. Wajah yang di iPhone terbaca
 *      "capek" bisa terbaca "ngantuk" di Android, dan yang sedang dinamai
 *      di sini perasaan orang.
 *   3. Tidak ada emoji yang pas untuk beberapa yang dibutuhkan tanpa jadi
 *      berlebihan. Emoji marah itu merah menyala dengan alis mengerut;
 *      dipakai anak SMP yang lagi marah beneran, ia terasa mengejek.
 *
 *
 * ── ATURAN GAMBARNYA ──
 *
 * Semuanya dibangun dari bahan yang sama: satu lingkaran, dua mata, satu
 * mulut. Yang membedakan cuma lengkung mulut, bentuk mata, dan paling
 * banyak SATU tanda tambahan. Kalau tiap wajah punya hiasannya sendiri,
 * barisnya berubah jadi sembilan gambar yang harus dibaca satu-satu, bukan
 * satu tangga yang bisa dipindai sekali lihat.
 *
 * `stroke="currentColor"` di semuanya, jadi wajahnya ikut tinta halaman dan
 * ikut berubah waktu tombolnya terpilih. Tidak ada satu pun warna tetap.
 *
 * `vectorEffect="non-scaling-stroke"` supaya garisnya tetap setebal itu di
 * ukuran berapa pun; tanpa itu, wajah kecil di HP punya garis yang ikut
 * mengecil dan hilang duluan sebelum bentuknya.
 */

const ISI: Record<Mood, React.ReactNode> = {
  /* Mata melengkung ke atas, mulut lebar. Senyum yang sampai ke mata. */
  senang: (
    <>
      <path d="M8.5 10.5c.7-.9 1.8-.9 2.5 0" />
      <path d="M13 10.5c.7-.9 1.8-.9 2.5 0" />
      <path d="M8 14c1.2 1.8 6.8 1.8 8 0" />
    </>
  ),
  /* Sama seperti senang, ditambah dua garis pendek yang memancar. Bukan
     bintang atau tanda seru: yang dibedakan tingkat energinya, bukan
     jenisnya. */
  semangat: (
    <>
      <path d="M8.5 10.5c.7-.9 1.8-.9 2.5 0" />
      <path d="M13 10.5c.7-.9 1.8-.9 2.5 0" />
      <path d="M8.4 13.6c1.4 2.2 5.8 2.2 7.2 0" />
      <path d="M4.6 6.4 3.2 5" />
      <path d="M19.4 6.4 20.8 5" />
    </>
  ),
  /* Mata garis lurus, mulut hampir datar dan sedikit naik. Tenang bukan
     senang yang dikecilkan; ia diam. */
  tenang: (
    <>
      <path d="M8.6 10.6h2.2" />
      <path d="M13.2 10.6h2.2" />
      <path d="M9 14.2c1.2.9 4.8.9 6 0" />
    </>
  ),
  /* Satu mata lebih tinggi, mulut miring. Bingung itu tidak seimbang, dan
     itu yang paling cepat terbaca tanpa perlu tanda tanya. */
  bingung: (
    <>
      <circle cx="9.6" cy="10.2" r="1" />
      <path d="M13.2 9.6h2.4" />
      <path d="M8.8 14.8c1.6-1.1 4-.2 6.4-1" />
    </>
  ),
  /* Mata terpejam berat, mulut kecil. Tanpa tanda tambahan apa pun. */
  capek: (
    <>
      <path d="M8.4 11.2c.8.8 1.9.8 2.7 0" />
      <path d="M12.9 11.2c.8.8 1.9.8 2.7 0" />
      <path d="M10.2 14.8h3.6" />
    </>
  ),
  /* Mata bulat besar, mulut bergelombang. Cemas itu bangun, bukan sedih. */
  cemas: (
    <>
      <circle cx="9.5" cy="10.4" r="1.15" />
      <circle cx="14.5" cy="10.4" r="1.15" />
      <path d="M8.8 14.6c.7-.8 1.4.8 2.1 0s1.4.8 2.1 0 1.4.8 2.1 0" />
    </>
  ),
  /* Mata turun di ujung luar, mulut melengkung ke bawah. */
  sedih: (
    <>
      <path d="M8.4 10c.8.5 1.9.7 2.6.9" />
      <path d="M15.6 10c-.8.5-1.9.7-2.6.9" />
      <path d="M8.6 15.4c1.2-1.8 5.6-1.8 6.8 0" />
    </>
  ),
  /* Alis miring ke dalam, mulut satu garis miring. Kesal itu menahan. */
  kesal: (
    <>
      <path d="M8 9.2l2.6 1.1" />
      <path d="M16 9.2l-2.6 1.1" />
      <path d="M9 14.6h6" />
      <path d="M9.6 12.1h.01" />
      <path d="M14.4 12.1h.01" />
    </>
  ),
  /* Alis lebih tajam, mulut melengkung ke bawah dan lebar. Marah itu kesal
     yang sudah tidak ditahan. Sengaja TIDAK diberi tanda tambahan seperti
     uap atau urat: yang sedang dicatat perasaan Olen, bukan lelucon
     tentangnya. */
  marah: (
    <>
      <path d="M7.7 8.8l3 1.5" />
      <path d="M16.3 8.8l-3 1.5" />
      <path d="M8.6 15.6c1.2-1.9 5.6-1.9 6.8 0" />
      <path d="M9.9 12.2h.01" />
      <path d="M14.1 12.2h.01" />
    </>
  ),
};

export default function RupaRasa({ rasa, ukuran = 24 }: { rasa: Mood; ukuran?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={ukuran}
      height={ukuran}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="8.4" />
      {ISI[rasa]}
    </svg>
  );
}

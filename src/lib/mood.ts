/**
 * ═══ PERASAAN ═══
 *
 * Berkas sendiri, dan itu BUKAN kerapian belaka.
 *
 * Daftar ini dibutuhkan di dua tempat: `db.ts` memakainya untuk menyaring apa
 * yang boleh masuk basis data, dan layar jurnal memakainya untuk menggambar
 * tombolnya. Layar jurnal berjalan di peramban.
 *
 * Sempat saya taruh di `db.ts`, dan build-nya langsung gagal:
 *
 *     the chunking context does not support external modules
 *     (request: node:sqlite)
 *
 * Sebabnya `db.ts` mengimpor `node:sqlite`, dan satu impor NILAI dari sana ke
 * komponen klien menyeret seluruh mesin basis data ke bundel peramban. Impor
 * TIPE aman karena hilang saat dikompilasi; impor nilai tidak.
 *
 * Jadi daftar yang dipakai kedua sisi harus tinggal di berkas yang tidak tahu
 * apa-apa soal disk.
 *
 *
 * ── KENAPA LIMA, DAN KENAPA TIDAK ADA "BIASA SAJA" ──
 *
 * Sengaja sedikit: pilihan yang panjang berubah jadi tugas memilih, dan yang
 * ditanya di sini cuma "hari ini gimana", bukan sebuah survei.
 *
 * Dan sengaja tidak ada yang netral. Hari yang biasa saja tetap salah satu
 * dari lima ini, dan harus memilih satu justru bagian dari gunanya — "biasa
 * saja" adalah jawaban yang paling mudah dipakai untuk tidak menjawab.
 */

/*
 * ── DARI LIMA JADI SEMBILAN (1 September 2026) ──
 *
 * Catatan di atas sebelumnya berbunyi "sengaja sedikit: pilihan yang panjang
 * berubah jadi tugas memilih". Alasan itu tidak salah, tapi ia menjawab
 * pertanyaan yang salah. Yang bikin memilih jadi tugas bukan JUMLAHNYA,
 * melainkan pilihan yang mirip-mirip sehingga harus dibanding-bandingkan.
 *
 * Dan lima ternyata terlalu sedikit untuk alasan yang lebih penting: marah
 * tidak ada di daftar. Anak yang lagi marah lalu disuruh memilih antara
 * "kesal" dan "sedih" bukan sedang dibantu menamai perasaannya, dia sedang
 * dipaksa mengecilkannya. Begitu juga bingung, yang bukan sedih dan bukan
 * capek tapi punya rasanya sendiri.
 *
 * Sembilan ini disusun berurutan dari yang paling ringan ke yang paling
 * berat, jadi barisnya sendiri sudah jadi tangga dan mata tidak perlu
 * membandingkan satu-satu.
 *
 * MENAMBAH nilai baru AMAN untuk data lama. Kolomnya teks berisi daftar
 * dipisah koma, dan `baca()` menyaring dengan `sahMood`, jadi catatan yang
 * ditulis sebelum hari ini tetap terbaca apa adanya. Yang TIDAK aman adalah
 * MENGHAPUS atau MENGGANTI NAMA nilai yang sudah pernah dipakai: itu
 * membuat perasaan yang pernah dicatat Olen hilang tanpa jejak. Kalau suatu
 * saat perlu, tambahkan yang baru dan biarkan yang lama tetap ada.
 */
export const MOOD = [
  "senang",
  "semangat",
  "tenang",
  "bingung",
  "capek",
  "cemas",
  "sedih",
  "kesal",
  "marah",
] as const;

export type Mood = (typeof MOOD)[number];

export const sahMood = (v: unknown): v is Mood =>
  typeof v === "string" && (MOOD as readonly string[]).includes(v);

/**
 * ═══ LEBIH DARI SATU PERASAAN ═══
 *
 * Disimpan sebagai satu teks berisi daftar dipisah koma, bukan tabel
 * tersendiri. Alasannya bukan kemalasan: kolomnya sudah ada dan sudah berisi
 * satu nilai tunggal, dan daftar berkoma tetap terbaca sebagai nilai tunggal
 * oleh kode lama. Jadi catatan yang sudah ditulis sebelum hari ini tidak
 * perlu disentuh sama sekali.
 *
 * Dan yang lebih penting: satu hari MEMANG bisa dua perasaan sekaligus.
 * Bahagia dan sedih di hari yang sama bukan kebingungan yang perlu
 * diluruskan — itu bentuk hari yang paling sering terjadi, dan memaksa
 * memilih salah satu membuat catatannya kurang jujur.
 */

/** "senang,sedih" → ["senang", "sedih"]. Tahan terhadap nilai lama, kosong,
 *  maupun nama yang sudah tidak dikenal. */
export function baca(mood: string | null | undefined): Mood[] {
  if (!mood) return [];
  return mood
    .split(",")
    .map((m) => m.trim())
    .filter(sahMood);
}

/** ["senang", "sedih"] → "senang,sedih". Urutannya mengikuti MOOD supaya dua
 *  pilihan yang sama selalu tersimpan dengan teks yang sama. */
export function tulis(daftar: readonly string[]): string | null {
  const bersih = MOOD.filter((m) => daftar.includes(m));
  return bersih.length ? bersih.join(",") : null;
}

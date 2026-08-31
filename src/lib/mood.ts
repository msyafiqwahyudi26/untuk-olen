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

export const MOOD = ["senang", "tenang", "capek", "sedih", "kesal"] as const;

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

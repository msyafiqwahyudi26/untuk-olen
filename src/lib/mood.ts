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

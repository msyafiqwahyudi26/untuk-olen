import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
/* Daftar perasaannya tinggal di berkas sendiri karena layar jurnal — yang
   berjalan di peramban — juga memerlukannya. Lihat catatan di lib/mood.ts. */
import { baca as bacaMood, tulis as tulisMood } from "./mood";

const DB_PATH = process.env.OLEN_DB ?? path.join(process.cwd(), "data", "olen.db");

let _db: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const d = new DatabaseSync(DB_PATH);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS things (
      key TEXT PRIMARY KEY, label TEXT NOT NULL, body TEXT NOT NULL, x REAL NOT NULL, ord INTEGER
    );
    CREATE TABLE IF NOT EXISTS moments (
      key TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL,
      body TEXT NOT NULL, said TEXT, photo TEXT, ord INTEGER
    );
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY, then_text TEXT NOT NULL, now_text TEXT NOT NULL, ord INTEGER
    );
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY, text TEXT NOT NULL, date TEXT NOT NULL, weight TEXT, ord INTEGER
    );
    CREATE TABLE IF NOT EXISTS stars (
      key TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, body TEXT NOT NULL,
      photo TEXT, audio TEXT, ra REAL NOT NULL, dec REAL NOT NULL, mag REAL NOT NULL, grp TEXT, ord INTEGER
    );
    CREATE TABLE IF NOT EXISTS star_links (
      a TEXT NOT NULL, b TEXT NOT NULL, PRIMARY KEY (a, b)
    );

    /* Ruang tulis Olen. Lokal, tidak dikirim ke mana-mana. */
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      mood TEXT,
      /* Waktu dihapus. NULL berarti masih ada. TIDAK PERNAH ada penghapusan
         sungguhan di sini — lihat catatan panjang di hapusNote(). */
      dihapus TEXT,
      penting INTEGER NOT NULL DEFAULT 0,
      diubah TEXT
    );

    /*
     * ═══ RIWAYAT — jaring pengaman untuk tulisan Olen ═══
     *
     * Tiap kali sebuah catatan diubah atau dihapus, ISINYA YANG LAMA disalin
     * ke sini lebih dulu. Tabel ini hanya pernah ditambahi; tidak ada satu
     * pun kode yang menghapus darinya.
     *
     * Alasannya bukan teknis. Yang menulis di sini seorang anak, dan orang
     * menghapus tulisannya sendiri paling sering justru saat sedang marah
     * atau malu — lalu menyesalinya keesokan hari. Kalau penghapusan bersifat
     * final, satu menit emosi bisa menghapus sesuatu yang ingin dibacanya
     * lagi bertahun-tahun kemudian.
     *
     * Jadi "hapus" di layar berarti "sembunyikan", dan yang sudah pernah
     * ditulis tetap ada.
     */
    CREATE TABLE IF NOT EXISTS note_revisi (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id  INTEGER NOT NULL,
      body     TEXT    NOT NULL,
      mood     TEXT,
      sebab    TEXT    NOT NULL,
      pada     TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_revisi_note ON note_revisi (note_id, id DESC);

    /* PIN empat angka. Satu baris saja, selamanya — CHECK (id = 1) membuat
     * baris kedua mustahil, jadi tidak akan pernah ada dua kunci yang
     * bersaing dan tidak perlu ada kode yang memilih di antaranya.
     * Isi dan alasannya di src/lib/kunci.ts. */
    CREATE TABLE IF NOT EXISTS kunci (
      id            INTEGER PRIMARY KEY CHECK (id = 1),
      sidik         TEXT    NOT NULL,
      garam         TEXT    NOT NULL,
      gagal         INTEGER NOT NULL DEFAULT 0,
      tunggu_sampai INTEGER NOT NULL DEFAULT 0
    );
  `);
  /*
   * Basis data yang SUDAH ADA tidak ikut berubah oleh CREATE TABLE IF NOT
   * EXISTS di atas — perintah itu hanya berlaku kalau tabelnya belum ada.
   * Jadi kolom `mood` harus ditambahkan terpisah.
   *
   * ALTER TABLE ADD COLUMN adalah satu-satunya perubahan skema yang aman di
   * sini: ia menambah, tidak pernah menghapus atau menyusun ulang. Tulisan
   * Olen di kolom `body` tidak tersentuh sama sekali.
   *
   * Dibungkus try/catch dan bukan diperiksa lebih dulu karena SQLite tidak
   * punya "ADD COLUMN IF NOT EXISTS". Menjalankannya dua kali melempar galat
   * "duplicate column name", dan itu justru pertanda kolomnya sudah ada —
   * bukan kegagalan.
   */
  for (const kolom of [
    "ALTER TABLE notes ADD COLUMN mood TEXT",
    "ALTER TABLE notes ADD COLUMN dihapus TEXT",
    "ALTER TABLE notes ADD COLUMN penting INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE notes ADD COLUMN diubah TEXT",
  ]) {
    try {
      d.exec(kolom);
    } catch {
      /* sudah ada */
    }
  }

  _db = d;
  return d;
}

/* ── pembacaan ── */

export type ThingRow = { key: string; label: string; body: string; x: number };
export type MomentRow = {
  key: string; date: string; title: string; body: string;
  said: string | null; photo: string | null;
};
export type ShiftRow = { then_text: string; now_text: string };
export type QuoteRow = { text: string; date: string; weight: string | null };
export type StarRow = {
  key: string; title: string; date: string; body: string;
  photo: string | null; audio: string | null;
  ra: number; dec: number; mag: number; grp: string | null;
};
export type NoteRow = {
  id: number;
  body: string;
  created_at: string;
  mood: string | null;
  penting: number;
  diubah: string | null;
  dihapus: string | null;
};

export type RevisiRow = {
  id: number;
  note_id: number;
  body: string;
  mood: string | null;
  sebab: string;
  pada: string;
};

/**
 * node:sqlite mengembalikan baris dengan prototype null — React Server Components
 * menolak mengoper objek semacam itu ke client component. Jadi disalin jadi objek biasa.
 */
const all = <T,>(sql: string): T[] =>
  (db().prepare(sql).all() as unknown[]).map((r) => ({ ...(r as object) })) as T[];

export const getThings  = () => all<ThingRow>("SELECT key,label,body,x FROM things ORDER BY ord");
export const getMoments = () => all<MomentRow>("SELECT key,date,title,body,said,photo FROM moments ORDER BY ord");
export const getShifts  = () => all<ShiftRow>("SELECT then_text,now_text FROM shifts ORDER BY ord");
export const getQuotes  = () => all<QuoteRow>("SELECT text,date,weight FROM quotes ORDER BY ord");
export const getStars   = () => all<StarRow>("SELECT key,title,date,body,photo,audio,ra,dec,mag,grp FROM stars ORDER BY ord");
export const getStarLinks = () => all<{ a: string; b: string }>("SELECT a,b FROM star_links");
const KOLOM = "id,body,created_at,mood,penting,diubah,dihapus";

/** Yang masih ada. Yang dihapus tidak ikut, tapi tidak hilang. */
export const getNotes = () =>
  all<NoteRow>(`SELECT ${KOLOM} FROM notes WHERE dihapus IS NULL ORDER BY id DESC LIMIT 300`);

/** Yang sudah disembunyikan Olen, untuk dikembalikan kalau ia berubah pikiran. */
export const getTerhapus = () =>
  all<NoteRow>(`SELECT ${KOLOM} FROM notes WHERE dihapus IS NOT NULL ORDER BY id DESC LIMIT 100`);

const satu = (id: number): NoteRow | null => {
  const r = db().prepare(`SELECT ${KOLOM} FROM notes WHERE id = ?`).get(id);
  return r ? ({ ...(r as object) } as NoteRow) : null;
};

/**
 * Menyimpan keadaan catatan SEKARANG ke riwayat, sebelum ia berubah.
 *
 * Dipanggil lebih dulu oleh setiap tindakan yang mengubah atau menghapus.
 * Urutannya penting dan bukan selera: kalau disimpan sesudahnya, yang
 * terekam adalah hasil perubahannya — dan yang lama, justru yang ingin
 * diselamatkan, sudah tidak ada.
 */
function rekam(id: number, sebab: "diubah" | "dihapus") {
  const n = satu(id);
  if (!n) return;
  db()
    .prepare("INSERT INTO note_revisi (note_id, body, mood, sebab) VALUES (?, ?, ?, ?)")
    .run(n.id, n.body, n.mood, sebab);
}

export function addNote(body: string, mood?: string | null) {
  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) return null;
  const m = tulisMood(bacaMood(mood));
  db().prepare("INSERT INTO notes (body, mood) VALUES (?, ?)").run(trimmed, m);
  return getNotes()[0] ?? null;
}

export function ubahNote(id: number, body: string, mood?: string | null) {
  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) return null;
  rekam(id, "diubah");
  db()
    .prepare("UPDATE notes SET body = ?, mood = ?, diubah = datetime('now') WHERE id = ?")
    .run(trimmed, tulisMood(bacaMood(mood)), id);
  return satu(id);
}

/**
 * "Hapus" berarti SEMBUNYIKAN. Tidak ada DELETE di sini, dan itu disengaja.
 *
 * Orang menghapus tulisannya sendiri paling sering saat sedang marah atau
 * malu, lalu menyesalinya keesokan hari. Kalau penghapusan bersifat final,
 * satu menit emosi bisa menghapus sesuatu yang ingin dibaca lagi
 * bertahun-tahun kemudian.
 *
 * Isinya juga direkam ke riwayat lebih dulu, jadi ada dua lapis: barisnya
 * masih ada di `notes` dengan tanda `dihapus`, DAN salinannya ada di
 * `note_revisi`.
 */
export function hapusNote(id: number) {
  rekam(id, "dihapus");
  db().prepare("UPDATE notes SET dihapus = datetime('now') WHERE id = ?").run(id);
  return satu(id);
}

export function pulihNote(id: number) {
  db().prepare("UPDATE notes SET dihapus = NULL WHERE id = ?").run(id);
  return satu(id);
}

export function tandaiPenting(id: number, penting: boolean) {
  db().prepare("UPDATE notes SET penting = ? WHERE id = ?").run(penting ? 1 : 0, id);
  return satu(id);
}

export const getRevisi = (noteId: number) =>
  (db()
    .prepare("SELECT id,note_id,body,mood,sebab,pada FROM note_revisi WHERE note_id = ? ORDER BY id DESC")
    .all(noteId) as unknown[]).map((r) => ({ ...(r as object) })) as RevisiRow[];

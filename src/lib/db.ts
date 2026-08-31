import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
export type NoteRow = { id: number; body: string; created_at: string };

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
export const getNotes   = () => all<NoteRow>("SELECT id,body,created_at FROM notes ORDER BY id DESC LIMIT 50");

export function addNote(body: string) {
  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) return null;
  db().prepare("INSERT INTO notes (body) VALUES (?)").run(trimmed);
  return getNotes()[0] ?? null;
}

export function deleteNote(id: number) {
  db().prepare("DELETE FROM notes WHERE id = ?").run(id);
}

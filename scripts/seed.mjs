/**
 * Isi SQLite dari content/story.ts.
 *   npm run seed
 * Aman diulang — tabel konten di-reset, tabel `notes` TIDAK pernah disentuh.
 * Butuh Node >= 22.18 (type stripping bawaan + node:sqlite).
 */
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.OLEN_DB ?? path.join(root, "data", "olen.db");

const storyUrl = pathToFileURL(path.join(root, "content", "story.ts")).href;
let S;
try {
  S = await import(storyUrl);
} catch (e) {
  console.error(
    "Gagal membaca content/story.ts.\n" +
      "Butuh Node 22.18+ (type stripping bawaan). Node sekarang: " + process.version
  );
  throw e;
}

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const d = new DatabaseSync(dbPath);

d.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS things   (key TEXT PRIMARY KEY, label TEXT NOT NULL, body TEXT NOT NULL, x REAL NOT NULL, ord INTEGER);
  CREATE TABLE IF NOT EXISTS moments  (key TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, said TEXT, photo TEXT, ord INTEGER);
  CREATE TABLE IF NOT EXISTS shifts   (id INTEGER PRIMARY KEY, then_text TEXT NOT NULL, now_text TEXT NOT NULL, ord INTEGER);
  CREATE TABLE IF NOT EXISTS quotes   (id INTEGER PRIMARY KEY, text TEXT NOT NULL, date TEXT NOT NULL, weight TEXT, ord INTEGER);
  CREATE TABLE IF NOT EXISTS stars    (key TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, body TEXT NOT NULL, photo TEXT, audio TEXT, ra REAL NOT NULL, dec REAL NOT NULL, mag REAL NOT NULL, grp TEXT, ord INTEGER);
  CREATE TABLE IF NOT EXISTS star_links (a TEXT NOT NULL, b TEXT NOT NULL, PRIMARY KEY (a,b));
  CREATE TABLE IF NOT EXISTS notes    (id INTEGER PRIMARY KEY AUTOINCREMENT, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
`);

d.exec("DELETE FROM things; DELETE FROM moments; DELETE FROM shifts; DELETE FROM quotes; DELETE FROM stars; DELETE FROM star_links;");

const t = d.prepare("INSERT INTO things (key,label,body,x,ord) VALUES (?,?,?,?,?)");
S.THINGS.forEach((x, i) => t.run(x.key, x.label, x.body, x.x, i));

const m = d.prepare("INSERT INTO moments (key,date,title,body,said,photo,ord) VALUES (?,?,?,?,?,?,?)");
S.MOMENTS.forEach((x, i) => m.run(x.key, x.date, x.title, x.body, x.said ?? null, x.photo ?? null, i));

const sh = d.prepare("INSERT INTO shifts (then_text,now_text,ord) VALUES (?,?,?)");
S.SHIFTS.forEach((x, i) => sh.run(x.then, x.now, i));

const q = d.prepare("INSERT INTO quotes (text,date,weight,ord) VALUES (?,?,?,?)");
S.QUOTES.forEach((x, i) => q.run(x.text, x.date, x.weight ?? "normal", i));

const st = d.prepare("INSERT INTO stars (key,title,date,body,photo,audio,ra,dec,mag,grp,ord) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
S.STARS.forEach((x, i) => st.run(x.key, x.title, x.date, x.body, x.photo ?? null, x.audio ?? null, x.ra, x.dec, x.mag, x.group ?? null, i));

const sl = d.prepare("INSERT OR IGNORE INTO star_links (a,b) VALUES (?,?)");
S.STAR_LINKS.forEach(([a, b]) => sl.run(a, b));

const n = d.prepare("SELECT COUNT(*) c FROM notes").get().c;
console.log(
  `seed ok -> ${dbPath}\n` +
    `  things ${S.THINGS.length} | moments ${S.MOMENTS.length} | shifts ${S.SHIFTS.length} | ` +
    `quotes ${S.QUOTES.length} | stars ${S.STARS.length} | links ${S.STAR_LINKS.length}\n` +
    `  catatan Olen: ${n} (tidak disentuh)`
);
d.close();

"use client";

import { useMemo, useState } from "react";
import type { NoteRow } from "@/lib/db";
/* MOOD dari lib/mood, BUKAN dari lib/db. Mengimpor nilai dari db.ts ke
   komponen klien menyeret node:sqlite ke bundel peramban dan build-nya gagal.
   Impor TIPE di baris atas aman — ia hilang saat dikompilasi. */
import { MOOD } from "@/lib/mood";
import { PALET, type Waktu } from "./waktu";
import { warnaLangitDi } from "./ketinggian";
import { aset } from "@/lib/basis";
import "./jurnal.css";

/**
 * ═══ JURNAL — buku harian Olen di langit ═══
 *
 * ── KENAPA PERJALANAN GULIRNYA DIBUANG ──
 *
 * Versi sebelumnya membuat layar ini jadi perjalanan sepanjang 460vh:
 * menggulir menaikkan ketinggian, langitnya menggelap, bintangnya muncul.
 * Cantik, dan salah — dinilai "scroll ke atasnya jauh banget dan jadi banyak
 * yang kosong", dan penilaian itu tepat.
 *
 * Sebabnya bukan panjangnya melainkan JENIS halamannya. Turunan ke laut
 * adalah tempat yang dilewati: sesekali dibuka, dinikmati, ditutup. Jurnal
 * bukan itu. Ia dibuka untuk MELAKUKAN sesuatu — menulis satu kalimat lalu
 * pergi — dan mungkin dibuka tiap hari. Segala yang berdiri antara Olen dan
 * kotak tulisnya akan berubah dari indah jadi menyebalkan sekitar kunjungan
 * kelima.
 *
 * Jadi langitnya sekarang LATAR, bukan lintasan. Ia tetap diturunkan dari
 * `ketinggian.ts` dan tetap berganti menurut waktu — pagi, siang, sore,
 * malam — tapi tidak lagi menuntut digulir untuk berubah.
 *
 *
 * ── DAN KENAPA MENULISNYA DI GARIS, BUKAN DI KOTAK ──
 *
 * Kotak berbingkai adalah formulir. Ia bertanya "isi ini", dan yang mengisi
 * formulir menulis sependek mungkin. Garis adalah buku: ia tidak bertanya
 * apa-apa, cuma menyediakan tempat, dan orang menulis sepanjang yang ia mau.
 *
 * Garisnya digambar dengan repeating-linear-gradient yang jaraknya SAMA
 * PERSIS dengan line-height tulisannya. Kalau kedua angka itu berbeda sedikit
 * saja, hurufnya merayap naik-turun terhadap garisnya seiring paragraf makin
 * panjang — dan itu terbaca sebagai cacat, bukan sebagai buku.
 */

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function pecahTanggal(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return { panjang: s, hari: "", pendek: s };
  const [, y, bl, d] = m;
  const tgl = new Date(`${y}-${bl}-${d}T00:00:00`);
  return {
    panjang: `${Number(d)} ${BULAN[Number(bl) - 1]} ${y}`,
    pendek: `${Number(d)} ${BULAN[Number(bl) - 1].slice(0, 3)}`,
    hari: HARI[tgl.getDay()] ?? "",
  };
}

const RASA: Record<string, string> = {
  senang: "😊",
  tenang: "🌤",
  capek: "😮‍💨",
  sedih: "🥺",
  kesal: "😤",
};

export default function Jurnal({
  waktu,
  catatan,
  onTurun,
}: {
  waktu: Waktu;
  catatan: NoteRow[];
  onTurun: () => void;
}) {
  const [tulisan, setTulisan] = useState<NoteRow[]>(catatan);
  const [draft, setDraft] = useState("");
  const [rasa, setRasa] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  /** null = sedang menulis hari ini. Berisi id = sedang membaca yang lama. */
  const [dibaca, setDibaca] = useState<number | null>(null);

  /* Warna langit di ketinggian nol = warna langit permukaan yang SEDANG
     berlaku, jadi ia berganti sendiri antara pagi, siang, sore, dan malam.
     Diturunkan, bukan dipatok — sama seperti seluruh proyek ini. */
  const langit = warnaLangitDi(0, PALET[waktu].langit[1]);
  const gelap = waktu === "malam" || waktu === "sore";

  const hariIni = useMemo(() => {
    const n = new Date();
    return pecahTanggal(
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(
        n.getDate(),
      ).padStart(2, "0")}`,
    );
  }, []);

  const sedangDibaca = dibaca === null ? null : (tulisan.find((t) => t.id === dibaca) ?? null);

  async function simpan() {
    const isi = draft.trim();
    if (!isi || sibuk) return;
    setSibuk(true);
    setGalat(null);
    try {
      const r = await fetch(aset("/api/notes"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: isi, mood: rasa }),
      });
      if (!r.ok) throw new Error();
      const baru = (await r.json()) as NoteRow;
      setTulisan((t) => [baru, ...t]);
      setDraft("");
      setRasa(null);
    } catch {
      setGalat("belum kesimpan. coba lagi sebentar.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className={`jr${gelap ? " jr-gelap" : ""}`} style={{ ["--langit" as string]: langit }}>
      <div className="jr-latar" aria-hidden>
        <div className="jr-bintang" />
        <div className="jr-jatuh">
          {[
            { x: 16, y: 10, p: 24, s: 32, t: 17, m: 3 },
            { x: 68, y: 18, p: 30, s: 27, t: 25, m: 11 },
            { x: 42, y: 6, p: 20, s: 36, t: 31, m: 21 },
          ].map((j, i) => (
            <span
              key={i}
              style={{
                left: `${j.x}%`,
                top: `${j.y}%`,
                width: `${j.p}vmin`,
                transform: `rotate(${j.s}deg)`,
                /* Durasinya SELURUH putaran; keyframes-nya cuma terlihat di 8
                   persen pertama. Jadi melintas sekitar sedetik lalu sunyi
                   belasan detik. Yang membuat bintang jatuh berarti justru
                   karena jarang. */
                animationDuration: `${j.t}s`,
                animationDelay: `-${j.m}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="jr-lembar">
        <header className="jr-kepala">
          <div>
            <p className="jr-kop">sky notes</p>
            <h1 className="jr-tgl serif">
              {sedangDibaca ? pecahTanggal(sedangDibaca.created_at).panjang : hariIni.panjang}
            </h1>
            <p className="jr-hari">
              {sedangDibaca ? pecahTanggal(sedangDibaca.created_at).hari : hariIni.hari}
            </p>
          </div>
          <button type="button" className="jr-tombol jr-pulang" onClick={onTurun}>
            kembali ke bumi
          </button>
        </header>

        {sedangDibaca ? (
          <article className="jr-baca">
            {sedangDibaca.mood && (
              <p className="jr-rasa-lama">
                <span aria-hidden>{RASA[sedangDibaca.mood]}</span> {sedangDibaca.mood}
              </p>
            )}
            <p className="jr-tulisan-lama">{sedangDibaca.body}</p>
            <button type="button" className="jr-tombol" onClick={() => setDibaca(null)}>
              tulis hari ini
            </button>
          </article>
        ) : (
          <>
            <section className="jr-rasa">
              <p className="jr-tanya">how is your day?</p>
              <div className="jr-rasa-baris" role="group" aria-label="Perasaan hari ini">
                {MOOD.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`jr-rasa-tombol${rasa === m ? " on" : ""}`}
                    aria-pressed={rasa === m}
                    onClick={() => setRasa((r) => (r === m ? null : m))}
                  >
                    <span aria-hidden>{RASA[m]}</span>
                    <span className="jr-rasa-nama">{m}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Garis, bukan kotak. */}
            <textarea
              className="jr-garis"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={4000}
              rows={9}
              placeholder="hari ini…"
              aria-label="Tulisan hari ini"
            />

            <div className="jr-kaki">
              <span className="jr-hitung">
                {galat ?? `${draft.trim() ? draft.trim().split(/\s+/).length : 0} kata`}
              </span>
              <button
                type="button"
                className="jr-tombol jr-simpan"
                onClick={simpan}
                disabled={!draft.trim() || sibuk}
              >
                {sibuk ? "menyimpan" : "simpan"}
              </button>
            </div>
          </>
        )}

        {tulisan.length > 0 && (
          <section className="jr-arsip" aria-label="Tulisan sebelumnya">
            <p className="jr-arsip-judul">sebelumnya</p>
            <ul className="jr-arsip-daftar">
              {tulisan.map((n) => {
                const t = pecahTanggal(n.created_at);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={`jr-arsip-tombol${dibaca === n.id ? " on" : ""}`}
                      onClick={() => setDibaca(dibaca === n.id ? null : n.id)}
                    >
                      <span className="jr-arsip-tgl">{t.pendek}</span>
                      {n.mood && <span aria-hidden>{RASA[n.mood]}</span>}
                      <span className="jr-arsip-cuplik">{n.body.slice(0, 42)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

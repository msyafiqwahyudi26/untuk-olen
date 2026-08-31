"use client";

import { useState } from "react";
import type { NoteRow } from "@/lib/db";
import { aset } from "@/lib/basis";

/** "2026-08-30 19:38:36" -> "30 Agustus 2026" */
function tanggal(s: string) {
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return s;
  return `${Number(m[3])} ${bulan[Number(m[2]) - 1]} ${m[1]}`;
}

/**
 * `daftar` dan `onTambah` ditambahkan 1 September supaya layar jurnal bisa
 * menampilkan catatannya sebagai BUKU — bertanggal, satu halaman satu entri —
 * tanpa membangun ruang tulis kedua.
 *
 * Bawaannya tetap seperti semula, jadi pemakaian di v1 tidak berubah sama
 * sekali. Yang butuh tampilan lain mematikan daftarnya dan menangkap catatan
 * baru lewat onTambah.
 */
export default function NoteSpace({
  initial,
  daftar = true,
  onTambah,
}: {
  initial: NoteRow[];
  daftar?: boolean;
  onTambah?: (n: NoteRow) => void;
}) {
  const [notes, setNotes] = useState<NoteRow[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const body = draft.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr(null);
    try {
      /*
       * aset(), BUKAN "/api/notes" telanjang.
       *
       * Sejak aplikasi dipasang di arcc-hivee.cloud/len, alamat mutlak yang
       * ditulis sebagai teks tidak lagi menunjuk ke mana pun: "/api/notes"
       * menjawab 404 sementara "/len/api/notes" menjawab 200. Diperiksa,
       * bukan diduga.
       *
       * Gagalnya senyap dan mahal: tulisan Olen tidak tersimpan, dan yang
       * muncul cuma "Belum kesimpan. Coba lagi sebentar." — kalimat yang
       * menyalahkan jaringan untuk kesalahan yang sebenarnya ada di alamat.
       * Tidak ketahuan sampai hari ini karena halaman jurnalnya memang belum
       * pernah dibuka sejak basePath dipasang.
       */
      const r = await fetch(aset("/api/notes"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!r.ok) throw new Error();
      const note = (await r.json()) as NoteRow;
      setNotes((n) => [note, ...n]);
      onTambah?.(note);
      setDraft("");
    } catch {
      setErr("Belum kesimpan. Coba lagi sebentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        className="gc"
        style={{ borderRadius: "var(--r-lg)", padding: "clamp(20px,4vw,32px)" }}
      >
        <textarea
          className="note-ta"
          rows={5}
          value={draft}
          maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="tulis apa aja…"
          aria-label="Ruang tulis"
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ fontSize: ".68rem", letterSpacing: ".12em", color: "var(--text-dim)" }}>
            {err ?? `${draft.trim() ? draft.trim().split(/\s+/).length : 0} kata`}
          </span>
          <button
            onClick={save}
            disabled={!draft.trim() || busy}
            style={{
              fontSize: ".68rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              padding: "9px 20px",
              borderRadius: 999,
              cursor: draft.trim() ? "pointer" : "default",
              color: draft.trim() ? "var(--star-gold)" : "var(--text-dim)",
              background: draft.trim() ? "rgba(244,228,176,0.09)" : "transparent",
              border: `1px solid ${draft.trim() ? "rgba(244,228,176,0.3)" : "rgba(255,255,255,0.08)"}`,
              transition: "all .4s var(--ease)",
            }}
          >
            {busy ? "menyimpan" : "simpan"}
          </button>
        </div>
      </div>

      {daftar && notes.length > 0 && (
        <ul style={{ listStyle: "none", margin: "28px 0 0", padding: 0 }}>
          {notes.map((n) => (
            <li
              key={n.id}
              style={{
                padding: "18px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="serif"
                style={{ fontSize: ".95rem", lineHeight: 1.85, color: "rgba(200,225,245,0.82)", whiteSpace: "pre-wrap" }}
              >
                {n.body}
              </p>
              <div style={{ marginTop: 8, fontSize: ".64rem", letterSpacing: ".14em", color: "var(--text-dim)" }}>
                {tanggal(n.created_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

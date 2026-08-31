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
  /** id catatan yang sedang disunting; null = tidak sedang menyunting. */
  const [sunting, setSunting] = useState<number | null>(null);
  const [suntingIsi, setSuntingIsi] = useState("");
  /** Yang sudah disembunyikan, dimuat hanya kalau lacinya dibuka. */
  const [terhapus, setTerhapus] = useState<NoteRow[] | null>(null);
  const [bulan, setBulan] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), b: n.getMonth() };
  });

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

  /* Semua tindakan lewat satu jalan yang sama supaya penanganan galatnya
     tidak tersebar. Yang membedakan cuma muatannya. */
  async function ubah(muatan: Record<string, unknown>) {
    setGalat(null);
    try {
      const r = await fetch(aset("/api/notes"), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(muatan),
      });
      if (!r.ok) throw new Error();
      const n = (await r.json()) as NoteRow;
      setTulisan((t) => {
        const ada = t.some((x) => x.id === n.id);
        return ada ? t.map((x) => (x.id === n.id ? n : x)) : [n, ...t];
      });
      return n;
    } catch {
      setGalat("belum tersimpan. coba lagi sebentar.");
      return null;
    }
  }

  /**
   * "Hapus" menyembunyikan, tidak menghapus. Isinya tetap ada di riwayat
   * basis data dan bisa dikembalikan dari laci di bawah.
   *
   * Karena itu tidak ada kotak konfirmasi "yakin?". Konfirmasi hanya berguna
   * kalau tindakannya tidak bisa dibatalkan; di sini ia cuma menambah satu
   * langkah untuk sesuatu yang aman, dan mengajari orang menekan "yakin"
   * tanpa membaca.
   */
  async function hapus(id: number) {
    setGalat(null);
    try {
      const r = await fetch(aset(`/api/notes?id=${id}`), { method: "DELETE" });
      if (!r.ok) throw new Error();
      setTulisan((t) => t.filter((x) => x.id !== id));
      setTerhapus(null);
      if (dibaca === id) setDibaca(null);
      if (sunting === id) setSunting(null);
    } catch {
      setGalat("belum tersimpan. coba lagi sebentar.");
    }
  }

  async function bukaLaci() {
    if (terhapus) return setTerhapus(null);
    try {
      const r = await fetch(aset("/api/notes?terhapus=1"));
      setTerhapus(((await r.json()) as NoteRow[]) ?? []);
    } catch {
      setGalat("laci tidak bisa dibuka sekarang.");
    }
  }

  async function pulihkan(id: number) {
    const n = await ubah({ id, pulih: true });
    if (n) setTerhapus((t) => (t ? t.filter((x) => x.id !== id) : t));
  }

  /* Hari-hari di bulan yang sedang dilihat, berikut catatan yang jatuh di
     situ. Dihitung sekali per perubahan, bukan di dalam gelung render. */
  const kalender = useMemo(() => {
    const pertama = new Date(bulan.y, bulan.b, 1);
    const jumlahHari = new Date(bulan.y, bulan.b + 1, 0).getDate();
    const geser = pertama.getDay();
    const perHari = new Map<number, NoteRow[]>();
    for (const n of tulisan) {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(n.created_at);
      if (!m) continue;
      if (Number(m[1]) !== bulan.y || Number(m[2]) - 1 !== bulan.b) continue;
      const d = Number(m[3]);
      perHari.set(d, [...(perHari.get(d) ?? []), n]);
    }
    return { jumlahHari, geser, perHari };
  }, [bulan, tulisan]);

  const namaBulan = `${BULAN[bulan.b]} ${bulan.y}`;

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
            <div className="jr-baca-atas">
              {sedangDibaca.mood && (
                <p className="jr-rasa-lama">
                  <span aria-hidden>{RASA[sedangDibaca.mood]}</span> {sedangDibaca.mood}
                </p>
              )}
              <button
                type="button"
                className={`jr-bintang-tombol${sedangDibaca.penting ? " on" : ""}`}
                aria-pressed={!!sedangDibaca.penting}
                aria-label={sedangDibaca.penting ? "Lepas tanda penting" : "Tandai penting"}
                onClick={() => ubah({ id: sedangDibaca.id, penting: !sedangDibaca.penting })}
              >
                {sedangDibaca.penting ? "★" : "☆"}
              </button>
            </div>

            {sunting === sedangDibaca.id ? (
              <>
                <textarea
                  className="jr-garis"
                  value={suntingIsi}
                  onChange={(e) => setSuntingIsi(e.target.value)}
                  maxLength={4000}
                  rows={8}
                  aria-label="Sunting tulisan"
                />
                <div className="jr-kaki">
                  <button type="button" className="jr-tombol" onClick={() => setSunting(null)}>
                    batal
                  </button>
                  <button
                    type="button"
                    className="jr-tombol jr-simpan"
                    disabled={!suntingIsi.trim()}
                    onClick={async () => {
                      const n = await ubah({
                        id: sedangDibaca.id,
                        body: suntingIsi,
                        mood: sedangDibaca.mood,
                      });
                      if (n) setSunting(null);
                    }}
                  >
                    simpan
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="jr-tulisan-lama">{sedangDibaca.body}</p>
                {sedangDibaca.diubah && (
                  <p className="jr-diubah">pernah diubah</p>
                )}
                <div className="jr-baca-aksi">
                  <button type="button" className="jr-tombol" onClick={() => setDibaca(null)}>
                    tulis hari ini
                  </button>
                  <button
                    type="button"
                    className="jr-tombol"
                    onClick={() => {
                      setSunting(sedangDibaca.id);
                      setSuntingIsi(sedangDibaca.body);
                    }}
                  >
                    ubah
                  </button>
                  <button
                    type="button"
                    className="jr-tombol jr-hapus"
                    onClick={() => hapus(sedangDibaca.id)}
                  >
                    hapus
                  </button>
                </div>
                <p className="jr-jaminan">
                  yang dihapus masih bisa dikembalikan dari laci di bawah.
                </p>
              </>
            )}
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

        <section className="jr-kalender" aria-label="Kalender catatan">
          <div className="jr-kal-kepala">
            <button
              type="button"
              className="jr-kal-panah"
              aria-label="Bulan sebelumnya"
              onClick={() =>
                setBulan(({ y, b }) => (b === 0 ? { y: y - 1, b: 11 } : { y, b: b - 1 }))
              }
            >
              ‹
            </button>
            <p className="jr-kal-bulan">{namaBulan}</p>
            <button
              type="button"
              className="jr-kal-panah"
              aria-label="Bulan berikutnya"
              onClick={() =>
                setBulan(({ y, b }) => (b === 11 ? { y: y + 1, b: 0 } : { y, b: b + 1 }))
              }
            >
              ›
            </button>
          </div>

          <div className="jr-kal-kisi" role="grid">
            {["m", "s", "s", "r", "k", "j", "s"].map((h, i) => (
              <span key={i} className="jr-kal-hari" aria-hidden>
                {h}
              </span>
            ))}
            {Array.from({ length: kalender.geser }, (_, i) => (
              <span key={`k${i}`} aria-hidden />
            ))}
            {Array.from({ length: kalender.jumlahHari }, (_, i) => {
              const d = i + 1;
              const isi = kalender.perHari.get(d) ?? [];
              const penting = isi.some((n) => n.penting);
              return (
                <button
                  key={d}
                  type="button"
                  className={`jr-kal-tgl${isi.length ? " ada" : ""}${penting ? " penting" : ""}`}
                  disabled={!isi.length}
                  aria-label={
                    isi.length ? `${d} ${BULAN[bulan.b]}, ${isi.length} catatan` : `${d}`
                  }
                  onClick={() => isi.length && setDibaca(isi[0].id)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </section>

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
                      {n.penting ? <span aria-hidden className="jr-arsip-penting">★</span> : null}
                      {n.mood && <span aria-hidden>{RASA[n.mood]}</span>}
                      <span className="jr-arsip-cuplik">{n.body.slice(0, 42)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/*
          Laci yang dihapus.
          Ditaruh paling bawah dan tertutup secara bawaan: ia jaring pengaman,
          bukan bagian dari kegiatan sehari-hari. Yang perlu terlihat tiap
          hari cuma kotak tulis dan arsip.
        */}
        <section className="jr-laci">
          <button type="button" className="jr-laci-tombol" onClick={bukaLaci}>
            {terhapus ? "tutup" : "yang dihapus"}
          </button>
          {terhapus &&
            (terhapus.length === 0 ? (
              <p className="jr-laci-kosong">belum ada yang dihapus.</p>
            ) : (
              <ul className="jr-arsip-daftar">
                {terhapus.map((n) => (
                  <li key={n.id} className="jr-laci-baris">
                    <span className="jr-arsip-tgl">{pecahTanggal(n.created_at).pendek}</span>
                    <span className="jr-arsip-cuplik">{n.body.slice(0, 36)}</span>
                    <button
                      type="button"
                      className="jr-tombol jr-pulih"
                      onClick={() => pulihkan(n.id)}
                    >
                      kembalikan
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { AcaraRow, NoteRow } from "@/lib/db";
/* MOOD dari lib/mood, BUKAN dari lib/db. Mengimpor nilai dari db.ts ke
   komponen klien menyeret node:sqlite ke bundel peramban dan build-nya gagal.
   Impor TIPE di baris atas aman — ia hilang saat dikompilasi. */
import { MOOD, baca as bacaMood, tulis as tulisMood } from "@/lib/mood";
import { PALET, type Waktu } from "./waktu";
import { warnaLangitDi } from "./ketinggian";
import Settings, { type Pengaturan } from "./Settings";
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
  set,
  ubahSet,
  onTurun,
}: {
  waktu: Waktu;
  catatan: NoteRow[];
  set: Pengaturan;
  ubahSet: (patch: Partial<Pengaturan>) => void;
  onTurun: () => void;
}) {
  const [tulisan, setTulisan] = useState<NoteRow[]>(catatan);
  const [draft, setDraft] = useState("");
  /** Bisa lebih dari satu. Satu hari memang bisa bahagia sekaligus sedih. */
  const [rasa, setRasa] = useState<string[]>([]);
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
  const [judul, setJudul] = useState("");
  const [subjudul, setSubjudul] = useState("");
  const [menu, setMenu] = useState(false);
  const [acara, setAcara] = useState<AcaraRow[]>([]);
  /** Tanggal yang sedang dibuka dari kalender, "YYYY-MM-DD". */
  const [tglDipilih, setTglDipilih] = useState<string | null>(null);
  const [acaraBaru, setAcaraBaru] = useState("");
  const [acaraUltah, setAcaraUltah] = useState(false);

  useEffect(() => {
    fetch(aset("/api/acara"))
      .then((r) => r.json())
      .then((a: AcaraRow[]) => setAcara(a))
      .catch(() => {});
  }, []);

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

  /**
   * ═══ SATU HARI BOLEH BANYAK CATATAN ═══
   *
   * Versi sebelumnya mengunci satu halaman per hari: menulis lagi di hari
   * yang sama MENGUBAH yang sudah ada. Itu keliru, dan alasannya sederhana —
   * satu hari bisa punya beberapa hal yang layak ditulis terpisah, dan
   * memaksanya jadi satu halaman berarti yang kedua menimpa yang pertama.
   *
   * Yang tetap dipertahankan dari versi itu: mood bisa diubah kapan saja
   * lewat layar baca tiap catatan, jadi salah pencet tidak permanen.
   */
  async function simpan() {
    const isi = draft.trim();
    if (!isi || sibuk) return;
    setSibuk(true);
    setGalat(null);
    try {
      const r = await fetch(aset("/api/notes"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: isi, mood: tulisMood(rasa), judul, subjudul }),
      });
      if (!r.ok) throw new Error();
      const n = (await r.json()) as NoteRow;
      setTulisan((t) => [n, ...t]);
      setDraft("");
      setJudul("");
      setSubjudul("");
      setRasa([]);
    } catch {
      setGalat("belum kesimpan. coba lagi sebentar.");
    } finally {
      setSibuk(false);
    }
  }

  async function tambahAcara(tanggal: string) {
    const j = acaraBaru.trim();
    if (!j) return;
    try {
      const r = await fetch(aset("/api/acara"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tanggal,
          judul: j,
          jenis: acaraUltah ? "ulang-tahun" : "acara",
          /* Ulang tahun otomatis berulang tiap tahun. Tanpa itu ia harus
             dimasukkan ulang tiap tahun, dan yang paling mungkin terjadi
             adalah lupa. */
          tiapTahun: acaraUltah,
        }),
      });
      if (!r.ok) throw new Error();
      const baru = (await r.json()) as AcaraRow;
      setAcara((a) => [...a, baru]);
      setAcaraBaru("");
      setAcaraUltah(false);
    } catch {
      setGalat("acara belum tersimpan.");
    }
  }

  async function buangAcara(id: number) {
    try {
      await fetch(aset(`/api/acara?id=${id}`), { method: "DELETE" });
      setAcara((a) => a.filter((x) => x.id !== id));
    } catch {
      setGalat("acara belum terhapus.");
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

    /* Acara yang jatuh di bulan ini. Yang bertanda tiap_tahun cukup cocok
       bulan dan tanggalnya — tahunnya diabaikan, jadi ulang tahun muncul di
       tahun berapa pun tanpa perlu dimasukkan ulang. */
    const acaraHari = new Map<number, AcaraRow[]>();
    for (const a of acara) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(a.tanggal);
      if (!m) continue;
      const cocokBulan = Number(m[2]) - 1 === bulan.b;
      const cocokTahun = a.tiap_tahun ? true : Number(m[1]) === bulan.y;
      if (!cocokBulan || !cocokTahun) continue;
      const d = Number(m[3]);
      acaraHari.set(d, [...(acaraHari.get(d) ?? []), a]);
    }

    return { jumlahHari, geser, perHari, acaraHari };
  }, [bulan, tulisan, acara]);

  const kunciTanggal = (d: number) =>
    `${bulan.y}-${String(bulan.b + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const hariDipilih = tglDipilih ? Number(tglDipilih.slice(8, 10)) : null;

  const namaBulan = `${BULAN[bulan.b]} ${bulan.y}`;

  return (
    <div className={`jr${gelap ? " jr-gelap" : ""}`} style={{ ["--langit" as string]: langit }}>
      <div className="jr-latar" aria-hidden>
        <div className="jr-bintang" />
        <div className="jr-jatuh">
          {[
            /* Sudutnya kecil — 6 sampai 14 derajat — jadi lintasannya
               MENYAMPING, bukan menukik ke bawah. Dinilai "harusnya ke
               samping", dan itu memang lebih benar: bintang jatuh yang
               terlihat dari bawah melintas hampir mendatar di kubah langit,
               bukan jatuh tegak lurus seperti benda yang dilepas. */
            { x: 4, y: 14, p: 34, s: 8, t: 15, m: 3 },
            { x: 4, y: 30, p: 28, s: 12, t: 23, m: 11 },
            { x: 4, y: 8, p: 40, s: 6, t: 29, m: 20 },
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
          {/* Judulnya di TENGAH, dan menunya di kanan sebagai tiga garis.
              Isi menunya masih sedikit — itu disengaja: rangkanya dibuat dulu
              supaya menambah tujuan baru nanti tidak menuntut menata ulang
              kepala halaman. */}
          {/* Garis tiga di KIRI: setelan suara. Panel yang dipakai sama persis
              dengan yang di layar pembuka — komponen yang sama, state yang
              sama. Dua panel serupa yang mengatur hal yang sama adalah cara
              paling mudah membuat "sudah saya matikan" jadi tidak benar. */}
          <div className="jr-setelan">
            <Settings buka={menu} onBuka={setMenu} nilai={set} onUbah={ubahSet} garisTiga />
          </div>

          <p className="jr-kop">sky notes</p>

          <button type="button" className="jr-tombol jr-pulang" onClick={onTurun}>
            kembali ke bumi
          </button>

          <h1 className="jr-tgl serif">
            {sedangDibaca ? pecahTanggal(sedangDibaca.created_at).panjang : hariIni.panjang}
          </h1>
          <p className="jr-hari">
            {sedangDibaca ? pecahTanggal(sedangDibaca.created_at).hari : hariIni.hari}
          </p>
        </header>

        <div className="jr-kolom-tulis">
        {sedangDibaca ? (
          <article className="jr-baca">
            <div className="jr-baca-atas">
              {bacaMood(sedangDibaca.mood).length > 0 && (
                <p className="jr-rasa-lama">
                  {bacaMood(sedangDibaca.mood).map((m) => (
                    <span key={m} className="jr-rasa-cap">
                      <span aria-hidden>{RASA[m]}</span> {m}
                    </span>
                  ))}
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

            {sedangDibaca.judul && <h2 className="jr-judul-baca serif">{sedangDibaca.judul}</h2>}
            {sedangDibaca.subjudul && <p className="jr-subjudul-baca">{sedangDibaca.subjudul}</p>}

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
            {/* Judul lebih dulu, dan besar. Yang ditulis orang pertama kali
                biasanya inti harinya; menaruh kotak isian di bawah pertanyaan
                mood membuat inti itu antre di belakang. */}
            <input
              className="jr-judul-isian"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              maxLength={160}
              placeholder="judul hari ini"
              aria-label="Judul"
            />
            <input
              className="jr-subjudul-isian"
              value={subjudul}
              onChange={(e) => setSubjudul(e.target.value)}
              maxLength={240}
              placeholder="satu baris tambahan — boleh dikosongkan"
              aria-label="Sub-judul"
            />

            <section className="jr-rasa">
              <p className="jr-tanya">how is your day?</p>
              <div className="jr-rasa-baris" role="group" aria-label="Perasaan hari ini">
                {MOOD.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`jr-rasa-tombol${rasa.includes(m) ? " on" : ""}`}
                    aria-pressed={rasa.includes(m)}
                    onClick={() =>
                      setRasa((r) => (r.includes(m) ? r.filter((x) => x !== m) : [...r, m]))
                    }
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
                {galat ?? `${draft.trim().split(/\s+/).filter(Boolean).length} kata`}
              </span>
              <button
                type="button"
                className="jr-tombol jr-simpan"
                /* () => simpan(), BUKAN simpan.
                   Mengoper fungsinya langsung membuat React mengirim objek
                   peristiwa klik sebagai argumen pertama — yang di sini
                   berarti daftar mood. Ditangkap TypeScript sebelum sempat
                   tayang. */
                onClick={() => simpan()}
                disabled={!draft.trim() || sibuk}
              >
                {sibuk ? "menyimpan" : "simpan"}
              </button>
            </div>
          </>
        )}

        </div>

        <div className="jr-kolom-samping">
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
              const ac = kalender.acaraHari.get(d) ?? [];
              const penting = isi.some((n) => n.penting);
              const ultah = ac.some((a) => a.jenis === "ulang-tahun");
              /* SETIAP tanggal bisa ditekan sekarang, bukan cuma yang ada
                 catatannya — tanggal kosong pun perlu bisa dipilih untuk
                 menaruh ulang tahun teman di sana. */
              return (
                <button
                  key={d}
                  type="button"
                  className={
                    `jr-kal-tgl${isi.length ? " ada" : ""}${penting ? " penting" : ""}` +
                    `${ac.length ? " acara" : ""}${hariDipilih === d ? " pilih" : ""}`
                  }
                  aria-label={`${d} ${BULAN[bulan.b]}${isi.length ? `, ${isi.length} catatan` : ""}${
                    ac.length ? `, ${ac.length} acara` : ""
                  }`}
                  onClick={() => setTglDipilih(tglDipilih === kunciTanggal(d) ? null : kunciTanggal(d))}
                >
                  {d}
                  {ac.length > 0 && (
                    <span className="jr-kal-titik" aria-hidden>
                      {ultah ? "🎂" : "•"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {tglDipilih && (
            <div className="jr-kal-panel">
              <p className="jr-kal-panel-tgl">{pecahTanggal(tglDipilih).panjang}</p>

              {(kalender.acaraHari.get(hariDipilih ?? 0) ?? []).map((a) => (
                <div key={a.id} className="jr-kal-acara">
                  <span aria-hidden>{a.jenis === "ulang-tahun" ? "🎂" : "•"}</span>
                  <span className="jr-kal-acara-judul">{a.judul}</span>
                  <button
                    type="button"
                    className="jr-kal-buang"
                    aria-label={`Hapus ${a.judul}`}
                    onClick={() => buangAcara(a.id)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {(kalender.perHari.get(hariDipilih ?? 0) ?? []).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="jr-kal-catatan"
                  onClick={() => setDibaca(n.id)}
                >
                  {n.penting ? "★ " : ""}
                  {n.judul || n.body.slice(0, 40)}
                </button>
              ))}

              <div className="jr-kal-tambah">
                <input
                  value={acaraBaru}
                  onChange={(e) => setAcaraBaru(e.target.value)}
                  maxLength={120}
                  placeholder="ulang tahun siapa? acara apa?"
                  aria-label="Acara baru"
                  onKeyDown={(e) => e.key === "Enter" && tambahAcara(tglDipilih)}
                />
                <label className="jr-kal-ultah">
                  <input
                    type="checkbox"
                    checked={acaraUltah}
                    onChange={(e) => setAcaraUltah(e.target.checked)}
                  />
                  ulang tahun
                </label>
                <button
                  type="button"
                  className="jr-tombol"
                  disabled={!acaraBaru.trim()}
                  onClick={() => tambahAcara(tglDipilih)}
                >
                  tambah
                </button>
              </div>
            </div>
          )}
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
                      {bacaMood(n.mood).map((m) => (
                        <span key={m} aria-hidden>{RASA[m]}</span>
                      ))}
                      <span className="jr-arsip-cuplik">
                        {n.judul || n.body.slice(0, 42)}
                      </span>
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
    </div>
  );
}

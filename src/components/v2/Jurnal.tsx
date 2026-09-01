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
import { variabelTema } from "@/design/tema";
import { alfaSecukupnya, rgba, sorotSecukupnya, tintaTerbaik } from "@/design/warna";

/**
 * ═══ WAJAH PERASAAN ═══
 *
 * Kembali ke emoji, 1 September 2026.
 *
 * Sempat digambar sendiri sebagai SVG, dengan alasan yang waktu itu terdengar
 * kuat: emoji tidak bisa diatur warnanya dan bentuknya beda tiap perangkat.
 * Keduanya benar. Tapi Yaya melihat hasilnya dan bilang "aneh", dan begitu
 * dilihat lagi memang jelas kenapa: supaya sembilan wajah itu terlihat
 * satu keluarga, semuanya dibangun dari lingkaran, dua mata, dan satu mulut.
 * Hasilnya sembilan wajah yang sekilas SAMA SEMUA, dan bedanya baru
 * ketahuan kalau diperhatikan satu-satu.
 *
 * Emoji punya hal yang justru tidak bisa ditiru dengan konsistensi: tiap
 * wajah dirancang orang berbeda untuk dikenali dalam sepersekian detik. Di
 * baris pilihan yang harus dipindai sekali lihat, itu lebih penting daripada
 * keseragaman.
 *
 * Pelajarannya: "konsisten" bukan tujuan, ia alat. Di sini ia justru
 * menghapus yang sedang dibutuhkan, yaitu perbedaan.
 */
const RASA: Record<string, string> = {
  senang: "😊",
  semangat: "🤩",
  tenang: "😌",
  bingung: "😕",
  capek: "🥱",
  cemas: "😟",
  sedih: "😢",
  kesal: "😒",
  marah: "😠",
};
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
  /* Angka -1 untuk yang gagal diurai, bukan 0: 0 itu bulan Januari yang sah,
     dan tanggal rusak yang menyamar jadi Januari akan menandai hari yang
     salah di kalender tanpa ada yang tahu. */
  if (!m) return { panjang: s, hari: "", pendek: s, tahun: -1, bulan: -1, tanggal: -1 };
  const [, y, bl, d] = m;
  const tgl = new Date(`${y}-${bl}-${d}T00:00:00`);
  return {
    panjang: `${Number(d)} ${BULAN[Number(bl) - 1]} ${y}`,
    pendek: `${Number(d)} ${BULAN[Number(bl) - 1].slice(0, 3)}`,
    hari: HARI[tgl.getDay()] ?? "",
    /* Angkanya ikut dikembalikan supaya yang butuh membandingkan tanggal
       tidak perlu mengurai ulang teksnya sendiri. Dua tempat yang mengurai
       format yang sama adalah dua tempat yang bisa berbeda. */
    tahun: Number(y),
    bulan: Number(bl) - 1,
    tanggal: Number(d),
  };
}


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
  const [acaraJam, setAcaraJam] = useState("");
  const [acaraTempat, setAcaraTempat] = useState("");
  /** Nama berkas foto yang sudah terunggah dan siap ikut disimpan. */
  const [foto, setFoto] = useState<string[]>([]);
  const [unggah, setUnggah] = useState(false);
  /** Pemicu acak untuk dinding momen. Naik satu tiap kali tombolnya ditekan. */
  const [kocok, setKocok] = useState(0);

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

  /*
   * ═══ TINTA DITURUNKAN DARI LANGIT, TIDAK DIPATOK ═══
   *
   * Sampai 1 September 2026 seluruh jurnal memakai tinta putih (#eef6ff)
   * apa pun waktunya. Diukur, hasilnya:
   *
   *     pagi   langit #A9C6E8   kontras 1.61 : 1
   *     siang  langit #6FC6EC   kontras 1.76 : 1
   *     sore   langit #7E9CC4   kontras 2.59 : 1
   *     malam  langit #1C3B6B   kontras 10.21 : 1
   *
   * Ambang terbaca 4.5 : 1. Jadi tiga dari empat waktu praktis tidak bisa
   * dibaca sama sekali, dan yang satu lolos cuma karena kebetulan berkas ini
   * memang dirancang untuk langit malam. Yaya: "di bagian sky itu calender
   * notes dll nggak keliatan jir dia jadi tipis banget."
   *
   * `tintaTerbaik` memilih di antara dua tinta mana yang lebih terbaca di
   * atas langit yang SEDANG dipakai. Hasilnya #0b1726 untuk tiga waktu
   * terang (6.4 sampai 10.2 : 1) dan #eef6ff untuk malam.
   */
  const tinta = tintaTerbaik(langit, ["#0b1726", "#eef6ff"]);

  /*
   * `gelap` sekarang DITURUNKAN dari tintanya, bukan dari daftar nama waktu.
   *
   * Sebelumnya `waktu === "malam" || waktu === "sore"`, dan itu salah untuk
   * sore: langit sore #7E9CC4 luminansinya tinggi, jadi ia terang. Daftar
   * nama harus dijaga sendiri tiap kali paletnya berubah; nilai yang
   * diturunkan ikut sendiri.
   */
  const gelap = tinta === "#eef6ff";

  /*
   * Sorot emas dicari di sebuah tangga, bukan dipilih dari dua.
   *
   * #f4e4b0 bagus di langit malam (8.78 : 1) dan cuma 1.4 : 1 di langit
   * siang. Percobaan pertama memakai satu pengganti gelap #6b4e05, dan itu
   * masih gagal: 4.39 di pagi, 4.04 di siang, 2.74 di sore. Angka yang
   * "kelihatan cukup gelap" ternyata tidak cukup, dan sore yang paling
   * parah justru karena langitnya keabu-abuan.
   *
   * Sekarang tangganya dicoba dari yang paling dekat ke emas aslinya sampai
   * ada yang mencapai 4.5 : 1. Jadi yang dipakai selalu yang paling emas
   * yang masih terbaca, dan tidak ada waktu yang bisa lolos tanpa diperiksa.
   */
  const sorot = sorotSecukupnya(
    langit,
    ["#f4e4b0", "#a8801a", "#7d5c08", "#5c4204", "#3d2b00", "#241900"],
    4.5,
  );

  /*
   * Lapisan kaca ikut tinta, bukan selalu putih.
   *
   * Ini bagian yang paling gampang terlewat: `rgba(255,255,255,0.09)` di
   * atas langit biru muda tidak kelihatan sama sekali, jadi seluruh tombol,
   * kotak mood, dan sel kalender kehilangan bentuknya. Diturunkan dari
   * tinta, ia jadi lapisan gelap tipis waktu langitnya terang dan lapisan
   * terang tipis waktu langitnya gelap. Satu rumus, dua hasil.
   */
  /*
   * Tiga tingkat teks, alfanya DICARI bukan dipatok.
   *
   * 0,78 / 0,55 / 0,34 terasa masuk akal waktu ditulis, dan diukur ternyata
   * 0,55 cuma menghasilkan 2,79 : 1 di langit sore. Angka alfa yang sama
   * berarti keterbacaan yang berbeda-beda di langit yang berbeda, dan yang
   * ingin dijaga keterbacaannya.
   *
   * Targetnya turun bertingkat karena perannya memang bertingkat: yang
   * dibaca lama butuh 7, keterangan butuh 4,5, dan yang cuma penanda
   * kehadiran butuh 3.
   */
  const rias = {
    "--jr-tinta": tinta,
    "--jr-lembut": rgba(tinta, alfaSecukupnya(langit, tinta, 7)),
    /* Dinaikkan 1 September 2026, sesudah Yaya lihat layarnya: "ini masih
       terlalu nggak keliatan". Angka lamanya 4,5 dan 3, yaitu ambang minimum
       WCAG untuk teks biasa dan untuk unsur bukan-teks.
       Yang keliru bukan pengukurannya melainkan yang diukur: ambang minimum
       itu untuk teks HITAM DI ATAS PUTIH dengan huruf tegas. Di sini
       hurufnya serif tipis di atas langit biru, dan minimum yang lolos di
       kertas tidak lolos di sini. Naik ke 5,5 dan 4,5. */
    "--jr-samar": rgba(tinta, alfaSecukupnya(langit, tinta, 5.5)),
    "--jr-hantu": rgba(tinta, alfaSecukupnya(langit, tinta, 4.5)),
    /* Garis dan lapisan kaca BUKAN teks: yang dijaga cuma supaya bentuknya
       kelihatan. Ambangnya 1,4 sampai 2, jauh di bawah ambang teks, karena
       garis setebal ambang teks berubah jadi kotak yang berteriak. */
    "--jr-garis": rgba(tinta, alfaSecukupnya(langit, tinta, 1.55)),
    "--jr-garis-kuat": rgba(tinta, alfaSecukupnya(langit, tinta, 2.1)),
    "--jr-kaca-1": rgba(tinta, alfaSecukupnya(langit, tinta, 1.18)),
    "--jr-kaca-2": rgba(tinta, alfaSecukupnya(langit, tinta, 1.3)),
    "--jr-kaca-3": rgba(tinta, alfaSecukupnya(langit, tinta, 1.5)),
    "--jr-kaca-4": rgba(tinta, alfaSecukupnya(langit, tinta, 1.85)),
    "--jr-sorot": sorot,
    "--jr-sorot-tepi": rgba(sorot, alfaSecukupnya(langit, sorot, 1.7)),
    "--jr-sorot-kaca": rgba(sorot, alfaSecukupnya(langit, sorot, 1.25)),
  } as React.CSSProperties;

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
  /**
   * Unggah dulu, simpan belakangan.
   *
   * Fotonya dikirim begitu dipilih, bukan ikut waktu tombol simpan ditekan.
   * Dua alasan: unggahan besar yang menumpang tombol simpan bikin tombolnya
   * terasa menggantung tanpa ada yang tahu kenapa, dan kalau salah satu
   * berkas ditolak, Olen tahu SEKARANG dan bisa ganti, bukan sesudah selesai
   * menulis panjang.
   *
   * Berkas yang sudah terunggah tapi catatannya tidak jadi disimpan akan
   * jadi berkas yatim di public/momen. Itu diterima: berkas yatim beberapa
   * ratus kilobita jauh lebih murah daripada foto yang hilang, dan tidak ada
   * satu pun yang menghapusnya berarti tidak ada satu pun yang bisa salah
   * menghapus.
   */
  async function tempelFoto(berkas: FileList | null) {
    if (!berkas?.length || unggah) return;
    if (foto.length + berkas.length > 6) {
      setGalat("maksimal 6 foto per catatan ya");
      return;
    }
    setUnggah(true);
    setGalat(null);
    try {
      const data = new FormData();
      for (const f of Array.from(berkas)) data.append("foto", f);
      const r = await fetch(aset("/api/momen"), { method: "POST", body: data });
      const j = (await r.json()) as { foto?: string[]; error?: string };
      if (!r.ok) throw new Error(j.error ?? "gagal");
      setFoto((f) => [...f, ...(j.foto ?? [])]);
    } catch (e) {
      setGalat(e instanceof Error && e.message !== "gagal" ? e.message : "fotonya belum kekirim.");
    } finally {
      setUnggah(false);
    }
  }

  async function simpan() {
    const isi = draft.trim();
    /* Catatan yang isinya cuma foto tetap boleh disimpan. "Hari ini nggak
       mau nulis, cuma mau naruh foto" itu cara memakai yang wajar. */
    if ((!isi && !foto.length) || sibuk) return;
    setSibuk(true);
    setGalat(null);
    try {
      const r = await fetch(aset("/api/notes"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: isi, mood: tulisMood(rasa), judul, subjudul, foto }),
      });
      if (!r.ok) throw new Error();
      const n = (await r.json()) as NoteRow;
      setTulisan((t) => [n, ...t]);
      setDraft("");
      setJudul("");
      setSubjudul("");
      setRasa([]);
      setFoto([]);
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
          jam: acaraJam,
          tempat: acaraTempat,
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
      setAcaraJam("");
      setAcaraTempat("");
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

  /**
   * ═══ DINDING MOMEN ═══
   *
   * Semua foto dari semua catatan, diacak.
   *
   * Bukan galeri berurutan. Urutan waktu bikin foto dibaca sebagai riwayat,
   * dan riwayat dibaca dari ujung: yang lama tidak pernah dilihat lagi.
   * Diacak, foto dari November 2024 punya peluang yang sama muncul di baris
   * pertama dengan foto kemarin, dan itu justru gunanya.
   *
   * Diacak DI DALAM useMemo dengan `kocok` sebagai pemicu, bukan tiap
   * render. Mengacak tiap render berarti dindingnya berubah susunan tiap
   * kali Olen mengetik satu huruf di kotak tulis.
   *
   * Dan diacak di KLIEN sesudah terpasang, bukan waktu render pertama:
   * `Math.random()` yang jalan di server memberi urutan berbeda dari yang di
   * peramban, dan React melaporkannya sebagai hydration mismatch. Karena
   * `kocok` mulai dari 0 dan urutan awalnya urutan apa adanya, render
   * pertama di kedua sisi selalu sama.
   */
  const dinding = useMemo(() => {
    const semua = tulisan.flatMap((n) => (n.foto ? n.foto.split(",") : []));
    if (kocok === 0) return semua;
    /* Fisher-Yates. Bukan `sort(() => Math.random() - 0.5)`, yang terlihat
       lebih pendek dan menghasilkan sebaran yang TIDAK rata: pembanding yang
       tidak konsisten membuat hasilnya bergantung pada algoritma sort-nya,
       dan sebagian posisi jauh lebih sering terisi daripada yang lain. */
    const a = [...semua];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [tulisan, kocok]);

  return (
    /*
     * variabelTema() dipasang di sini juga, bukan cuma di layar pembuka.
     *
     * Tombol dan panel Settings memakai var(--ch-atas-kaca) dan
     * saudara-saudaranya untuk warna kacanya. Variabel itu ditulis
     * variabelTema() ke elemen .op — yang cuma ada di layar pembuka. Di
     * jurnal semuanya kosong, jadi tombolnya tampil tanpa latar sama sekali
     * dan panelnya nyaris tembus pandang.
     *
     * Memberi warna sendiri di jurnal akan berarti dua tempat menentukan
     * warna benda yang sama. Memakai fungsi yang sama menjaga keduanya ikut
     * waktu, dan ikut aturan kontras yang sudah lolos 16 dari 16 uji.
     */
    <div
      className={`jr${gelap ? " jr-gelap" : ""}`}
      style={{
        ...(variabelTema(waktu) as React.CSSProperties),
        ...rias,
        ["--langit" as string]: langit,
      }}
    >
      <div className="jr-latar" aria-hidden>
        {/*
          LANGIT SIANG PUNYA AWAN, LANGIT MALAM PUNYA BINTANG.

          Yaya: "langit kalo nggak malam bintangnya hilangin ganti awan-awan."

          Benar, dan bukan cuma soal masuk akal: bintang di langit terang
          harus digambar dengan warna yang kontras terhadap langitnya, dan
          satu-satunya warna yang kontras di sana adalah GELAP. Bintang gelap
          di siang bolong terbaca sebagai kotoran di layar, bukan bintang.

          Keduanya dipasang berdampingan dan yang menentukan mana yang
          terlihat cuma opasitas, jadi pergantian waktu tetap memudar halus
          dan tidak ada yang muncul mendadak.
        */}
        <div className="jr-awan">
          {/* Sembilan gumpal, letak dan ukurannya ditulis tetap. Bukan acak:
              nilai acak berarti server dan peramban menggambar awan di tempat
              yang berbeda, dan React melaporkannya sebagai hydration
              mismatch. Ini sudah pernah terjadi di berkas lain di repo ini. */}
          {[
            /*
             * Tiap awan punya EMPAT angka, dan tiga di antaranya baru
             * ditambahkan 1 September 2026.
             *
             * Yaya: "tempat muncul awannya gak dari ujung dan nggak berjalan
             * secara simultan, ada awan tiba-tiba muncul di tengah, buat awan
             * ada yang jalannya cepat dan lambat."
             *
             * Ketiganya satu sebab. Versi sebelumnya memberi tiap awan
             * `animationDelay: -i * 7` dan durasi `74 + i * 9`, yaitu deret
             * hitung. Dua deret hitung yang berjalan bersamaan menghasilkan
             * pola yang berulang rapi: awannya berbaris dengan jarak yang
             * sama dan kecepatan yang naik teratur, dan mata langsung
             * menangkap barisan itu sebagai buatan.
             *
             * Yang lebih parah: karena tundanya negatif tapi durasinya
             * berbeda-beda, sebagian awan memulai animasinya di tengah jalan
             * dan MUNCUL BEGITU SAJA di tengah layar, bukan masuk dari tepi.
             *
             * Sekarang:
             *   `t`  tinggi, dalam vmin
             *   `d`  durasi, dipilih supaya ada yang lambat dan ada yang
             *        cepat tanpa kelipatan yang rapi
             *   `m`  mulai, sebagai PECAHAN dari durasinya sendiri. Karena
             *        pecahan, awan yang mulai di 0,5 selalu berada di
             *        setengah lintasan berapa pun durasinya, jadi tidak ada
             *        lagi yang tiba-tiba nongol di tengah tanpa sebab.
             *
             * Angkanya ditulis tetap, bukan acak: acak berarti server dan
             * peramban menggambar awan di tempat berbeda, dan itu hydration
             * mismatch.
             */
            { a: 9, l: 36, t: 16, d: 96, m: 0.0 },
            { a: 27, l: 24, t: 11, d: 61, m: 0.42 },
            { a: 5, l: 44, t: 19, d: 134, m: 0.17 },
            { a: 22, l: 29, t: 13, d: 78, m: 0.73 },
            { a: 14, l: 33, t: 15, d: 112, m: 0.31 },
            { a: 55, l: 27, t: 12, d: 69, m: 0.58 },
            { a: 67, l: 39, t: 17, d: 148, m: 0.09 },
            { a: 48, l: 22, t: 10, d: 54, m: 0.86 },
            { a: 63, l: 31, t: 14, d: 89, m: 0.25 },
            { a: 37, l: 26, t: 12, d: 121, m: 0.64 },
          ].map((g, i) => (
            <span
              key={i}
              style={{
                /* Tanpa `left`. Letak mendatarnya sepenuhnya diurus animasi,
                   yang berangkat dari luar tepi kiri. Memberi `left` juga
                   berarti dua hal menentukan satu posisi, dan yang satu
                   ditulis di sini sementara yang lain di keyframes. */
                top: `${g.a}%`,
                width: `${g.l}vmin`,
                height: `${g.t}vmin`,
                animationDuration: `${g.d}s`,
                animationDelay: `-${(g.m * g.d).toFixed(1)}s`,
              }}
            />
          ))}
        </div>
        <div className="jr-bintang" />
        <div className="jr-jatuh">
          {[
            /*
             * Sudutnya 40 sampai 56 derajat: MENYERONG TURUN.
             *
             * Sempat saya buat 6 sampai 14 derajat — hampir mendatar — dan
             * hasilnya dinilai "bergeser ke samping dengan kecepatan tinggi,
             * bukan jatuh". Itu benar: garis yang meluncur mendatar terbaca
             * sebagai benda yang dilempar, bukan yang jatuh. Yang membuat
             * mata menyebutnya "jatuh" adalah komponen ke BAWAH-nya.
             *
             * Sudut positif memutar searah jarum jam di koordinat layar, jadi
             * perjalanan ke +x jadi turun ke kanan-bawah.
             */
            { x: -8, y: 2, p: 30, s: 44, t: 16, m: 3 },
            { x: 24, y: -6, p: 24, s: 52, t: 24, m: 12 },
            { x: 58, y: -4, p: 34, s: 40, t: 31, m: 21 },
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
          <div className="jr-setelan" data-buka={menu ? "1" : "0"}>
            <Settings buka={menu} onBuka={setMenu} nilai={set} onUbah={ubahSet} garisTiga tempat="langit" />
          </div>

          <p className="jr-kop">sky notes</p>

          <button type="button" className="jr-tombol jr-pulang" onClick={onTurun}>
            kembali ke bumi
          </button>

          {/* Tanpa kelas `serif`. Kelas itu milik v1 dan memaksa Playfair
              lewat globals.css, jadi tanggal di sini tidak pernah ikut huruf
              jurnal berapa kali pun aturannya ditulis ulang di jurnal.css.
              Aturan yang lebih spesifik kalah bukan karena spesifisitas,
              tapi karena ia mengatur variabel sementara `serif` menyebut
              nama hurufnya langsung. */}
          <h1 className="jr-tgl">
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
                {sedangDibaca.foto && (
                  <div className="jr-momen jr-momen-baca">
                    {sedangDibaca.foto.split(",").map((f) => (
                      <figure key={f} className="jr-momen-satu">
                        <img src={aset(`/momen/${f}`)} alt="" loading="lazy" decoding="async" />
                      </figure>
                    ))}
                  </div>
                )}
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
              placeholder="judul"
              aria-label="Judul"
            />
            <input
              className="jr-subjudul-isian"
              value={subjudul}
              onChange={(e) => setSubjudul(e.target.value)}
              maxLength={240}
              placeholder="sub judul (opsional)"
              aria-label="Sub-judul"
            />


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

            {/*
              MOMEN — foto yang ditempel ke catatan hari ini.

              Diletakkan SESUDAH area tulis dan SEBELUM tombol simpan, jadi
              urutannya mengikuti cara orang menulis: tulis dulu, tempel
              fotonya, baru simpan. Kalau ditaruh di atas, ia jadi pintu
              yang harus dilewati sebelum boleh menulis.
            */}
            {(foto.length > 0 || unggah) && (
              <div className="jr-momen">
                {foto.map((f) => (
                  <figure key={f} className="jr-momen-satu">
                    <img src={aset(`/momen/${f}`)} alt="" loading="lazy" decoding="async" />
                    <button
                      type="button"
                      className="jr-momen-buang"
                      aria-label="Lepas foto ini"
                      /* "Lepas", bukan "hapus". Berkasnya tetap ada di
                         server; yang dilepas cuma kaitannya ke catatan ini.
                         Kata yang dipakai harus sesuai dengan yang terjadi. */
                      onClick={() => setFoto((v) => v.filter((x) => x !== f))}
                    >
                      ×
                    </button>
                  </figure>
                ))}
                {unggah && <p className="jr-momen-tunggu">lagi ngirim…</p>}
              </div>
            )}

            <div className="jr-kaki">
              <label className={`jr-tombol jr-tempel${unggah ? " sibuk" : ""}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  disabled={unggah || foto.length >= 6}
                  onChange={(e) => {
                    void tempelFoto(e.target.files);
                    /* Dikosongkan supaya memilih berkas yang SAMA dua kali
                       tetap memicu onChange. Tanpa ini, Olen yang salah
                       hapus lalu mau menempel foto itu lagi tidak akan
                       terjadi apa-apa, dan tidak ada galat yang muncul. */
                    e.target.value = "";
                  }}
                />
                {foto.length >= 6 ? "cukup ya" : "tempel foto"}
              </label>
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
                disabled={(!draft.trim() && !foto.length) || sibuk}
              >
                {sibuk ? "menyimpan" : "simpan"}
              </button>
            </div>
          </>
        )}

        </div>

        <div className="jr-kolom-samping">
        {/*
          PERASAAN PINDAH KE KOLOM KANAN, DI ATAS KALENDER.

          Yaya: "yang how your day di atas kalender aja biar bagian kiri full
          untuk notes."

          Benar, dan alasannya lebih dari sekadar ruang. Kolom kiri sekarang
          punya SATU pekerjaan: menulis. Judul, sub judul, halaman bergaris.
          Tidak ada yang menyela di tengahnya.

          Sembilan tombol perasaan yang duduk di antara sub judul dan halaman
          tulis memaksa Olen melewati sebuah pilihan sebelum boleh mulai
          menulis, padahal yang paling sering ingin dia lakukan justru
          langsung menulis.
        */}
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
                <span className="jr-rasa-emoji" aria-hidden>{RASA[m]}</span>
                <span className="jr-rasa-nama">{m}</span>
              </button>
            ))}
          </div>
        </section>

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
                    `${ac.length ? " acara" : ""}${hariDipilih === d ? " pilih" : ""}` +
                    /* Hari ini ditandai TERPISAH dari tanggal terpilih. Dua
                       hal yang berbeda: "kamu ada di sini" dan "kamu sedang
                       melihat ini". Sebelumnya cuma ada yang kedua, jadi
                       waktu Olen menjelajah bulan lain dia kehilangan
                       jejak di mana hari ini berada. */
                    `${
                      bulan.y === hariIni.tahun && bulan.b === hariIni.bulan && d === hariIni.tanggal
                        ? " kini"
                        : ""
                    }`
                  }
                  aria-label={`${d} ${BULAN[bulan.b]}${isi.length ? `, ${isi.length} catatan` : ""}${
                    ac.length ? `, ${ac.length} acara` : ""
                  }`}
                  onClick={() => setTglDipilih(tglDipilih === kunciTanggal(d) ? null : kunciTanggal(d))}
                >
                  <span className="jr-kal-angka">{d}</span>
                  {/* Nama acara TAMPIL di selnya, bukan cuma titik.
                      Yaya: "nanti di tanggal tersebut berlebel acaranya."
                      Satu label saja, yang pertama; kalau ada lebih, jumlahnya
                      yang disebut. Dua label di sel selebar 40 px akan
                      terpotong dua-duanya, dan dua potongan tidak lebih
                      berguna daripada satu yang utuh. */}
                  {ac.length > 0 && (
                    <span className="jr-kal-label">
                      {ac.length > 1 ? `${ac.length} acara` : ac[0].judul}
                    </span>
                  )}
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
                  <span className="jr-kal-acara-judul">
                    {a.judul}
                    {/* Jam dan tempat di baris kedua, lebih kecil. Kalau
                        keduanya sejajar dengan judul, tiga potongan teks
                        berukuran sama berebut jadi yang dibaca duluan, dan
                        yang paling penting (apa acaranya) kalah karena ia
                        yang paling kiri. */}
                    {(a.jam || a.tempat) && (
                      <span className="jr-kal-acara-rinci">
                        {a.jam}
                        {a.jam && a.tempat ? " · " : ""}
                        {a.tempat}
                      </span>
                    )}
                  </span>
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

              {/*
                AGENDA SUNGGUHAN.

                Yaya: "bisa nulis selain agenda jam tempat dll kayak ngisi
                kalender beneran."

                Tiga kolom, dan urutannya mengikuti cara orang menyebut
                sebuah janji: APA dulu, baru JAM, baru DI MANA. Yang pertama
                wajib, dua sisanya tidak, dan itu ditulis di keterangannya
                supaya tidak ada yang mengira harus diisi semua.

                Jam dan tempat sengaja `type="text"`, bukan `type="time"`.
                Pemilih jam bawaan menuntut HH:MM, sementara yang paling
                sering ditulis anak SMP adalah "abis magrib" atau "pulang
                sekolah". Keduanya jam yang sah baginya, dan kolom yang
                menolaknya membuang catatannya, bukan merapikan datanya.
              */}
              <div className="jr-kal-tambah">
                <input
                  className="jr-kal-apa"
                  value={acaraBaru}
                  onChange={(e) => setAcaraBaru(e.target.value)}
                  maxLength={120}
                  placeholder="what's your agenda?"
                  aria-label="Agenda"
                  onKeyDown={(e) => e.key === "Enter" && tambahAcara(tglDipilih)}
                />
                <div className="jr-kal-rinci">
                  <input
                    value={acaraJam}
                    onChange={(e) => setAcaraJam(e.target.value)}
                    maxLength={40}
                    placeholder="jam (opsional)"
                    aria-label="Jam"
                    onKeyDown={(e) => e.key === "Enter" && tambahAcara(tglDipilih)}
                  />
                  <input
                    value={acaraTempat}
                    onChange={(e) => setAcaraTempat(e.target.value)}
                    maxLength={80}
                    placeholder="tempat (opsional)"
                    aria-label="Tempat"
                    onKeyDown={(e) => e.key === "Enter" && tambahAcara(tglDipilih)}
                  />
                </div>
                <div className="jr-kal-aksi">
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
                    {/*
                      SATU BARIS ARSIP, DISUSUN ULANG 1 September 2026.

                      Sebelumnya semuanya dijejer mendatar dalam satu baris:
                      tanggal, bintang, emoji, lalu 42 huruf pertama. Di layar
                      sempit potongannya tinggal beberapa kata, dan di layar
                      lebar barisnya jadi pita panjang yang isinya kebanyakan
                      ruang kosong. Yang paling penting, judul yang sudah
                      susah-susah ditulis Olen ditampilkan sekecil dan setipis
                      keterangan tanggal.

                      Sekarang bertingkat, mengikuti apa yang dicari mata
                      waktu mengingat sesuatu:
                        baris 1  tanggal, perasaan, penanda penting
                        baris 2  JUDUL, tebal dan paling besar
                        baris 3  cuplikan isi, redup
                      Plus satu foto kecil kalau catatannya punya, karena
                      gambar jauh lebih cepat mengembalikan ingatan daripada
                      empat puluh dua huruf pertama.
                    */}
                    <button
                      type="button"
                      className={`jr-arsip-tombol${dibaca === n.id ? " on" : ""}`}
                      onClick={() => setDibaca(dibaca === n.id ? null : n.id)}
                    >
                      {n.foto && (
                        <img
                          className="jr-arsip-foto"
                          src={aset(`/momen/${n.foto.split(",")[0]}`)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className="jr-arsip-isi">
                        <span className="jr-arsip-atas">
                          <span className="jr-arsip-tgl">{t.pendek}</span>
                          {bacaMood(n.mood).map((m) => (
                            <span key={m} aria-hidden>{RASA[m]}</span>
                          ))}
                          {n.penting ? (
                            <span aria-hidden className="jr-arsip-penting">★</span>
                          ) : null}
                        </span>
                        {n.judul && <span className="jr-arsip-judul-baris">{n.judul}</span>}
                        <span className="jr-arsip-cuplik">{n.body.slice(0, 90)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {dinding.length > 0 && (
          <section className="jr-dinding" aria-label="Dinding momen">
            <div className="jr-dinding-kepala">
              <p className="jr-arsip-judul">dinding momen</p>
              <button
                type="button"
                className="jr-tombol jr-kocok"
                onClick={() => setKocok((k) => k + 1)}
              >
                acak lagi
              </button>
            </div>
            <div className="jr-dinding-kisi">
              {dinding.slice(0, 24).map((f, i) => (
                <img
                  key={`${f}-${i}`}
                  src={aset(`/momen/${f}`)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
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

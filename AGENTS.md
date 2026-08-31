# AGENTS.md — cara kerja di proyek ini

Baca ini sampai habis sebelum menyentuh apa pun. Lalu baca
`docs/ai-memory/memory.md` untuk riwayat keputusan dan kesalahan.

---

## Apa ini

Kapsul waktu untuk **Olen** (Floren) — adik perempuan Syafiq (Yaya), bukan adik
kandung. Dibangun dari ekspor WhatsApp tiga tahun (Nov 2023 – Agt 2026,
±76.000 pesan) yang ada di `D:\Project Syafiq\Kerja\`.

**Tujuannya satu kalimat:** supaya Olen bisa membukanya kapan saja dan diingatkan
siapa dirinya — bahwa dia layak disayangi, jujur, dan baik. **Bukan** untuk
memamerkan kebaikan penulisnya.

---

## ATURAN KERAS — jangan pernah dilanggar

1. **Jangan pernah menyentuh runtime global di VPS.** VPS `76.13.196.172`
   menjalankan 4 aplikasi produksi lain lewat PM2 (spd-backend,
   prototype-toko-ban, jubir-warga, arcc-hivee). Upgrade Node sistem pernah
   dilakukan di sini dan mengganggu keempatnya. Kalau butuh versi Node lain,
   pakai nvm/fnm per-user atau Docker — **jangan `apt install nodejs`**.
2. **`data/olen.db` tabel `notes` adalah tulisan pribadi Olen.** Jangan pernah
   `DROP`, jangan hapus file-nya. `npm run seed` sengaja hanya menghapus tabel
   konten, tidak pernah `notes`.
3. **Jangan bangun seluruh halaman lalu baru ditunjukkan.** Satu layar,
   diverifikasi, baru lanjut. Ini diminta langsung oleh Yaya setelah kerja
   sehari penuh terbuang.
4. **Verifikasi sendiri di browser sebelum menyerahkan.** Ada Claude in Chrome —
   ia menjalankan Chrome milik Yaya, jadi `http://localhost:PORT` bisa dibuka
   langsung. Tidak perlu tunnel, tidak perlu VPS.
5. **Jangan publikasikan ke internet.** Isinya foto dan percakapan pribadi anak
   di bawah umur. Lokal atau di belakang password saja.

---

## Perintah

```powershell
cd "D:\Project Syafiq\Kerja\untuk-olen"
npm install
npm run seed          # isi SQLite dari content/story.ts
npm run dev -- -p 3006
```

- Node **≥ 22.18** (butuh `node:sqlite` + type-stripping bawaan).
- PowerShell lama tidak mengenal `&&`. Tulis perintah baris per baris.
- Kalau `next dev` bilang *"Another next dev server is already running"*: ada
  proses nyangkut. Matikan lewat PowerShell **Administrator**
  (`taskkill /PID <pid> /F`), atau pakai `npx next start -p 3005` (mode produksi
  tidak punya kunci itu).

---

## Peta berkas

```
content/story.ts          SATU-SATUNYA tempat naskah. Ubah di sini → `npm run seed`.
scripts/seed.mjs          story.ts → SQLite. Tidak pernah menyentuh tabel notes.
scripts/build-voice.py    montase suara Olen. Baca komentarnya sebelum mengubah.
scripts/voice-sources.json daftar VN sumber — DIBACA saja, jangan ditulisi.
src/lib/db.ts             node:sqlite. WAL menyala. Baris disalin jadi objek biasa.
src/app/page.tsx          v1 — versi lama, ditolak. Jangan dikembangkan.
src/app/v2/               v2 — versi yang sedang dibangun. KERJAKAN DI SINI.
src/app/aset/             halaman pratinjau aset 3D. Alat kerja, bukan cerita.
src/components/v2/
  world.ts                garis air + sandAt(). SATU sumber ukuran dunia.
  waktu.ts                palet pagi/siang/sore/malam. SATU sumber warna.
  Settings.tsx            panel pojok kanan atas: suara + pilihan waktu
  assets/                 BENTUK 3D, satu berkas satu aset. Tidak tahu soal scene.
  assets/kit.tsx          perkakas bersama + catatan jebakan
  beach.tsx               PENEMPATAN di pantai. Tidak membuat bentuk apa pun.
  OpeningScene.tsx        kanvas, langit, laut, pasir, perjalanan paus
  Opening.tsx             tata suara + tombol
public/audio/             beach · voice-of-olen · track-1..3 (lagu milik Yaya)
public/memori/            foto (6) + vn/ suara Olen
_kurasi-foto.html         kontak-sheet kandidat foto & voice note (gitignored)
```

---

## Tiga lapis — jangan dicampur

Ini aturan struktural terpenting di proyek ini. Sebelum ada pemisahan ini,
tiap perbaikan bentuk merusak penempatan dan sebaliknya.

| lapis | tahu apa | TIDAK boleh tahu |
|---|---|---|
| `assets/*.tsx` | geometri, warna, animasi yang melekat pada bentuk | garis air, tinggi pasir, kamera, arah perjalanan |
| `world.ts` | garis air, `sandAt(x,z)` | bentuk apa pun |
| `beach.tsx` / `OpeningScene.tsx` | di mana, seberapa besar, ke mana berjalan | cara membuat bentuk |

**Kontrak aset:** digambar di titik nol, menghadap +X, berdiri di y = 0,
menerima prop `animate?: boolean`.
**Skala dunia:** 1 satuan = 30 cm. Flamingo 1,2 m → 4 satuan.

**Perbaiki bentuk di `/aset` DULU, baru pasang ke scene.** Di dalam scene
sebuah benda bisa terlihat salah karena sepuluh sebab sekaligus — sudut
kamera, air yang memotongnya, benda lain yang menimpanya. Dipajang sendirian,
salahnya ketahuan dalam hitungan detik.

**Sebelum menilai aset jenis baru, pastikan panggungnya bisa menunjukkan hal
yang perlu dinilai.** Sudah dua kali terlewat: bintang laut yang dilihat
mendatar cuma terbaca sebagai kubah (`pandang: "atas"`), dan ubur-ubur yang
menyala dinilai di ruang putih terang — pendar dinilai dari seberapa jauh ia
mengalahkan gelap, dan di ruang putih tidak ada gelap untuk dikalahkan
(`ruang: "laut"`). Panggung yang salah membuat cacat mustahil terlihat.

**`bladeGeometry()` memanggil `center()` di akhir.** Titik nol geometrinya
jadi tengah kotak batas, bukan pangkal siripnya. Sirip setinggi 1,2 satuan
yang ditempel tanpa memperhitungkan itu terkubur 0,6 satuan ke dalam badan.
Pakai `pangkalDiBawah()` / `pangkalDiKanan()` di `LumbaLumba.tsx` — keduanya
membaca `boundingBox` sungguhan, karena kurva bezier boleh melewati titik
kendalinya dan menghitung batas dari titik kendali akan meleset.

**Pergeseran tetap di badan yang jari-jarinya berubah selalu salah di ujung.**
Perut terang lumba-lumba dibuat dari salinan badan yang diturunkan 0,16 —
bekerja di badan (jari-jari 0,85), menembus keluar di moncong (jari-jari
0,2). Apa pun yang menempel sepanjang badan harus sebanding dengan
`radiusDi(x)`, bukan angka tetap.

`?cepat` di URL `/v2` mempercepat siklus paus 30 dtk → 9 dtk untuk menyetel.

**Menempelkan sesuatu ke badan makhluk: jangan menebak angka.** Aset yang
badannya dibangun dari profil (paus) mengekspor `atasDi(x)`, `sisiDi(x)`,
`permukaan(x, sudut)`. Pakai itu. Sirip punggung pernah dipasang di y = 1.24
karena angkanya "terlihat masuk akal", padahal permukaan badan di titik itu
setinggi 0,70 — siripnya melayang dan baru ketahuan setelah dua putaran.

**Dua besaran yang terikat secara fisik: turunkan yang satu dari yang lain,
jangan animasikan keduanya sendiri-sendiri.** Tinggi dan kemiringan paus dulu
punya rumus masing-masing, disetel sampai kebetulan cocok — dan tiap kali
salah satunya diubah, pausnya bergerak ke satu arah sambil menghadap arah
lain. Sekarang kemiringannya dihitung dari kemiringan lintasannya sendiri
(dy/dx). Pola yang sama berlaku untuk apa pun yang menempel di badan: ambil
posisinya dari permukaan, bukan dari angka yang ditebak.

**Mencerminkan bentuk: pakai skala negatif, bukan tanda minus pada rotasi.**
`rotation={[s*a, s*b, c]}` TIDAK menghasilkan bentuk cermin karena three
mengurutkan rotasi X·Y·Z. Bungkus dengan `<group scale={[1, 1, s]}>`.

**Mengubah suasana: ubah paletnya, bukan cuma langitnya.** `waktu.ts` memegang
langit, laut, pasir, matahari, dua lampu, warna awan, dan bintang untuk tiap
waktu. Kalau ada yang tertinggal, benda itu akan menonjol — awan emissive
adalah yang paling mudah terlewat karena ia tidak ikut gelap sendiri saat
lampu diredupkan.

**Nilai awal tidak boleh mengandalkan animasi untuk jadi benar.** Uniform
warna laut dan pasir dulu dibuat dengan `new THREE.Color()` — putih — lalu
di-lerp ke warna aslinya di `useFrame`. Itu bekerja hanya kalau gelung render
jalan. Browser menghentikan `requestAnimationFrame` di tab yang tidak sedang
dilihat, jadi Olen yang membuka halaman ini di tab latar akan menemukan laut
putih. Warna yang benar sudah diketahui saat pembuatan; pakai itu, dan biarkan
animasi mengurus PERUBAHAN saja.

---

## Lapis keempat: design system

Sisi CSS memakai pembagian yang sama dengan sisi 3D.

| lapis | tahu apa | TIDAK boleh tahu |
|---|---|---|
| `src/design/tokens.css` | ukuran, jarak, lengkung, tempo, huruf | warna apa pun yang ikut waktu |
| `src/design/tema.ts` | cara menurunkan warna chrome dari palet | bentuk kontrol |
| `src/design/ui.css` | bentuk kontrol (`.ui-pil`, `.ui-panel`, …) | ia dipakai di layar mana |
| `src/app/*/\*.css` | penempatan | cara membuat kontrol |

**Jangan menulis warna, ukuran huruf, atau lengkung sudut di CSS halaman.**
Kalau sebuah ukuran belum ada tokennya, tambahkan tokennya — jangan tulis
angkanya di tempat.

**Tiap kontrol wajib diberi zona.** `.z-atas` (langit teratas), `.z-aksi`
(langit tengah), `.z-bawah` (**pasir**). Warna kacanya diturunkan dari
luminansi latar di zona itu. Lupa memberi zona pada tombol di dasar layar
berarti ia memakai warna untuk langit padahal yang ada di belakangnya pasir —
dan pasir jauh lebih terang. Itu bug yang melahirkan seluruh sistem ini:
tombol "keep going" berada di 1,35 : 1, sementara ambangnya 4,5 : 1.

**Sesudah mengubah palet waktu, jalankan `npm run periksa:kontras`.** Ia
keluar dengan kode 1 kalau ada yang jatuh di bawah ambang. Halaman `/design`
menunjukkan hal yang sama secara visual, keempat waktu berdampingan.

Satu pengecualian yang disengaja: nama besar "Olen" tidak ikut aturan kontras.
Ukurannya 15rem — ia dibaca sebagai bentuk, bukan teks. Dicatat di `tema.ts`
supaya jadi keputusan, bukan kelalaian.

---

## Arah desain — v2 (INI YANG BERLAKU)

Ditetapkan Yaya setelah v1 ditolak dengan kalimat *"masih AI base banget"*.

- **Warna: biru muda.** Olen suka biru muda. v1 pakai navy tengah malam — salah.
- **Perjalanan: pinggir pantai → langit biru → luar angkasa.** Bukan menyelam
  ke laut dalam seperti v1.
- **Gaya: animasi 3D ilustrasi, kartun ala Disney** — tapi digarap rapi.
  **Bukan realisme.** Warna jenuh, batas pita terlihat, buih bertepi tegas.
  Tanpa kabut, tanpa scrim gelap.
- **Banyak karakter yang bergerak**, dipilih dari hal-hal yang Olen suka.
- **Jangan menjelaskan semuanya dengan kata-kata.** Gambar dulu.
- **Pembuka:** hanya "Memories of" + "Olen" + tombol dengar ketawanya.
  Tidak ada paragraf. Baru saat di-scroll masuk ke momen awal perkenalan.
- **Teks dan pemandangan bergantian, tapi disengaja** — boleh ada layar penuh
  pemandangan tanpa kata sebagai jeda napas.
- Font judul: **Fraunces** (menggantikan Playfair — menunggu persetujuan).
  Font antarmuka: Outfit.

Referensi visual asli ada di `Interactive Ocean-Themed Journal App.make`
(file Figma Make milik Yaya). Isinya: repo React lengkap + `images/` berisi
gambar kanvas. **Buka gambar kanvasnya, jangan cuma baca kodenya.**

---

## Yang Yaya tolak dari v1 — jangan diulang

- Layar hampir hitam; laut tidak kelihatan sama sekali
- Pemandangan dan tulisan tidak pernah berada dalam satu bingkai
- Tata letak template gelap generik: eyebrow huruf besar → judul serif tipis →
  paragraf abu-abu, diulang enam kali persis sama
- Maskot dari Figma (bintang laut, ubur-ubur, paus) tidak dipakai
- Olen sendiri baru muncul jauh di bawah
- **Pilihan kutipan chat dinilai "jelek banget"** — belum dibongkar ulang.
  Sebelum menulis ulang, minta Yaya menunjuk satu contoh yang paling jelek
  supaya jelas salahnya: terlalu dangkal, salah momen, atau nada yang meleset.

---

## Nada tulisan

**Aturan pokok: reflektif dan menghangatkan hati.** Setiap kalimat yang muncul
di layar harus terasa seperti seseorang yang menyimpan sesuatu baik-baik, bukan
seperti antarmuka yang memberi perintah. "tekan untuk mulai" itu instruksi;
"whenever you're ready" itu tawaran.

**Bahasa: Inggris untuk yang dibaca Olen.** Aturan dari Yaya — kalau sebuah
kalimat terasa aneh atau kaku dalam bahasa Indonesia, tulis dalam bahasa
Inggris. Dalam praktiknya hampir semua teks di layar jadi bahasa Inggris yang
puitis dan pendek. Judul dan label memang sudah Inggris sejak awal.

Contoh yang berlaku sekarang:

| dulu | sekarang |
|---|---|
| tekan untuk mulai | whenever you're ready |
| sedang diputar / putar lagi | listening / play it again |
| suaramu, tiga tahun, tiga puluh tujuh detik | three years of your voice, folded into a minute |
| aku simpan semuanya di satu tempat | I kept every one of them, in the order they came |
| lanjut | keep going |

Nadanya tetap: setara, kakak–adik yang egaliter, protektif tapi menjaga dari
jauh. Tidak lebay, tidak menye-menye. POV kepada Olen ("you"), bukan tentang
penulisnya. Penulis muncul sekali saja, di tanda tangan paling bawah.

Komentar di dalam kode tetap bahasa Indonesia — itu untuk yang mengerjakan,
bukan untuk Olen.

Peristiwa 13 November 2024 (Olen bilang dirinya "cuma beban") boleh dirujuk,
tapi **jangan menampilkan ulang kalimat lukanya** — tampilkan bantahannya.

---

## Jebakan teknis yang sudah pernah menggigit

> **Daftar yang jauh lebih panjang, berikut kelas-kelas kesalahan yang
> berulang, ada di [`PELAJARAN.md`](PELAJARAN.md).** Bacalah itu dulu.
> Yang di bawah ini jebakan khusus 3D dan shader; yang di sana mencakup
> kepemilikan nilai, cara memverifikasi yang berbohong, hydration, basePath,
> gerbang, dan cara kerja antar-agen.


| Gejala | Sebab | Penanganan |
|---|---|---|
| Halaman kosong, DOM lengkap, tanpa error | `prefers-reduced-motion: reduce` menyala di Windows Yaya, dan konten digantungkan pada JS | Jangan pernah menggantungkan keterbacaan pada JS. Animasi pembuka pakai CSS `both`, plus `<noscript>` fallback |
| Semua chunk JS 403 lewat tunnel | Next 16 memblokir `/_next/*` lintas origin di mode dev | `allowedDevOrigins` di `next.config.ts` |
| RSC menolak data SQLite | `node:sqlite` mengembalikan objek ber-prototype null | Salin dengan spread sebelum dioper ke client component |
| Warning MODULE_TYPELESS saat seed | `npm install` menghapus `"type": "module"` | Pasang lagi di `package.json` |
| `taskkill` ditolak | Perlu hak admin | PowerShell → Run as administrator |

---

## Loop kerja yang benar

1. `git pull` / baca `memory.md` dulu.
2. Kerjakan **satu layar**.
3. Build/dev, lalu **buka sendiri di Chrome** (Claude in Chrome →
   `http://localhost:3006/v2`), screenshot, periksa konsol.
4. Perbaiki apa yang kamu lihat sendiri **sebelum** menyerahkan ke Yaya.
5. Baru minta Yaya menilai.
6. Catat keputusan **dan alasannya** ke `docs/ai-memory/memory.md`.

Kalau ada yang belum ditentukan: **berhenti dan tanya.** Jangan mengarang
perilaku lalu melanjutkan.

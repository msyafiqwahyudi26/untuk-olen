# PELAJARAN — kesalahan yang sudah terjadi, dan cara tidak mengulanginya

Dikumpulkan 31 Agustus – 1 September 2026, dari satu rentetan kerja panjang
di layar pembuka, turunan laut, dan jurnal langit.

**Bacalah ini sebelum `AGENTS.md`.** Isinya bukan aturan gaya. Tiap butir
lahir dari sesuatu yang benar-benar rusak, dan hampir semuanya baru ketahuan
setelah ada yang membuka layarnya — bukan saat kodenya ditulis, bukan saat
build-nya lolos.

Yang paling penting dari seluruh berkas ini satu kalimat:

> **Hampir semua kesalahan di bawah lolos dari build, lolos dari TypeScript,
> dan lolos dari pembacaan ulang kode. Yang menangkapnya adalah mengukur, dan
> mata orang yang membuka halamannya.**

---

## 1. Satu nilai hanya boleh punya SATU pemilik

Kelas kesalahan yang paling sering terjadi di sini, dan paling sulit
dilihat — karena kodenya tetap masuk akal dibaca sekilas.

| yang terjadi | dua yang menulis | akibatnya di layar |
|---|---|---|
| Tombol "keep going" meleset dari tengah | `transform: translateX(-50%)` dan animasi `uiNaik` yang berakhir `transform: none` | tombol lompat ke kanan sejauh separuh lebarnya |
| Barang piknik berserakan di pasir | tikar mengalikan `MAT.x` dengan `rapat`, DAN kelompoknya sudah digeser | tikar dan isinya terpisah 2,24 satuan |
| Turun dari langit disambut air | satu nama `"naik"` untuk kembali-dari-laut DAN kembali-dari-langit | tirai air muncul saat naik ke permukaan |
| Panel setelan tertimpa tulisan | `.st` berposisi absolut membawa `z-index`, lalu dijadikan `static` | panel gelap, tapi seluruh teks digambar di atasnya |

**Aturannya:** sebelum menambahkan sesuatu yang menulis posisi, warna, atau
transform, cari dulu siapa lagi yang menulisnya. Kalau ada dua, buang salah
satu — jangan disetel supaya kebetulan cocok.

**Dan satu jebakan turunannya:** mengubah `position` sebuah elemen ikut
membuang `z-index`-nya, karena `z-index` pada elemen statis diabaikan
sepenuhnya. Waktu mengubah satu properti, periksa apa lagi yang dibawanya.

---

## 2. Kecuraman bukan keterputusan — dan saya salah dua kali

Uji "tidak boleh melompat lebih dari sekian" **selalu terlihat masuk akal
waktu ditulis, dan selalu salah.**

Dua kali terjadi di berkas yang berbeda:

- Uji warna air gagal di 5,00 dari 255 tiap 0,5 meter. Bukan cacat — di lima
  meter pertama merah memang benar-benar hilang secepat itu.
- Uji kedalaman gagal di 7,07 m. Bukan cacat — ujung bawahnya memang curam,
  dan itu disengaja karena di sana tidak ada yang berubah.

**Cara yang benar tidak memakai ambang sama sekali:** perkecil langkahnya,
lalu lihat apakah lompatannya ikut mengecil.

```
langkah 0,5 m   → 5,00        langkah 0,05% → 7,07 m
langkah 0,05 m  → 1,00        langkah 0,005% → 0,71 m
        ikut mengecil = menerus
```

Fungsi menerus akan ikut mengecil. Keterputusan sejati tidak peduli seberapa
dekat kita mengukur.

Teknik ini yang membongkar **lompatan 0,81 satuan di tengah luncuran paus**
dan **terumbu karang yang melompat dari 0 ke 1 di meter pertama.** Keduanya
sudah berbulan-bulan tidak terlihat.

---

## 3. Cara memverifikasi yang ternyata berbohong

Semua ini pernah memberi jawaban yang salah, dan hampir dipercaya:

| yang dicari | kenapa gagal |
|---|---|
| nama komponen (`UburUbur`) di bundel | minifikasi mengganti nama variabel. **Cari TEKS, bukan KODE** |
| `/_next/static/chunks/[a-z0-9_]*\.css` | nama berkas bisa punya `--`; separuh CSS tidak ikut terambil |
| `rgba(6, 16, 34, 0.94)` di CSS tersaji | minifikasi menulisnya `#061022f0` |
| `::after` di CSS tersaji | minifikasi menulisnya `:after` |
| ukuran objek dari `z × tan(fov/2) × nisbah` | itu lebar di bidang KAMERA, bukan di bidang subjek |

**Aturannya:** kalau sebuah pemeriksaan menjawab "nol" atau "tidak ada",
**periksa dulu pemeriksanya** sebelum menyimpulkan ada yang rusak. Dan kalau
sebuah pemeriksaan menjawab "aman", tanyakan apakah ia benar-benar bisa
gagal.

Sebutkan juga **di mana** sebuah besaran diukur. "Setengah-lebar 12,7" tidak
berarti apa-apa tanpa menyebut di bidang mana.

---

## 4. Memperbaiki gejala, bukan sebabnya

Tiga kali terjadi, dan tiap kali menghasilkan kerusakan baru:

1. **Tombol "sky notes" menabrak judul** → saya pindahkan ke pojok.
   Menyembunyikan gejalanya sekaligus menyembunyikan tombolnya. Yang menabrak
   bukan posisinya melainkan jaraknya.
2. **Panel setelan tembus pandang** → saya pekatkan warnanya. Tidak menolong
   sama sekali, karena yang salah urutan tumpukannya. **Memekatkan warna
   tidak akan pernah memperbaiki urutan.**
3. **Pemandangan terpotong di HP** → saya mundurkan kamera. Lebarnya kembali,
   tapi semua bendanya jadi 2,7 kali lebih kecil, dan keluhan berikutnya
   "objek masih terlalu jauh".

**Aturannya:** sebelum menyetel angka, pastikan dulu mekanismenya. Kalau
perbaikannya tidak menjelaskan kenapa gejalanya muncul, ia bukan perbaikan.

---

## 5. Acak bukan merata

Langit malam memakai hash `fract(sin(i·k)·besar)`. Diukur di kisi 12 × 12:

```
hash sinus   33 dari 144 petak KOSONG · terpadat 5
deret R2      0 dari 144 petak kosong · terpadat 3
```

Sepertiga langitnya benar-benar kosong. Sebabnya bukan hash-nya jelek:
**keacakan sungguhan memang menggumpal.** Titik yang dipilih bebas satu sama
lain meninggalkan lubang di satu tempat dan tumpukan di tempat lain.

Yang dibutuhkan langit bukan **acak**, melainkan **merata** — dua hal yang
berbeda. Deret R2 (bilangan plastik) menyelesaikannya; sedikit goyangan
ditambahkan setelahnya supaya tidak terbaca sebagai kisi.

Dan sesudah sebarannya benar, ia masih "belum full" — kali ini karena
**jangkauannya**, bukan sebarannya. Pita bintang cuma y 22–118 sementara
langit terlihat sampai 162. Dua sebab berbeda untuk gejala yang sama.

---

## 6. Jangan pernah setState untuk sesuatu yang berubah tiap frame

Paus tersendat karena `setSpout()` dipanggil di dalam `useFrame` — setState
60 kali per detik untuk satu angka. Tiap panggilan me-render ulang seluruh
paus, dan render React menyela gelung animasi, jadi sendatannya menular ke
seluruh pemandangan.

Yang menyakitkan: **obatnya sudah ada di repo ini.** Komentar di
`Kepiting.tsx` menyebut persis masalah ini dan kepitingnya sudah diperbaiki
dengan objek kendali yang dimutasi. Pausnya tertinggal.

Berlaku juga untuk gulir: `Turunan.tsx` dan `Jurnal.tsx` menulis kedalaman
langsung ke DOM sebagai custom property CSS, bukan ke state. React merender
layar itu **sekali**.

**Aturannya:** nilai yang berubah tiap frame atau tiap peristiwa gulir
ditulis ke DOM atau ke objek yang dimutasi — tidak pernah ke state React.

---

## 7. Hydration: apa pun yang server tidak bisa tahu

Tiga sumber, semuanya pernah menggigit:

- `Math.random()` saat render → server dan peramban menghasilkan sebaran
  berbeda. Pakai pembangkit bersemai atau daftar tetap.
- `new Date()` saat render → server tidak tahu jam Olen. Nilai awal tetap,
  jam dibaca di `useEffect`.
- Ekstensi peramban yang menyuntik atribut → `suppressHydrationWarning`
  **hanya** di `<body>`, tidak lebih luas.

Dan kalau nilai awal tetap itu akhirnya berbeda dari yang sebenarnya, jangan
biarkan ia melompat: langit menyilang halus, sapaan diberi `key` supaya
memudar masuk, bintang ditahan sampai jamnya terbaca.

---

## 8. basePath membuat alamat yang ditulis sebagai teks jadi 404 — diam-diam

Sejak dipasang di `arcc-hivee.cloud/len`, setiap alamat mutlak yang ditulis
sebagai teks berhenti bekerja:

```
/api/notes      → 404
/len/api/notes  → 200
```

Next mengurus `<Link>`, `next/image`, dan `/_next/*` sendiri. Yang **tidak**
diurusnya: `<source src="/audio/beach.m4a">`, `<img src={`/memori/${x}`}>`,
dan `fetch("/api/notes")`.

Gagalnya senyap dan mahal: ruang tulis Olen sudah rusak berhari-hari, dan
yang muncul cuma "Belum kesimpan. Coba lagi sebentar." — kalimat yang
menyalahkan jaringan untuk kesalahan yang ada di alamat.

**Aturannya:** setiap alamat mutlak lewat `aset()` di `lib/basis.ts`. Tidak
ada pengecualian.

---

## 9. Gerbang, dan satu lubang yang hampir lolos

Matcher pertama ditulis `["/((?!_next/static|_next/image).*)"]`. Next
mengompilasinya dengan path-to-regexp, bukan regex mentah, dan di sana pola
itu jadi parameter **wajib** yang tidak pernah cocok dengan nilai kosong.

Akibatnya persis satu alamat tidak terjaga: **akarnya sendiri.** `/v2`,
`/design`, foto, audio semuanya tertutup rapat sementara halaman depan
menyajikan dirinya utuh kepada siapa pun.

Justru halaman yang paling mungkin dibuka orang asing yang paling mungkin
terlewat, karena kita menguji yang "dalam" dan menganggap yang "luar" pasti
ikut.

**Dan yang lebih mendasar:** layar PIN yang cuma menyembunyikan halaman tidak
menjaga apa pun. Foto dan rekaman suara tinggal di `public/`, yang disajikan
Next sebagai berkas statis tanpa melewati React. Gerbangnya harus duduk di
depan **semua permintaan**, bukan di depan halaman.

---

## 10. Impor nilai dari modul yang menyentuh disk

`MOOD` semula ditaruh di `db.ts`. Build langsung runtuh:

```
the chunking context does not support external modules (request: node:sqlite)
```

Satu impor **nilai** dari `db.ts` ke komponen klien menyeret seluruh mesin
basis data ke bundel peramban. Impor **tipe** aman karena hilang saat
dikompilasi; impor nilai tidak.

**Aturannya:** apa pun yang dibutuhkan kedua sisi tinggal di berkas yang
tidak tahu apa-apa soal disk. `lib/mood.ts` ada untuk itu.

---

## 11. Komentar yang berbohong lebih buruk daripada tidak ada komentar

Dua kali dalam satu hari:

- Catatan bintang jatuh berbunyi "jedanya panjang, 14 sampai 26 detik",
  sementara kodenya memakai lamanya melintas sebagai durasi — jadi jatuh tiap
  1,5 detik.
- Catatan berbunyi "diurus di `useLayoutEffect`", kodenya `useEffect`.

Keduanya saya tulis sendiri, di commit yang sama dengan kodenya.

**Aturannya:** kalau menulis KENAPA, periksa bahwa kodenya benar-benar
melakukannya. Komentar yang meyakinkan membuat orang berhenti memeriksa.

---

## 12. Tulisan Olen: aturan yang tidak boleh dilonggarkan

- **"Hapus" berarti menyembunyikan.** Tidak ada `DELETE` di jalur catatan.
  Barisnya tetap ada dengan tanda `dihapus`, dan isinya sudah disalin ke
  `note_revisi` lebih dulu. Dua lapis.
- **Rekaman diambil SEBELUM perubahan.** Kalau sesudah, yang tersimpan
  adalah hasilnya — dan yang lama, justru yang ingin diselamatkan, sudah
  tidak ada.
- **Tidak ada kotak "yakin?".** Konfirmasi cuma berguna untuk yang tidak bisa
  dibatalkan; di sini ia menambah langkah untuk sesuatu yang aman dan
  mengajari orang menekan "yakin" tanpa membaca. Gantinya satu kalimat
  jaminan di bawah tombolnya.
- **Perubahan skema hanya `ALTER TABLE ADD COLUMN`.** Menambah, tidak pernah
  menghapus atau menyusun ulang. Cadangkan `olen.db` dengan `sqlite3 .backup`
  lebih dulu dan periksa `PRAGMA integrity_check`.
- **BACA sebelum menghapus data uji.** Saya nyaris menghapus catatan sungguhan
  milik pemilik karena mengira itu sisa pengujian saya sendiri.

Satu pengecualian yang disebut terang-terangan di kodenya: `acara` boleh
benar-benar dihapus, karena ia keterangan tanggal — bukan sesuatu yang pernah
Olen rasakan.

---

## 13. Menilai dengan mata, bukan dengan bundel

Yang **tidak pernah** cukup: build lolos, TypeScript bersih, teks ditemukan
di bundel. Semua itu cuma membuktikan kodenya terkirim.

Yang cuma bisa dinilai mata, dan semuanya pernah salah meski kodenya benar:

- objek terlalu jauh atau terlalu dekat
- objek terlalu rapat atau terlalu renggang
- gerak yang "aneh" — bintang jatuh yang meluncur mendatar, awan yang gepeng,
  peralihan yang patah
- tabrakan tulisan di ukuran layar tertentu
- bidang kosong yang lebih luas daripada isinya

**Aturannya:** pekerjaan antarmuka belum selesai sebelum ada yang membuka
layarnya, di HP **dan** di layar lebar. Keduanya, bukan salah satu — beberapa
cacat cuma muncul di satu di antaranya.

---

## 14. Kalau sebuah angka bisa diturunkan dari angka lain, turunkan

Ini aturan lama proyek ini, dan sepanjang kerja kemarin ia terbukti berkali-
kali:

- Warna air dari hukum Beer–Lambert, bukan palet pilihan
- Warna langit dari hamburan Rayleigh dan kerapatan udara
- Warna tirai peralihan `= warnaAirDi(0)` yang sama persis dengan layar
  tujuannya — itu sebabnya peralihannya tidak berkedip
- Jarak kamera dan kerapatan isi pantai dari **satu** fungsi `tegaknya()`
- Ukuran dan kepucatan makhluk dari satu angka `--jauh`, jadi tidak mungkin
  besar tapi pucat
- Gulir dipetakan ke **perubahan**, bukan ke meter

Dan sebaliknya: tiap angka yang benar-benar **dipilih** disebut terang-
terangan di kodenya — `BOBOT_JARAK`, `keruhDi()`, `FOV_MAKS`, `Z_MAKS` —
supaya yang membaca tahu mana yang bisa dibantah dengan buku dan mana yang
tidak.

---

## 15. Cara kerja antar-agen

- **`git pull` sebelum mulai. Push sebelum berpindah agen.** Satu agen, satu
  berkas, pada satu waktu.
- Sebelum push, periksa: `git rev-list --count HEAD..origin/main`.
- Batas berkas disebut di depan, bukan diasumsikan. Selama pembagiannya
  dipatuhi, git menyatukan tanpa bentrokan — bentrok hanya terjadi pada
  berkas yang sama.
- **Satu langkah, satu laporan, sertakan keluaran perintahnya apa adanya.**
  Laporan "berhasil" tanpa keluaran bukan bukti.
- Kalau gagal, tulis perintah dan pesan galatnya utuh. Jangan diringkas jadi
  "gagal" — perbedaan antara "berkasnya tidak ada" dan "izinnya ditolak"
  menentukan langkah berikutnya, dan keduanya terlihat sama.
- Jangan `git merge --abort` sebelum melihat `git status`. Dan set editor ke
  sesuatu yang tidak menggantung: `git config --global core.editor "notepad"`.

### Yang tidak pernah lewat git

Foto, audio, dan `data/olen.db`. Ketiganya lewat `scp` terpisah ke
`/srv/untuk-olen` — **bukan** `/var/www/untuk-olen`, jalur yang sempat salah
tertulis di `DEPLOY.md` dan membuat pengiriman gagal.

Sesudah `scp` sebagai root, kepemilikannya harus dikembalikan:
`chown -R spd:spd /srv/untuk-olen/public`.

Dan PowerShell **tidak** memekarkan tanda bintang untuk perintah non-
PowerShell: `scp public\audio\*.m4a` mengirim teks `*.m4a` apa adanya. Sebut
nama berkasnya satu per satu, atau pakai `sftp` dengan `reput` yang bisa
melanjutkan dari titik putus kalau sambungannya jatuh.

---

## Daftar periksa sebelum melapor "selesai"

1. `npx tsc --noEmit` bersih
2. Build lolos, dan **bukan** ke folder yang sedang dipakai melayani
3. Pemeriksa mandiri lolos: `npm run periksa:kedalaman`, `periksa:kontras`
4. Kalau menyentuh skema: cadangan dibuat, `integrity_check` ok, data uji
   dibersihkan, tulisan sungguhan **tidak** tersentuh
5. Kalau menyentuh gerbang: tanpa tiket, foto menjawab 401 dan halaman 307
6. Pemeriksaan yang menjawab "aman" ditanyakan: **apakah ia bisa gagal?**
7. Yang menyangkut tampilan: disebut terus terang **belum dilihat mata**
   kalau memang belum

# HANDOVER — untuk sesi berikutnya

Kalau kamu Claude (atau siapa pun) yang baru masuk ke proyek ini: **baca
berkas ini sampai habis dulu**, lalu `AGENTS.md`, lalu
`docs/ai-memory/memory.md`. Tiga berkas itu berisi hampir semua hal yang
sudah gagal dicoba — membacanya menghemat berjam-jam.

---

## Ini apa

Kapsul waktu untuk **Olen** (Floren), adik perempuan Yaya — bukan adik
kandung. Dibangun dari ekspor WhatsApp tiga tahun (Nov 2023 – Agt 2026,
± 76.000 pesan).

**Tujuannya satu kalimat:** supaya Olen bisa membukanya kapan saja dan
diingatkan siapa dirinya — bahwa dia layak disayangi, jujur, dan baik.
**Bukan** untuk memamerkan kebaikan penulisnya.

Kalau ragu memilih antara "ini keren secara teknis" dan "ini terasa hangat
buat Olen", pilih yang kedua. Selalu.

---

## Keadaan sekarang

Layar pembuka (`/v2`) sudah jadi dan dinilai Yaya **± 85% selesai**.

Yang sudah berjalan:

| bagian | keadaan |
|---|---|
| pantai 3D | laut berpita, pasir bertekstur, buih, awan hanyut |
| makhluk | paus (muncul–menyembur–menyelam), flamingo, kepiting berjalan + jejak, bintang laut |
| piknik | tikar mengikuti gundukan pasir, keranjang berisi buah, piring, cangkir, bunga |
| empat waktu | pagi / siang / sore / malam, otomatis dari jam, bisa manual |
| matahari & bulan | bergerak di busur menurut jam; bulan naik saat matahari turun |
| audio | ombak sejak halaman dibuka, lagu saat MULAI, montase suara Olen 96 dtk |
| pengaturan | tombol pojok kanan atas: suara + pilihan waktu |
| library aset | `/aset` — tiap model 3D bisa dinilai sendirian |

---

## Yang PALING PENTING dipahami sebelum menyentuh kode

### 1. Tiga lapis, jangan dicampur

| lapis | tahu apa | TIDAK boleh tahu |
|---|---|---|
| `src/components/v2/assets/*.tsx` | geometri, warna, animasi yang melekat pada bentuk | garis air, tinggi pasir, kamera, arah perjalanan |
| `src/components/v2/world.ts` · `waktu.ts` | ukuran dunia dan palet waktu | bentuk apa pun |
| `beach.tsx` · `OpeningScene.tsx` | di mana, seberapa besar, ke mana bergerak | cara membuat bentuk |

Sebelum pemisahan ini ada, tiap perbaikan bentuk merusak penempatan dan
sebaliknya. Itu memakan sekitar sepertiga waktu proyek.

### 2. Perbaiki bentuk di `/aset` DULU, baru pasang ke scene

Di dalam scene, sebuah benda bisa terlihat salah karena sepuluh sebab
sekaligus — sudut kamera, air yang memotongnya, benda lain yang menimpanya.
Dipajang sendirian di `/aset`, salahnya ketahuan dalam hitungan detik.
Begitu halaman itu dibuat, tiga cacat yang sudah berbulan-bulan tidak
ketahuan langsung terlihat dalam satu menit.

### 3. Jangan menebak angka yang bisa dihitung

Ini akar dari hampir semua cacat visual di proyek ini:

- Sirip paus ditaruh di `y = 1.24` karena "kelihatan masuk akal" — permukaan
  badan di titik itu setinggi 0,70. Siripnya melayang selama dua putaran.
  → sekarang ada `permukaan(x, sudut)` di `assets/Paus.tsx`
- Tikar piknik dipasang datar di atas pasir yang miring 0,24 satuan.
  → sekarang `sandAt(x, z)` di `world.ts`, dipakai shader DAN penempatan
- Piring digeser sedikit-sedikit menjauhi keranjang, berkali-kali.
  → sekarang buahnya di DALAM keranjang, koordinatnya relatif ke keranjang

**Kalau sebuah angka bisa diturunkan dari yang lain, turunkan.**

### 4. Dua besaran yang terikat: turunkan satu dari yang lain

Tinggi dan kemiringan paus dulu punya rumus masing-masing, disetel sampai
kebetulan cocok. Tiap kali salah satunya diubah, pausnya bergerak ke satu
arah sambil menghadap arah lain — terbaca sebagai "kaku". Sekarang
kemiringannya dihitung dari kemiringan lintasannya sendiri (dy/dx).

---

## Jebakan yang sudah menggigit — jangan diulang

| gejala | sebab | penanganan |
|---|---|---|
| bidang tidak tergambar, tanpa error, draw call tetap terhitung | shader gagal dikompilasi. Pernah karena variabel bernama `patch` — kata cadangan GLSL | `renderer.properties.get(mat).currentProgram` → `getShaderInfoLog()`. Ada `ShaderCheck` otomatis di OpeningScene |
| kartu 3D kosong tanpa error | > 16 konteks WebGL dalam satu tab | satu kanvas, satu aset besar (lihat `/aset`) |
| InstancedMesh tidak tergambar | bola pembatasnya dihitung dari geometri dasar di titik nol, bukan sebaran instance | `frustumCulled={false}` |
| bentuk cermin salah arah | `rotation={[s*a, s*b, c]}` bukan cermin — three mengurutkan X·Y·Z | bungkus `<group scale={[1,1,s]}>` |
| torus berdiri padahal harusnya rebah | TorusGeometry lahir di bidang XY | yang MELINGKARI benda dirotasi -π/2; yang MENEMPEL DI SISI tidak |
| hydration mismatch terus-menerus | ekstensi Bitdefender menyuntik atribut ke `<body>` | `suppressHydrationWarning` HANYA di `<body>` |
| hydration mismatch sungguhan | `new Date()` saat render — server tidak tahu jam Olen | nilai awal tetap, jam dibaca di useEffect |
| gradien langit tidak mau beranimasi | `background-image` bukan properti yang bisa di-transition | dua lapis, yang atas di-fade (lihat `Langit.tsx`) |
| awan tetap putih terang di malam hari | bahan emissive tidak ikut gelap saat lampu diredupkan | warnanya diganti dari palet waktu |

---

## Audio — baca `scripts/build-voice.py` sebelum mengubah apa pun

Montase suara Olen sudah lima kali dibangun ulang. Komentar di kepala berkas
itu berisi riwayat lengkapnya. Yang paling berharga:

**Ukur, jangan tebak.** Waktu Yaya bilang "suaranya tb tb tinggi dan noise",
saya menduga pengolahan saya yang merusak. Setelah diukur (`goyang()` —
persentase bingkai yang nadanya melompat > 1,7× dalam 20 ms), ternyata
ketidakstabilan itu **ada di klip sumbernya**; pemerasan jeda dan perubahan
tempo hampir tidak berpengaruh. Yang salah pemilihan klipnya.

**Emosi memang goyang.** Klip menangis dan marah SELALU tidak stabil nadanya
— itu bunyi emosinya, bukan cacat. Ambang `goyang` dibuat beda per babak;
kalau ambang ketat dipakai merata, yang tersisa cuma Olen yang tenang dan
justru bagian terpenting hilang.

Empat pagar gain: target RMS, gain maksimum, lantai derau, **dan batas
puncak**. Yang keempat paling lama tidak ada dan itu penyebab hentakan.

---

## Aturan keras — jangan pernah dilanggar

1. **Jangan sentuh runtime global di VPS `76.13.196.172`.** Ada 4 aplikasi
   produksi lain di sana lewat PM2 (spd-backend, prototype-toko-ban,
   jubir-warga, arcc-hivee). Upgrade Node sistem pernah dilakukan dan
   mengganggu keempatnya. Pakai nvm/fnm per-user atau Docker.
2. **`data/olen.db` tabel `notes` adalah tulisan pribadi Olen.** Jangan
   pernah `DROP`, jangan hapus berkasnya. `npm run seed` sengaja hanya
   menghapus tabel konten.
3. **Jangan publikasikan ke internet terbuka.** Isinya foto dan percakapan
   pribadi anak di bawah umur. Lokal, atau di belakang password.
4. **Jangan commit isi ke git.** Foto, suara, dan lagu tidak masuk repo —
   lihat `.gitignore` dan `DEPLOY.md`.
5. **Satu layar, diverifikasi, baru lanjut.** Jangan bangun semuanya lalu
   baru ditunjukkan. Ini diminta langsung oleh Yaya setelah kerja sehari
   penuh terbuang.
6. **Verifikasi sendiri di browser sebelum menyerahkan.** Ada Claude in
   Chrome — ia menjalankan Chrome milik Yaya, jadi `localhost` bisa dibuka.

---

## Cara mulai

```powershell
cd "D:\Project Syafiq\Kerja\untuk-olen"
npm install
npm run seed              # isi SQLite dari content/story.ts
npm run dev -- -p 3006
```

- Node **≥ 22.18** (butuh `node:sqlite` bawaan)
- PowerShell lama tidak mengenal `&&` — tulis perintah baris per baris
- `/v2` layar cerita · `/aset` library model · `?cepat` percepat siklus paus

Audio dan foto tidak ikut repo. Untuk membangun ulang montase suara:

```bash
python3 scripts/build-voice.py     # butuh ekspor WhatsApp di folder induk
```

---

## Berikutnya

1. **Design system** — token warna, tipografi, jarak, komponen. Sekarang
   nilainya masih tersebar di `palette.ts`, `waktu.ts`, dan `v2.css`.
2. **Layar kedua** — momen awal perkenalan, Nov 2023:
   *"Floren ini ka syafiq"* → *"oh oke"*. Lagu kedua (`track-2`, Stuff We
   Did) dipasang di transisi ke sana.
3. **Jurnal harian** — dari layar pembuka ke ATAS menuju catatan Olen; ke
   BAWAH tetap harus melewati ceritanya dulu.
4. Transisi bawah laut (ubur-ubur, lumba-lumba) antara layar 1 dan 2.

**Menggantung:**
- Pilihan kutipan chat pernah dinilai *"jelek banget"* — belum dibongkar
  ulang. Sebelum menulis ulang, minta Yaya menunjuk satu contoh terburuk
  supaya jelas salahnya: terlalu dangkal, salah momen, atau nada meleset.
- Persetujuan font Fraunces.
- Tampilan di HP belum pernah diperiksa sama sekali.
- `npm run build` belum pernah dijalankan sampai selesai di mesin Yaya.

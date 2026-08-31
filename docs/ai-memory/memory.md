# memory.md — riwayat keputusan & kesalahan

Catat setiap keputusan **berikut alasannya**. Yang paling berharga di berkas ini
bukan daftar fitur, tapi daftar kesalahan — supaya tidak diulang.

Format: entri terbaru di **atas**.

---

## 31 Agustus 2026 (malam) — DESIGN SYSTEM

Sesudah repo naik ke GitHub. Yang dibangun: `src/design/` + halaman `/design`.

### Kesalahan yang ditemukan waktu membangunnya

**1. Warna chrome dipatok putih, dan tidak pernah dihitung.**

Semua tombol putih di atas kaca putih 16%. Benar waktu langitnya cuma satu
(siang, biru). Begitu langitnya jadi empat, tidak ada yang memeriksa ulang.
Hasil hitungan kontras (`npm run periksa:kontras`):

| di mana | latar | sebelum | ambang |
|---|---|---|---|
| keep going (di atas pasir siang) | #EBD5AC | **1,35 : 1** | 4,5 |
| tombol besar (langit pagi) | #DCD3E4 | **1,36 : 1** | 4,5 |
| settings (langit pagi) | #7FA8D8 | **2,10 : 1** | 4,5 |

Yang menutupi ini selama ini: `text-shadow: 0 1px 10px rgba(9,62,102,.35)` —
lapisan gelap yang dipasang karena "kelihatan lebih enak", tanpa pernah
dihitung. Tambalan yang kebetulan menolong. Ia akan berhenti menolong di
langit kelima.

Sekarang warna kaca diturunkan dari luminansi latar di belakangnya. Bukti
bahwa turunannya benar: untuk golden hour hitungannya berhenti di
`rgba(14,42,64,0.58)` — persis nilai yang dulu disetel dengan tangan sampai
terasa pas. Yang berubah bukan hasilnya, melainkan bahwa sekarang ada
alasannya, dan ia ikut berubah sendiri kalau paletnya diubah.

**Zona.** Tiap kontrol harus tahu ia duduk di ketinggian mana, karena latarnya
beda-beda: `.z-atas` (langit teratas), `.z-aksi` (langit tengah), `.z-bawah`
(**pasir**, bukan langit). Zona bawah itu yang paling sering salah dikira.

**2. Laut dan pasir mulai dari PUTIH lalu di-lerp ke warnanya.**

Ini bug yang paling berbahaya dari keduanya, dan ketemunya tidak sengaja.

`new THREE.Color()` tanpa argumen itu putih. Semua uniform warna laut dan
pasir dibuat begitu, dengan anggapan `useFrame` akan segera menggesernya ke
warna yang benar. Anggapan itu punya syarat: **gelung render harus jalan.**

Waktu memeriksa halaman lewat Claude in Chrome, Chrome men-throttle tab yang
tidak sedang dilihat — `requestAnimationFrame` berhenti total (ketahuan karena
`await` sebuah rAF menggantung sampai CDP timeout 45 detik). Akibatnya lautnya
putih selama tiga puluh detik, dan aku sempat menyangka itu ulah perubahan
CSS-ku sendiri. Sempat bisektik pakai `git stash` — dan hasilnya tidak
konsisten antar percobaan, yang justru petunjuknya: kalau bug-nya nyata,
hasilnya akan sama tiap kali.

Artinya bug sungguhan: **kalau Olen membuka halaman ini di tab latar lalu
berpindah ke sana, yang ia lihat laut putih.** Diperbaiki dengan memulai
uniform dari `PALET[waktu]` — warnanya sudah diketahui saat itu juga, jadi
tidak ada alasan memulainya dari warna lain lalu berharap. `useFrame` tetap
ada, tugasnya sekarang cuma menghaluskan pergantian waktu.

> **Pelajaran umum:** nilai awal yang "akan segera dibetulkan oleh animasi"
> adalah nilai yang ditebak, dan aturan proyek ini melarangnya. Kalau nilai
> yang benar sudah diketahui saat pembuatan, pakai itu.

> **Pelajaran kedua, soal cara memeriksa:** screenshot dari tab yang tidak
> sedang dilihat tidak bisa dipercaya untuk apa pun yang bergantung pada
> animasi. Kalau dua percobaan yang sama memberi hasil berbeda, berhenti
> menebak sebabnya — periksa dulu apakah alat ukurnya yang rusak.

**3. Huruf judul dimuat dari `v2.css`.**

Baru ketahuan waktu `/design` dibuat: judulnya jatuh ke Georgia, karena
Fraunces cuma ada di berkas milik layar cerita. Pindah ke `tokens.css`.
Outfit sempat diminta dua kali (globals + v2) — dua permintaan jaringan untuk
huruf yang sama.

**4. `globals.css` masih memegang design system proyek LAIN.**

Palet navy gelap dan Playfair Display, warisan v1. Bertentangan langsung
dengan aturan v2 (tidak ada navy gelap; huruf judul Fraunces). Tidak dihapus
karena v1 masih memakainya, tapi sekarang diberi kepala besar bertuliskan
peninggalan, jangan dipakai untuk halaman baru.

### Susunannya

```
src/design/warna.ts          matematika murni: luminansi, kontras, tumpuk
src/design/tema.ts           warna chrome, diturunkan dari PALET
src/design/tokens.css        ukuran, jarak, lengkung, tempo, huruf
src/design/ui.css            bentuk kontrol (.ui-pil, .ui-panel, …)
src/design/periksa-kontras.ts  npm run periksa:kontras
src/app/design/              rujukan hidup, empat waktu berdampingan
```

Pembagiannya menyalin yang sudah terbukti di sisi 3D:
`ui.css` membuat kontrol dan tidak tahu ia ada di layar mana; `v2.css`
menempatkan dan tidak membuat kontrol apa pun.

`warna.ts` dan `tema.ts` sengaja bisa dijalankan langsung oleh node
(`--experimental-strip-types`) — itu sebabnya impor di dalam `src/design/`
memakai ekstensi `.ts` yang ditulis lengkap, dan `allowImportingTsExtensions`
dinyalakan di tsconfig. Turbopack menerimanya.

### Yang berubah tampilannya, dan perlu penilaian Yaya

Tombol yang dulu kaca putih sekarang jadi kaca gelap di pagi/siang/sore, dan
tetap kaca putih di malam. Tombol "keep going" yang dulu tulisan telanjang
sekarang punya pil. Nama besar "Olen" **tidak** diubah — pengecualian yang
disengaja, dicatat di `tema.ts`: ukurannya 15rem, ia dibaca sebagai bentuk
bukan teks.

---

## STATUS SEKARANG — 31 Agustus 2026 (sore)

**Sedang dikerjakan:** v2, layar pembuka saja (`/v2`). Menunggu penilaian Yaya.

### ═══ CARA KERJA BARU — baca ini dulu ═══

Struktur kode dipisah tiga lapis. Ini yang paling penting dari seluruh sesi
hari ini, karena inilah akar dari hampir semua masalah sebelumnya.

| lapis | berkas | tahu apa | TIDAK tahu apa |
|---|---|---|---|
| **bentuk** | `src/components/v2/assets/*.tsx` | geometri, warna, animasi yang melekat pada bentuk (kepak sayap, ayun kaki) | garis air, tinggi pasir, letak kamera, ke mana ia berjalan |
| **ukuran dunia** | `src/components/v2/world.ts` | garis air, `sandAt(x,z)` | bentuk apa pun |
| **penempatan** | `src/components/v2/beach.tsx`, `OpeningScene.tsx` | di mana, seberapa besar, ke mana berjalan | cara membuat bentuk |

**Aturan aset:** digambar di titik nol, menghadap +X, berdiri di y = 0.
**Skala:** 1 satuan dunia = 30 cm. Flamingo 1,2 m → 4 satuan. Ini yang bikin
benda terlihat sepadan tanpa ditebak.

**Alurnya: `/aset` DULU, baru scene.** Halaman `/aset` memajang tiap model
sendirian di panggung putar. Perbaiki bentuk di sana sampai benar, baru pasang.
Sebelum ada halaman ini, tiap model diedit sambil sudah terpasang — dan di
dalam scene sebuah benda bisa terlihat salah karena sepuluh sebab (sudut
kamera, air yang memotongnya, benda lain yang menimpanya). Tidak mungkin tahu
mana yang salah. Begitu dipajang sendirian, semua langsung ketahuan dalam
hitungan detik: bintang laut ternyata kubah, moncong paus ternyata lancip
seperti tetesan air, flamingo ternyata tidak punya sendi kaki.

**Cara iterasi:** `npm run dev -- -p 3006` di laptop Yaya, lalu buka lewat
Claude in Chrome (Chrome-nya Yaya, jadi localhost bisa). `?cepat` di URL
mempercepat siklus paus dari 30 detik jadi 9 — menunggu 30 detik untuk melihat
satu animasi itu menyiksa waktu menyetel.

### Yang sudah beres hari ini
- Audio dibangun ulang total (lihat entri di bawah). Bersih, teruji otomatis.
- Library aset 3D + halaman `/aset`.
- Flamingo, paus, bintang laut, matahari dimodelkan ulang dari nol.
- Kepiting: jalan santai, berhenti di tengah melambai, meninggalkan jejak.
- Laut vs pasir tidak lagi saling menembus (diselesaikan lewat kedalaman).

**Berikutnya:** transisi ke bawah laut (ubur-ubur, lumba-lumba), lalu layar
kedua — momen awal perkenalan (Nov 2023, "Floren ini ka syafiq" → "oh oke").
Lagu kedua (`track-2`, Stuff We Did) dipasang di transisi itu.

**Menggantung:**
- Pilihan kutipan chat dinilai "jelek banget" — tunggu Yaya menunjuk satu
  contoh terburuk dulu.
- Persetujuan font Fraunces.
- Foto: 6 terpasang, kandidat lengkap di `_kurasi-foto.html`.
- Tampilan di HP belum pernah diperiksa. Yaya perlu buka
  `http://192.168.100.6:3006/v2` dari ponselnya.

---

## 31 Agt 2026 — putaran kelima: busur matahari, gerak paus dari lintasannya

**Matahari dan bulan bergerak di BUSUR, bukan pindah antar empat titik.**
Posisinya dihitung dari jam: jam 6 terbit di timur, jam 12 di puncak, jam 18
terbenam di barat. Bulan memakai busur yang sama digeser 12 jam, jadi begitu
matahari turun di kiri, bulan naik di kanan. Karena jamnya pecahan, keduanya
benar-benar merayap selama halaman dibuka.

Lampu utama sekarang ikut mengarah DARI benda langitnya. Kalau lampu diam
sementara matahari bergerak, sisi terang benda-benda di pantai tidak cocok
dengan langitnya — itu yang membuat pemandangan terasa digambar, bukan
disinari.

**Gerak paus: satu sumber kebenaran.** Ini pelajaran terbesar putaran ini,
dan penyebab tiga versi gagal berturut-turut.

Selama ini TINGGI dan KEMIRINGAN paus diatur oleh dua rumus terpisah, lalu
angkanya disetel sampai kelihatan cocok. Begitu tidak cocok, paus bergerak ke
satu arah sambil menghadap arah lain — dan itulah yang terbaca sebagai "kaku"
dan "aneh waktu turun". Menyetel angkanya lagi tidak pernah menyelesaikan;
cuma memindahkan ketidakcocokannya ke bagian lain siklus.

Sekarang cuma ada satu fungsi: `tinggiDi(k)`. Kemiringannya DITURUNKAN dari
kemiringan lintasan itu sendiri — dy/dx dihitung numerik, jadi arah hadap
selalu sama dengan arah gerak, seperti makhluk hidup mana pun. Dikalikan 0,055
karena lintasannya jauh lebih curam daripada sudut badan yang enak dilihat.

Prinsip yang berlaku umum: **kalau dua besaran secara fisik terikat, jangan
menganimasikan keduanya secara terpisah.** Turunkan yang kedua dari yang
pertama. Sama seperti sirip paus yang harus mengambil posisi dari `atasDi(x)`,
bukan dari angka yang ditebak.

**Flamingo, dua kali meleset.** Aset menghadap +X. rotation.y: 0 = kanan,
π/2 = ke kamera, π = kiri, −π/2 = membelakangi layar. Percobaan −1.05 dan
+1.05 sama-sama salah karena keduanya di paruh busur yang keliru. Yang benar
π − 0.55 ≈ 2.59: menghadap kiri, sedikit menyerong ke kamera.

---

## 31 Agt 2026 — putaran keempat: transisi waktu, bulan, montase ditata ulang

**Montase dibongkar ulang.** Yaya lebih suka versi lama: *"yang sekarang
banyak yang ketawanya dan emosionalnya terlalu berantakan urutannya… banyak
audio yang rusak dalam artian rusak suaranya tb tb tinggi dan noice"*.

Yang paling berharga dari putaran ini: **cacatnya diukur, bukan ditebak.**
Ditambahkan `goyang(x)` — berapa persen bingkai bersuara yang nadanya
melompat lebih dari 1,7 kali dalam 20 ms, diukur lewat autokorelasi.

Lalu diuji per tahap, dan hasilnya membalik dugaan awal:

| klip | mentah | + peras jeda | + tempo 0.84 |
|---|---|---|---|
| 00019568 (pembuka lama) | 7,6% | 7,6% | 7,1% |
| 00025565 (penutup) | 0,7% | 0,7% | 1,5% |

Artinya ketidakstabilan itu **ADA DI KLIP SUMBERNYA**, bukan dibuat oleh
pengolahan. Selama ini saya mencurigai `squeeze_gaps` dan `atempo`; keduanya
nyaris tidak berpengaruh. Yang salah adalah PEMILIHAN.

Seluruh 570 VN Olen disurvei ulang dengan ukuran ini (disaring dulu ke 225
yang berdurasi 4–25 detik, lalu diukur). Hasil: 62 klip benar-benar stabil.

Satu temuan penting menyusul: hampir semua klip stabil bersuasana "ringan".
Klip menangis, marah, dan menahan sakit SELALU goyang — **karena memang
begitu bunyi emosi**. Kalau ambang ketat dipakai di semua babak, yang tersisa
cuma Olen yang tenang, dan justru bagian terpenting hilang. Jadi ambangnya
per babak: 3,5% untuk pembuka/harian/penutup, 9% untuk keluh, 8% untuk sedih.

Hasil: 34 potongan, 96 detik, goyang turun dari 9,7% jadi 3,2%.

**Tumpukan tawa dihapus.** Tiga klip tawa yang ditumpuk di ujung membuat
lompatan dari babak sedih langsung ke tawa tanpa jembatan. Emosi butuh
urutan, bukan tumpukan. Tawa sekarang ada di babak `pulih` dalam urutan
biasa, sesudah satu potongan tenang sebagai jembatan.

**Transisi waktu.** Gradien CSS TIDAK bisa dianimasikan — `background-image`
bukan properti yang bisa di-transition. Sebelumnya langit berganti dalam satu
frame sementara laut dan lampu bergeser 1,5 detik; hasilnya lebih buruk
daripada kalau semuanya melompat, karena langit sudah malam sementara lautnya
masih siang. `Langit.tsx` memakai DUA lapis: yang bawah memegang langit lama,
yang atas memudar masuk membawa langit baru. Opacity bisa dianimasikan.

Satu detail yang mudah terlewat: opacity 0 dan 1 tidak boleh diset di frame
yang sama — browser menggabungkannya dan tidak ada yang teranimasi. Harus
lewat dua `requestAnimationFrame` bersarang.

**Bulan jadi aset sendiri** (`assets/Bulan.tsx`), bukan matahari yang
diputihkan. Matahari memancarkan cahaya — rata terang, tanpa sisi gelap.
Bulan MEMANTULKAN — ada sisi terang, sisi redup, dan kawah. Matahari yang
diwarnai putih cuma jadi lubang putih di langit malam. Keduanya selalu ada
di scene; yang berganti skalanya, supaya pergantiannya ikut teranimasi.

**Paus, dua cacat terakhir:**
- "Bagian lancip di depan" ternyata rusuk moncong: satu bola lonjong LURUS
  sepanjang 1,7 satuan, sementara punggung paus menurun tajam ke moncong.
  Memendekkannya cuma memindahkan masalah; yang benar adalah membuatnya
  melengkung mengikuti `atasDi(x)`, sama seperti garis mulut.
- Mulutnya cemberut karena `sudut` naik lurus dari belakang ke depan —
  sudut mulut jadi titik terendah. Senyum itu kebalikannya: sudut belakang
  TERANGKAT, tengahnya turun.

---

## 31 Agt 2026 — putaran ketiga: dua menit audio, empat waktu, panel settings

**Audio jadi 118 detik (1,97 menit).** Yang berubah:
- Babak `pembuka` dan `penutup` mengambil potongan JAUH lebih panjang (7,5 dan
  9 detik) supaya ada bahan untuk fade masuk dan fade keluar. Yaya: "di bagian
  akhir masih agak gantung". Redup keluarnya 4,5 detik, dulu 1,2.
- `squeeze_gaps`: keheningan di DALAM satu klip dipendekkan, bukan dibuang —
  jeda lebih dari 0,45 dtk disusut jadi 0,26 dtk dengan silang 60 ms. Jeda
  manusiawi tetap ada, jeda yang terdengar seperti berkas macet hilang.

**Bug yang hampir membuang justru klip terbaik.** `squeeze_gaps` merusak
pengukuran lantai derau: `measure()` memakai persentil ke-10 amplop sebagai
lantai derau, dan itu hanya benar selama klipnya masih punya keheningan.
Sesudah jedanya dipangkas, persentil ke-10 jatuh di suara pelan — angkanya
melonjak sepuluh kali lipat dan gerbang derau membuang VN penutup 17 detik
yang paling bersih. Lantai derau sekarang diukur SEBELUM pemangkasan.

**Empat waktu.** `src/components/v2/waktu.ts` — pagi, siang, sore (golden
hour), malam. Otomatis dari jam di komputer Olen, bisa dipilih manual di
panel settings, dan kalau mengikuti jam ia berpindah sendiri tiap menit.

Pelajaran di sini: **mengganti langit saja tidak cukup.** Kalau cuma
gradiennya yang berubah, hasilnya terlihat seperti latar yang ditukar di
belakang benda yang tidak ikut berubah. Jadi tiap waktu membawa palet lengkap
— langit, laut, pasir, matahari, dua lampu, warna awan, dan bintang. Semuanya
di-lerp selama ± 1,5 detik; kalau uniform diganti langsung, peralihannya
terjadi dalam satu frame dan terbaca sebagai gambar yang ditukar.

Yang paling mudah terlewat: **awan**. Bahannya emissive supaya cerah di siang
hari, dan justru karena itu ia TIDAK ikut gelap waktu lampu diredupkan. Awan
putih terang di langit malam adalah hal pertama yang terlihat salah.

**Nilai awal waktu SELALU "siang", bukan jam sebenarnya.** Server tidak tahu
jam berapa di tempat Olen; kalau dihitung dari `new Date()` saat render, HTML
server dan klien berbeda dan React melapor hydration mismatch — yang asli kali
ini, bukan ulah ekstensi. Jam sebenarnya dibaca di useEffect.

**Paus: `permukaan()`.** Akar cacat "siripnya tidak menempel" adalah angka
yang ditebak. Sirip punggung ditaruh di y = 1.24 karena terlihat masuk akal;
permukaan badan di titik itu cuma setinggi 0,70. Sekarang ada `radiusDi(x)`,
`atasDi(x)`, `sisiDi(x)` dan `permukaan(x, sudut)` yang diturunkan dari profil
badan, dan SEMUA tempelan memakainya. Garis mulut pun dibangun dari
titik-titik permukaan, jadi mustahil melayang lepas berapa pun profilnya
diubah.

Satu lagi: **mencerminkan rotasi dengan tanda minus tidak menghasilkan bentuk
cermin.** Sirip dada dipasang `rotation={[s*0.45, s*0.55, -0.3]}`; karena
three mengurutkan X·Y·Z, kedua sirip berakhir di arah berbeda dan yang sebelah
menonjol ke depan melewati moncong. Yang benar: satu rotasi, dicerminkan lewat
`scale={[1, 1, -1]}` pada group pembungkus.

**Buah pindah ke DALAM keranjang**, dan koordinatnya relatif terhadap
keranjang, bukan terhadap tikar — jadi jaraknya ke gelas dan piring dijamin
oleh dinding keranjang, bukan oleh angka yang harus dijaga manual.

---

## 31 Agt 2026 — putaran kedua: babak audio, buah, gerak flamingo

Penilaian Yaya setelah putaran pertama, dan yang dikerjakan.

**Audio.** Sisa derau masih terdengar di klip yang cuma diredam. Ambang
dinaikkan tajam (SNR_MIN 14 → 26, NOISE_MAX 0.006 → 0.0035) dan klip berisik
sekarang DIBUANG, bukan diselamatkan — denoise berat sendiri meninggalkan
jejak "berkecipak" yang juga terdengar. Ditambah VN yang diminta: empat klip
sakit, dua marah, dua menangis, dicari lewat penelusuran kata kunci pada ±6
pesan di sekitar tiap VN Olen di 80.548 pesan chat.

Satu bug halus yang menahan VN menangis: angka SNR dipakai untuk DUA hal
sekaligus — menentukan klip diterima, dan memilih sekuat apa denoise-nya.
Klip dengan lantai derau tinggi dipangkas SNR-nya ke 24 agar dapat saringan
kuat, lalu angka yang sudah dipangkas itu dipakai lagi untuk menolaknya. VN
Olen menangis (SNR asli 36 dB) ikut terbuang. Sekarang dua angka terpisah.

**Tempo per babak.** Yaya minta pembuka pelan, tengah standar, sedih pelan,
penutup standar. Diterapkan per potongan sebelum disambung (`stretch`), bukan
sekali di akhir. Ditambah `JEDA` 0,5 dtk antar potongan dan silang diperpanjang
jadi 0,95 dtk — jauh lebih lega. Penutupnya tiga klip tawa yang DITUMPUK
saling bertindih, bukan disambung. Hasil: 28 potongan, 73,7 detik.

**Bahasa.** Aturan baru: tulisan reflektif dan menghangatkan; kalau Indonesia
terasa aneh, pakai Inggris. Semua teks layar diganti (lihat AGENTS.md).

**Bentuk.**
- Paus: sirip ekor tidak lagi di-`center()` — yang harus jatuh di titik nol
  adalah PANGKALNYA. Kalau di-center, letak pangkal berubah tiap kali
  bentuknya disetel dan sambungannya lepas lagi tanpa ketahuan. Sirip dada
  dipendekkan dari 2,1 satuan; sepanjang itu ia terbaca sebagai bilah lepas.
- Bintang laut: dua kulit terpisah yang "kebetulan" berakhir di titik sama
  ternyata tetap dua himpunan titik berbeda, jadi normalnya berbeda di kiri
  dan kanan jahitan → garis terang di tepi lengan. Sekarang satu lembar
  menerus yang berbagi cincin ujung. Titik pusatnya (160 titik jatuh di
  koordinat sama, luas segitiga nol) ditutup kubah kecil.
- Kepiting: waktu berhenti ia berputar ke 0°, bukan −90°. Yang lama memutarnya
  180° penuh — punggungnya yang menghadap kamera. Ditambah percepatan-
  perlambatan dan 22 detik pantai kosong antar lintasan.
- Flamingo: siklus perilaku 26 detik (mematuk, merapikan bulu, menggeliat,
  memindahkan berat) dengan diam panjang di antaranya. Justru diam-nya yang
  bikin gerakan terasa kejadian.
- Piring ketiga diganti buah (apel, jeruk, pisang). Piring lebar dan keranjang
  lebar di petak yang sama akan selalu bersinggungan, seberapa pun digeser.
- Bunga kecil putih jadi aset sendiri (daisy), bukan bunga matahari dicat putih.

**Error hydration yang muncul terus** ternyata dari ekstensi Bitdefender yang
menyuntikkan atribut ke `<body>` dan tiap `<div>` sebelum React hidrasi. Bukan
bug kita. Dibungkam dengan `suppressHydrationWarning` HANYA di `<body>` —
peringatan palsu yang muncul terus membuat peringatan sungguhan tak terlihat.

---

## 31 Agt 2026 — audio dibangun ulang, tiga versi

Yaya: *"ada suara keresek di detik 13"*, lalu setelah diperbaiki: *"masih ada
suara anehnya di detik ke 13"*. Ternyata dua cacat berbeda yang terdengar mirip.

**Versi 1 — desis.** Tiap potongan dinormalkan `x * (0.16 / rms)` tanpa batas.
VN paling pelan ber-RMS 0.009 → dikuatkan 17×. Suaranya terdengar, tapi lantai
derau opus WhatsApp ikut naik 17×. Ditambah `np.clip(-1,1)` yang memotong
puncak jadi distorsi.

**Versi 2 — hentakan.** Gain diberi pagar, desisnya hilang, muncul cacat lain:
hening total 0,5 detik lalu ledakan energi 0,43. Dua sebab: (a) klipnya cuma
1,6 detik sedangkan jendela dipatok 3,0 detik, jadi potongannya cacat;
(b) jendela dipilih dari "bagian paling berenergi", dan yang paling berenergi
justru hentakan awal rekaman — bunyi jari menyentuh tombol, bukan suara Olen.

**Versi 3 — yang dipakai.** `scripts/build-voice.py`:
1. Potongan dipilih dari RENTANG BERSUARA, bukan jendela panjang tetap.
   Diam < 0,36 dtk dianggap jeda dalam kalimat, jadi kalimatnya tidak terbelah.
2. EMPAT pagar gain: target RMS, gain maksimum, lantai derau, dan **batas
   puncak**. Yang keempat paling lama tidak ada dan itu penyebab hentakan yang
   tersisa — gain dihitung dari RMS, jadi klip berpuncak tinggi tapi rata-rata
   pelan tetap dikuatkan sampai puncaknya menembus 2,4.
3. Hentakan didefinisikan SEKALI (`find_transients`) dan dipakai pemulih maupun
   pemeriksa. Sebelumnya keduanya punya rumus sendiri dengan ambang berbeda —
   pemeriksa melapor tiga titik yang tidak pernah disentuh pemulih.
4. Syarat hentakan: naik tajam dari nyaris senyap **dan waktu naik < 4 ms**.
   Suara manusia butuh 5–100 ms untuk mencapai puncak, sekeras apa pun. Tanpa
   syarat ini, konsonan letup Olen ikut tertuduh.
5. **Urutan tempo–limiter.** Dulu `atempo` dijalankan di langkah encode,
   SESUDAH limiter — jadi limiter merapikan sesuatu yang lalu di-resample
   lagi, dan puncaknya melonjak 0,62 → 0,95. Sekarang: pelankan dulu, baca
   kembali, baru dirapikan.
6. Limiter BERPANDANGAN KE DEPAN (ambil gain terkecil dari beberapa blok
   berikutnya sebelum dihaluskan). Tanpa itu gain belum sempat turun waktu
   puncaknya datang.
7. Daftar sumber di `scripts/voice-sources.json` dan TIDAK PERNAH ditulisi.
   Dulu skrip membaca dan menulis berkas yang sama — jalan tiga kali, klip
   yang dilewati hilang dari daftar dan urutan suasana hatinya rusak diam-diam.
8. Pemeriksaan otomatis di akhir, termasuk membaca kembali berkas yang SUDAH
   dikodekan (puncak antar-sampel AAC baru kelihatan setelah dekode).

Hasil: 18 potongan, 36,8 detik, tempo 0,94×, puncak 0,72, laporan bersih.

**Tata suara halaman:** ombak nyala sejak halaman dibuka (dicoba autoplay;
kalau ditolak, menyala pada sentuhan pertama apa pun). Tombol MULAI
menyalakan lagu, lalu **jeda 6,5 detik** sebelum suara Olen masuk — kalau
ketiganya menyala bersamaan, kalimat pertama Olen tertimbun intro lagu.

Bug halus yang ikut ketemu: dua fade bisa jalan bersamaan dan yang paling lama
menang. Waktu MULAI ditekan, musik di-fade naik selama 3 detik; lalu suara
Olen mulai dan meminta musik turun selama 1,2 detik. Fade 1,2 detik selesai
duluan, fade 3 detik terus menimpanya — musiknya tidak pernah mengalah persis
di kalimat pertama Olen. Diperbaiki dengan token per elemen.

---

## 31 Agt 2026 — `patch` adalah kata cadangan GLSL

Cacat paling mahal hari ini. Pasir tidak tergambar sama sekali selama beberapa
putaran perbaikan, dan sepanjang itu saya menyalahkan warna, komposisi, dan
lebar pita buih.

Yang sebenarnya terjadi: shader pasir punya variabel bernama `patch`. Itu kata
cadangan GLSL. Shader gagal dikompilasi.

Yang membuatnya sulit dilacak — tiga hal sekaligus:
1. three melapor lewat `console.error`, dan pembaca console dari luar halaman
   tidak kebagian pesannya;
2. draw call-nya TETAP terhitung — `onBeforeRender` tetap jalan 51× per detik,
   jadi dari luar seolah objeknya digambar;
3. tidak ada yang berubah selain: piksel di area itu tetap transparan.

**Cara memastikan, dalam 10 detik:**
```js
const p = renderer.properties.get(mesh.material).currentProgram;
gl.getShaderInfoLog(p.fragmentShader);   // "Illegal use of reserved word"
```
Sekarang ada `ShaderCheck` di `OpeningScene.tsx` yang menjalankan pemeriksaan
ini otomatis saat dev. Kata cadangan lain yang gampang kepakai tanpa sadar:
`sample`, `filter`, `input`, `output`, `common`, `resource`, `active`,
`partition`, `this`, `packed`, `long`, `short`, `double`, `half`, `fixed`.
Karena itu nama variabel di shader proyek ini dibuat bahasa Indonesia.

---

## 31 Agt 2026 — batas konteks WebGL

Halaman `/aset` versi pertama: satu `<Canvas>` per aset, 13 kartu, 13 konteks
WebGL. Chrome cuma mengizinkan ± 16 konteks hidup per tab. Begitu halaman
di-reload dan konteks lama belum sempat dilepas, sebagiannya mati — kartunya
jadi kotak kosong, tanpa satu pun pesan error.

Diganti: SATU kanvas, satu aset ditampilkan besar, sisanya daftar di kiri.
Ternyata juga lebih berguna — menilai bentuk butuh benda yang besar.

---

## 31 Agt 2026 — dari sprite SVG ke geometri 3D sungguhan

**Kata Yaya:** *"berantakan banget"*. Semua keluhannya — bintang laut gepeng,
ekor paus mau putus, kaki kepiting kepotong, awan statis tanpa volume, burung
aneh — ternyata **satu penyakit yang sama**: aku menggambar gambar 2D lalu
mendirikannya di dunia 3D. Menambal SVG-nya lagi tidak akan pernah cukup.

**Sekarang semuanya mesh betulan** dengan `MeshToonMaterial` + gradientMap 3
tingkat (`creatures.tsx`, `picnic.tsx`). `art.ts` dan `props.tsx` sudah tidak
dipakai — tidak bisa dihapus dari sini karena penjaga hapus berkas Cowork, tapi
tidak diimpor siapa pun.

Yang penting diingat:
- **Bayangan kontak wajib.** Elips gelap tipis di bawah tiap benda. Tanpa itu
  semuanya terlihat melayang, sebagus apa pun bentuknya.
- **Toon shading butuh cahaya.** `ambientLight` 1.15 + dua `directionalLight`.
  Kalau ambient terlalu tinggi (pernah 2.1), warnanya jebol jadi putih.
- **LatheGeometry: `rotateZ(+90°)` memetakan y → −x.** Paus sempat terpasang
  terbalik sehingga ekornya menempel di moncong — persis keluhan "ekornya mau
  putus". Selalu cek arah setelah merotasi geometri.
- **Ujung Lathe terpotong rata.** Perlu bola kecil sebagai penutup moncong.

**BIDANG LANGIT 3D SELALU MENUTUPI SELURUH SCENE.** Sudah tiga kali dicoba
(vertex color, shader, dengan renderOrder −10 dan depthWrite false) dan tiga
kali semua objek lain hilang tanpa pesan error. Langit **harus** gradien CSS di
`.op` dengan `alpha: true` pada canvas. Jangan diulang.

**Gejala "canvas kosong tapi tidak ada error"** hampir selalu berarti satu objek
menutupi semuanya atau satu shader gagal. Bisect komponen satu per satu; itu
selalu lebih cepat daripada menebak.

**Alur suara**: browser melarang autoplay, jadi tombol "The Memory of Voice"
sekaligus jadi tombol MULAI — sekali ditekan, ombak + musik + montase jalan
bersamaan, lalu tombol "lanjut" muncul. Lagu ditaruh Yaya sendiri di
`public/audio/track-1.mp3`; kalau berkasnya belum ada halaman tetap jalan.
**Lagu Disney (Bundle of Joy / Stuff We Did) berhak cipta — jangan pernah
mengunduh atau menyertakannya.**

**Ubur-ubur dipindah** ke transisi bawah laut nanti, bukan di pembuka — air
setinggi mata kaki tidak masuk akal untuk ubur-ubur.

---

## 31 Agt 2026 — putaran kedua layar pembuka: audio, hewan, tekstur

**Audio dibangun dari nol, semuanya bebas hak cipta.**
- `public/audio/voice-of-olen.*` — 21 potongan dari 563 voice note Olen, 54 detik.
  Urutannya sengaja berbentuk cerita, ini permintaan Yaya sendiri:
  **ringan → mengeluh → menangis → bahagia lagi**, ditutup tawa paling lepas.
  Pemilihannya otomatis: konteks chat di sekitar tiap VN diberi skor ke empat
  keranjang, lalu potongan paling berisi dicari lewat energi RMS bergerak,
  disamakan kenyaringannya, disambung dengan crossfade 0.3 detik.
  Manifesnya ada di `voice-of-olen.json` (file, tanggal, mood, detik ke berapa).
- `public/audio/beach.*` — ombak + pad tenang, 60 detik, disambung mulus
  (4 detik terakhir dilipat ke awal). Ombaknya derau merah muda yang difilter
  lalu dimodulasi deburan yang saling tumpang tindih; padnya akord D mayor
  yang bernapas. Semua dibangkitkan numpy, tidak ada sampel dari luar.
- Ombak otomatis mengecil ke 0.16 saat suara Olen diputar, naik lagi setelahnya.

**Hewan & properti** (`art.ts` = SVG, `props.tsx` = penempatan): camar, paus,
ubur-ubur, bintang laut, kepiting berjalan dua rangka, bunga matahari, bunga
kecil, matras piknik, keranjang. **Sengaja tidak ada orang** — tempatnya kosong,
menunggu.

**Tekstur**: butiran pasir dari hash noise di shader, plus satu lapis grain
feTurbulence di atas seluruh halaman (`.op-grain`) supaya tidak terasa vektor
datar. Tidak ada berkas gambar yang dimuat.

**Kamera menunduk 8°** supaya pasir dapat ±28% bingkai — tanpa itu properti
piknik selalu jatuh di luar layar. Kalau menggeser properti, ingat: yang
terlihat cuma pita z ≈ 29…40.

**Jangan pakai `#include <colorspace_fragment>`.** Di three r180 chunk itu
bentrok dengan fungsi yang sudah disuntikkan
('LinearTransferOETF : function already has a body'). Sudah diganti fungsi
`toSRGB()` yang ditulis sendiri di tiap shader.

**Error hydration `bis_skin_checked` = ekstensi Bitdefender di Chrome Yaya**,
bukan bug. Hilang kalau dibuka di Incognito.

---

## 31 Agt 2026 — jebakan WebGL yang menghabiskan satu jam

Layar pembuka v2 sempat kosong berkali-kali. Empat sebab berbeda, semuanya
**tanpa pesan error yang terlihat di konsol**. Kalau canvas tampak kosong tapi
`canvasCount` 1 dan tidak ada error, curigai daftar ini dulu:

1. **`#include <colorspace_pars_fragment>` di ShaderMaterial** → `ERROR:
   'LinearTransferOETF' : function already has a body`. three sudah
   menyuntikkan fungsi itu sendiri. Cukup tulis `#include <colorspace_fragment>`
   di akhir `main()`, JANGAN sertakan pars-nya.
2. **Shader kustom tanpa `#include <colorspace_fragment>` sama sekali** →
   warna keluar terlalu gelap/jenuh (pasir krem jadi cokelat tanah).
3. **`smoothstep(edge0, edge1, x)` dengan `edge0 > edge1`** → perilaku tak
   terdefinisi di GLSL. Selalu tulis naik lalu balik: `1.0 - smoothstep(lo, hi, x)`.
4. **Bidang langit dengan ShaderMaterial** menutupi seluruh scene meski
   `renderOrder={-10}` dan `depthWrite={false}`. Versi `meshBasicMaterial` +
   `vertexColors` bekerja normal. Sudah dipakai yang bekerja — jangan diubah
   tanpa alasan kuat.

**Cara mendiagnosanya** (ini yang akhirnya berhasil, catat baik-baik): pembaca
konsol dari luar tidak menangkap error shader three. Pasang penangkap sementara
di komponen — bungkus `console.error` dan `window.onerror` ke `window.__diag`,
lalu baca lewat JS. Pesan `ERROR: 0:233:` langsung muncul.

Pelajaran proses: begitu satu perubahan bikin layar kosong, **bisect segera** —
matikan komponen satu per satu. Tiga tebakan berturut-turut lebih mahal daripada
satu bisect.

Catatan warna: `vertexColors` dibaca three sebagai ruang kerja linear. Untuk
menyamakan dengan keluaran shader kustom, panggil `.convertSRGBToLinear()`
sebelum menulis ke atribut.

---

## 31 Agt 2026 — v1 ditolak, arah desain diganti total

**Kata Yaya:** *"masih AI base banget"*, *"jauh banget dari ekspektasi"*.

**Diagnosisku setelah membuka sendiri di Chrome:** Figma-nya ilustrasi, aku
membangun simulasi. Aku pakai token warnanya sendiri lalu menguburnya di bawah
kabut eksponensial dan scrim gelap sampai layar praktis hitam. Kesalahan
kategori, bukan kesalahan detail.

**Arah baru (dari jawaban langsung Yaya):**
- Biru muda, bukan navy. **Olen suka biru muda** — ini fakta yang tidak pernah
  kutanyakan sebelumnya.
- Pantai → langit biru → luar angkasa. Bukan menyelam ke laut dalam.
- Kartun 3D ala Disney yang digarap rapi, bukan realisme.
- Banyak karakter bergerak.
- Pembuka: "Memories of Olen" + namanya + suaranya. Tanpa paragraf.

**Pelajaran:** brief tertulisnya sendiri sudah bilang *"fix it with layering,
not with 3D"*. Aku menandainya di awal, lalu menuruti permintaan "WebGL" dan
menafsirkannya jadi realisme. Kalau ada dua sinyal yang bertabrakan, **tanyakan
mana yang menang** — jangan pilih sendiri diam-diam.

---

## 30 Agt 2026 — MERUSAK PRODUKSI: upgrade Node di VPS bersama

**Yang terjadi:** aku menyuruh upgrade Node sistem v20.20.2 → v22.23.2 lewat
NodeSource supaya `node:sqlite` bisa dipakai. VPS itu ternyata menjalankan 4
aplikasi produksi lain. Keempat proses PM2 masih hidup dari binari Node 20 yang
sudah terhapus; restart berikutnya akan memindahkan semuanya ke Node 22
sekaligus. `needrestart` saat `apt install` juga bisa menendang service lain.

**Kenapa terjadi:** aku tidak pernah bertanya *"apa lagi yang jalan di VPS
ini?"* padahal Yaya sudah menyebut sedang membangun web lain di sana.

**Aturan permanen:** jangan pernah mengubah runtime global di mesin bersama.
Pakai nvm/fnm per-user atau Docker. Kalau aplikasi ini yang jadi alasannya,
lebih baik hilangkan ketergantungannya: ganti `node:sqlite` → SQLite WASM, dan
seed baca JSON, bukan `.ts`. Dengan itu jalan di Node 18/20.

---

## 30 Agt 2026 — kurasi foto salah proxy

**Yang salah:** aku menyaring lampiran dengan skor "dibahas lagi setelah
dikirim". Reaksi *"wah enak"* untuk foto belanjaan mendapat skor sama dengan
*"cantik banget"* untuk foto Olen. Hasilnya daftar berisi foto masker dan
belanjaan. Kata Yaya: *"cuman foto olen yang stitch aja"* yang bagus.

**Perbaikannya:** hanya lampiran **kiriman Olen**, buang tangkapan layar lewat
heuristik dimensi, lalu deteksi wajah OpenCV di empat orientasi (banyak foto WA
tersimpan miring). Hasil: 359 foto → 126 screenshot dibuang → 39 berwajah.

**Temuan tak terduga yang jadi paling berharga:** menyisir 570 voice note Olen
memunculkan pola yang berulang tiga tahun — *"ketawanya nular banget"*,
*"renyah banget ketawanya"*, *"bikin kangen"*, *"gua jadi ikutan ketawa"*.
Itu hal yang paling sering dikatakan tentang dia, dan v1 sama sekali tidak
memuatnya. Sekarang tiga voice note terpasang di `public/memori/vn/`.

**Pelajaran:** kalau menyaring ribuan item, jangan pakai satu proxy numerik.
Tanya dulu apa yang sebenarnya dicari.

---

## 30 Agt 2026 — membangun 100% lalu baru ditunjukkan

Seharian kerja, lalu ditolak seluruhnya. Kalau layar pertama ditunjukkan lebih
dulu, arahnya ketahuan salah dalam 20 menit.

**Sekarang wajib:** satu layar → verifikasi sendiri di Chrome → serahkan →
baru lanjut.

---

## 30 Agt 2026 — jalan memutar yang tidak perlu (cloudflared)

Aku menyuruh pasang cloudflared dan membuat tunnel publik supaya halaman bisa
kulihat. **Tidak perlu sama sekali** — Claude in Chrome menjalankan Chrome milik
Yaya, jadi `http://localhost:PORT` bisa langsung kubuka. Sandbox-ku memang tidak
bisa menjangkau localhost-nya, tapi Chrome-nya bisa.

Tunnel itu malah memunculkan masalah baru: Next 16 memblokir `/_next/*` lintas
origin di mode dev → semua chunk JS kena 403 → halaman tidak pernah ter-hydrate.

**Pelajaran:** sebelum membangun jembatan, cek dulu alat yang sudah ada.

---

## 30 Agt 2026 — halaman tampak kosong padahal DOM lengkap

`prefers-reduced-motion: reduce` menyala di Windows Yaya. Semua elemen menunggu
animasi masuk yang digerakkan JS, jadi berhenti di `opacity: 0`.

**Aturan:** keterbacaan tidak boleh pernah bergantung pada JavaScript. Animasi
pembuka pakai CSS `animation ... both`, ditambah `<noscript>` yang memaksa
semuanya terlihat.

---

## 30 Agt 2026 — keputusan teknis yang bertahan

- **Next.js 16 App Router**, bukan Vite — Yaya memilihnya karena punya VPS.
- **`node:sqlite` bawaan Node**, bukan `better-sqlite3` — tidak ada native
  build. (Konsekuensinya: butuh Node ≥ 22.18. Ini yang memicu insiden VPS.
  Pertimbangkan mengganti ke WASM.)
- **WAL menyala** di `db.ts` dan `seed.mjs` sejak awal — `olen.db` tidak akan
  mengunci dirinya sendiri.
- **Konstelasi pakai SVG, bukan WebGL** — supaya bisa diklik, terbaca screen
  reader, dan ringan di HP.
- **`content/story.ts` satu-satunya sumber naskah**, di-seed ke SQLite. Ubah di
  satu tempat.

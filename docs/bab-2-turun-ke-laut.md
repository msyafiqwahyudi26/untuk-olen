# BAB 2 — TURUN KE LAUT

Rancangan isi untuk layar kedua. Ditulis 31 Agustus 2026, sesudah Yaya
memilih dua hal:

1. **Urutan momen: kronologis, tapi yang berat dikumpulkan di satu kedalaman.**
2. **Sesudah dasar: terus naik menembus permukaan sampai ke langit.**

Latarnya dibangun sesi VPS. Berkas ini mengatur ISINYA.

---

## Naskahnya sudah ada — jangan menulis yang baru

`content/story.ts` sudah memuat seluruh bahan sejak awal proyek, dan bab-babnya
kebetulan persis cocok dengan arah naik-turun yang sekarang dipilih:

| bab | konstanta | isi | jumlah |
|---|---|---|---|
| 1 Garis Pantai | `THINGS` | hal kecil khas Olen | 10 |
| **2 Turun ke Laut** | **`MOMENTS`** | **momen berurutan Nov 2023 → Agt 2026** | **10** |
| **3 Dasar** | **`SHIFTS`** | **pasangan "dulu → sekarang"** | **6** |
| 4 Naik | `QUOTES` | kalimat Olen sendiri | 18 |
| 5 Langit | `STARS` | momen sebagai bintang | 13 |

Tiap `Moment` punya `date`, `title`, `body`, sering `said` (kalimat Olen
sendiri), kadang `photo`.

**Kalau ada yang terasa kurang, ubah `story.ts` — bukan menulis naskah baru di
komponen.** Itu satu-satunya tempat naskah, dan `npm run seed` membacanya.

---

## Yang membuat rancangan ini punya arah

**Dasar laut BUKAN bagian tergelap secara perasaan.**

Isinya `SHIFTS`: enam pasang "dulu kamu bilang kamu paling bego → sekarang
kamu bilang kamu jago mandarin, dan kamu benar". Itu bagian paling menguatkan
di seluruh proyek, dan letaknya di titik paling dalam.

Ini bukan kebetulan yang boleh dirusak. Tujuan seluruh halaman ini — dari
`HANDOVER.md` — adalah supaya Olen diingatkan siapa dirinya. Turunan yang
berakhir di titik tergelap secara perasaan akan meninggalkannya di sana.
Turunan yang berakhir di `SHIFTS` meninggalkannya dengan bukti.

Dan ubur-ubur di `assets/UburUbur.tsx` sengaja dibuat `emissive` — **ia tetap
menyala waktu air di sekitarnya menggelap**, kebalikan dari awan yang justru
harus ikut gelap. Jadi di titik terdalam dan tergelap, yang menerangi datang
dari makhluknya sendiri. Metaforanya jalan tanpa perlu ditulis, dan tidak
boleh ditulis — begitu dijelaskan, ia mati.

---

## Sepuluh momen, dan mana yang berat

Berat = momen yang menghentikan turunnya. Ditandai dari isi `body`-nya, bukan
dari selera:

| # | key | tanggal | berat? |
|---|---|---|---|
| 1 | `awal` | 23 Nov 2023 | ringan — pembuka |
| 2 | `bego` | 2 Jan 2024 | **BERAT** — "aku rasa paling bego", jam setengah dua pagi |
| 3 | `tulisan-2024` | 11 Jan 2024 | ringan, ada foto |
| 4 | `gambar-2024` | 12 Agt 2024 | ringan |
| 5 | `bakso-enak` | 2 Sep 2024 | ringan |
| 6 | `jujur` | 13 Nov 2024 | **BERAT** — malam ia cerita hal tersulit |
| 7 | `dengerin` | 10 Jan 2025 | sedang — hangat |
| 8 | `gw` | Sepanjang 2025 | ringan |
| 9 | `sma` | 22 Agt 2026 | ringan |
| 10 | `hati-hati` | 29 Agt 2026 | **BERAT** — sakit kepala, habis nangis, tetap menjaga orang |

---

## "Satu kedalaman" artinya satu KEJADIAN, bukan satu koordinat

Yang diminta Yaya dan yang tidak bisa dipenuhi apa adanya: momen berat ada di
urutan 2, 6, dan 10. Mengumpulkannya di satu kedalaman berarti memindahkan
tanggal, dan Olen tahu urutan hidupnya sendiri — loncatan itu akan terasa.

Jadi yang disamakan bukan angkanya, melainkan **apa yang terjadi di situ**:

- **Momen ringan** lewat sambil turun terus. Tidak ada yang berhenti.
  Teksnya muncul dan hanyut ke atas seperti benda yang kita lewati.
- **Momen berat** MENGHENTIKAN turunnya. Airnya jadi diam, gelap sedikit,
  arusnya berhenti, dan satu makhluk tinggal di situ bersamanya sampai ia
  memilih lanjut.

Ketiganya jadi terasa satu tempat karena mengalami hal yang sama — dan
urutannya tetap jujur.

**Konsekuensi teknis:** turunan tidak boleh murni ikut gulir. Harus ada
keadaan `berhenti` yang menahan kedalaman meski gulirnya diteruskan, sampai
Olen menekan lanjut. Kalau tidak, momen berat akan tersapu lewat sama
cepatnya dengan yang ringan, dan seluruh rancangan ini tidak ada artinya.

---

## Makhluk mana di kedalaman berapa

Turunannya **menerus, tanpa tahap** (pilihan Yaya sebelumnya). Yang menandai
kedalaman adalah siapa yang ada di situ, bukan garis pemisah.

| kedalaman | yang ada | momen yang biasanya jatuh di sini |
|---|---|---|
| 0–15 % | terumbu karang, ikan kecil, cahaya permukaan bergoyang | 1 |
| 15–35 % | ikan menjauh, karang menipis | 2 (BERHENTI) |
| 35–55 % | lumba-lumba lewat, berpasangan, cepat | 3, 4, 5 |
| 55–75 % | paus melintas pelan, jauh, besar | 6 (BERHENTI) |
| 75–90 % | tidak ada apa-apa. Air saja. | 7, 8 |
| 90–100 % | ubur-ubur, menyala | 9, 10 (BERHENTI) |

Bagian 75–90% sengaja kosong. Laut dalam sungguhan memang kosong, dan
kekosongan itu yang membuat ubur-ubur di bawahnya berarti. Mengisinya dengan
makhluk supaya "tidak membosankan" akan menghapus satu-satunya bagian yang
memberi ruang.

---

## Sesudah dasar: naik menembus permukaan

Pilihan Yaya. Perjalanannya jadi satu tarikan panjang:

```
pantai → turun → dasar (SHIFTS) → naik → menembus permukaan
       → BAB 4 (QUOTES) → BAB 5 (STARS) → fajar
```

### Ketegangan yang harus diselesaikan

Arah **ATAS dari pantai** sudah direncanakan untuk **jurnal harian Olen** —
tempat dia menulis sendiri. Sekarang arah **naik dari dasar** juga menuju
langit. Dua-duanya "ke atas", dan kalau tidak dipisahkan dengan jelas, Olen
akan bingung kenapa naik dari dua tempat memberi hasil berbeda.

**Cara memisahkannya:** keduanya bukan arah, melainkan dua benda berbeda.

- Dari pantai, ke atas = **pintu**. Satu tempat yang dia buka kapan saja
  untuk menulis. Bukan perjalanan.
- Turun ke laut = **perjalanan**. Sekali mulai, ia berjalan sendiri sampai
  selesai: turun, dasar, naik, langit, fajar. Berakhir kembali di pantai.

Jadi yang membedakan bukan arahnya, tapi apakah itu tempat atau perjalanan.
Pintu jurnal tetap bisa dibuka dari mana pun; perjalanan cuma punya satu
mulut, di bawah.

---

## Urutan mengerjakan

Aset dulu, di `/aset` ruang `laut`, sampai benar — baru dipasang. Aturan yang
sudah terbukti; lihat `AGENTS.md`.

1. **`LumbaLumba.tsx`** — belum lolos, tiga cacat tercatat di `HANDOVER.md`
2. **`Terumbu.tsx`** — karang bercabang, meja, kipas; plus ikan kecil
3. **`kedalaman.ts`** — saudara `world.ts`. Satu angka kedalaman 0–1 →
   warna air, kabut, cahaya, dan siapa yang hidup di situ. Semua fungsi
   menerus. **Kerjakan sebelum scene**, kalau tidak "menerus tanpa tahap"
   akan berakhir jadi tiga scene yang disambung.
4. **Scene turunan** + keadaan `berhenti` untuk momen berat
5. **Naik sampai langit**, memakai `QUOTES` dan `STARS` yang sudah ada

---

## Yang masih menunggu keputusan Yaya

- Apakah "dikumpulkan di satu kedalaman" memang berarti KEJADIAN yang sama
  (rancangan ini), atau ia benar-benar ingin momen 2, 6, 10 dipindahkan
  berdekatan meski tanggalnya jadi loncat.
- Foto: `tulisan-2024` punya `photo`. Muncul bagaimana di dalam air —
  melayang seperti benda hanyut, atau menempel di teksnya.

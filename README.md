# untuk Olen

Kapsul waktu interaktif untuk **Olen** (Floren) — dibangun dari ekspor
WhatsApp tiga tahun, Nov 2023 sampai Agt 2026.

Supaya dia bisa membukanya kapan saja dan diingatkan siapa dirinya.

---

## Repo ini berisi kode, bukan isinya

Foto Olen, rekaman suaranya, tulisannya, dan tiga lagunya **tidak ikut di
sini** — dan itu disengaja. Dia di bawah umur; apa pun yang masuk riwayat
git ada di sana selamanya. Alasan lengkap dan cara memindahkannya ke server
ada di [`DEPLOY.md`](DEPLOY.md).

Artinya: hasil `git clone` **tidak akan berbunyi dan tidak ada fotonya**.
Halamannya tetap jalan — pantainya, makhluknya, semuanya ada.

**Repo ini harus private.**

---

## Mulai

```powershell
npm install
npm run seed              # isi SQLite dari content/story.ts
npm run dev -- -p 3006
```

Node ≥ 22.18 (butuh `node:sqlite` bawaan).

| alamat | isi |
|---|---|
| `/v2` | layar cerita — pantai, empat waktu, suara Olen |
| `/aset` | library model 3D, satu per satu di panggung putar |
| `/design` | design system — token, kontrol, kontras di keempat waktu |
| `/v2?cepat` | siklus paus 9 detik, untuk menyetel animasi |

```powershell
npm run periksa:kontras   # apakah tiap tombol masih terbaca di keempat waktu
```

---

## Kalau kamu yang melanjutkan

Baca berurutan:

1. **[`HANDOVER.md`](HANDOVER.md)** — keadaan sekarang, aturan keras,
   jebakan yang sudah menggigit, dan apa berikutnya
2. **[`AGENTS.md`](AGENTS.md)** — cara kerja: tiga lapis, kontrak aset,
   nada tulisan
3. **[`docs/ai-memory/memory.md`](docs/ai-memory/memory.md)** — riwayat
   keputusan **berikut alasannya**, entri terbaru di atas

Berkas ketiga itu yang paling berharga. Isinya bukan daftar fitur melainkan
daftar kesalahan — lengkap dengan kenapa sesuatu yang kelihatan masuk akal
ternyata tidak. Membacanya menghemat berjam-jam.

Satu aturan yang merangkum sebagian besar isinya: **kalau sebuah angka bisa
diturunkan dari angka lain, turunkan — jangan ditebak.** Hampir semua cacat
visual di proyek ini berawal dari angka yang "kelihatan masuk akal".

---

## Peta singkat

```
content/story.ts              satu-satunya tempat naskah
scripts/build-voice.py        montase suara Olen — baca komentarnya dulu
src/app/v2/                   layar cerita
src/app/aset/                 library aset
src/app/design/               rujukan design system
src/design/
  warna.ts                    luminansi & kontras. Matematika murni.
  tema.ts                     warna chrome, DITURUNKAN dari palet waktu
  tokens.css                  ukuran, jarak, lengkung, tempo, huruf
  ui.css                      BENTUK kontrol — tidak tahu ia di layar mana
src/components/v2/
  world.ts                    garis air + tinggi pasir. Satu sumber.
  waktu.ts                    palet pagi/siang/sore/malam + busur matahari
  assets/                     BENTUK 3D — tidak tahu apa pun soal scene
  beach.tsx                   PENEMPATAN — tidak membuat bentuk apa pun
  OpeningScene.tsx            kanvas, langit, laut, pasir, perjalanan paus
```

# DEPLOY

## Aturan pertama

**Halaman ini tidak boleh berada di internet terbuka.**

Isinya foto, rekaman suara, dan percakapan pribadi anak di bawah umur.
Tiga lagunya juga rekaman berhak cipta. Lokal, jaringan rumah, atau di
belakang password — tidak ada pilihan keempat.

`robots: noindex, nofollow` sudah dipasang, tapi itu cuma permintaan sopan
ke mesin pencari. Yang benar-benar menjaga adalah tidak menaruhnya di URL
yang bisa ditebak, dan basic auth di depannya.

---

## Kenapa isinya tidak ikut git

Repo berisi KODE. Foto, suara, dan lagu sengaja tidak ikut.

Alasannya bukan ukuran berkas. Begitu masuk riwayat git, mereka ada di sana
selamanya — ikut tiap clone, ikut tiap fork, dan tidak bisa benar-benar
dihapus tanpa menulis ulang seluruh riwayat. Kalau repo-nya sempat publik
satu menit saja, itu sudah cukup.

Yang tidak ikut (lihat `.gitignore`):

```
public/memori/          foto dan voice note Olen
public/audio/*.m4a      ombak, montase suara Olen, tiga lagu
public/audio/*.opus
data/*.db               termasuk tabel `notes`, tulisan pribadi Olen
```

---

## Mengunggah pertama kali ke GitHub

Repo-nya **harus private**. Periksa itu dulu di GitHub sebelum push.

```powershell
cd "D:\Project Syafiq\Kerja\untuk-olen"

git init
git branch -M main
git add .
```

**Sebelum commit, pastikan tidak ada yang privat ikut terbawa:**

```powershell
git status --short | Select-String "memori|\.m4a|\.opus|\.mp3|\.db"
```

Perintah itu harus tidak mengeluarkan apa-apa. Kalau ada yang muncul,
`.gitignore` belum kena — jangan lanjut, perbaiki dulu.

```powershell
git commit -m "Layar pembuka: pantai 3D, empat waktu, montase suara Olen"
git remote add origin https://github.com/msyafiqwahyudi26/untuk-olen.git
git push -u origin main
```

---

## Memindahkan isinya ke server

> **RALAT 31 Agustus 2026.** Bagian ini sebelumnya menyebut
> `/var/www/untuk-olen`, folder yang **tidak ada** di server. Jalur yang benar
> adalah `/srv/untuk-olen`. Kekeliruannya baru ketahuan saat halamannya
> benar-benar dibuka: tidak ada suara sama sekali, di HP maupun di laptop,
> karena keenam berkas audio memang tidak pernah sampai ke sana.

Lewat `scp`, di luar git. Jalankan dari komputer Yaya:

```powershell
# kode: lewat git di server
ssh root@76.13.196.172 "cd /srv/untuk-olen && sudo -u spd git pull"

# isi: langsung, tidak lewat git
scp -r public\memori root@76.13.196.172:/srv/untuk-olen/public/
scp public\audio\*.m4a public\audio\*.opus root@76.13.196.172:/srv/untuk-olen/public/audio/
```

Sesudah `scp` sebagai root, kepemilikannya HARUS dikembalikan. Aplikasinya
berjalan sebagai `spd` lewat PM2, dan berkas milik root di dalamnya akan
menyandung build maupun git berikutnya:

```bash
ssh root@76.13.196.172 "chown -R spd:spd /srv/untuk-olen/public && sudo -u spd pm2 restart untuk-olen"
```

Enam berkas yang dicari halaman pembuka. Tanpa ketiga pasang ini, halamannya
tetap berjalan penuh tetapi **tanpa satu pun bunyi**, dan tombol suaranya
akan menulis `no audio`:

```
public/audio/beach.m4a          public/audio/beach.opus
public/audio/track-1.m4a        public/audio/track-1.opus
public/audio/voice-of-olen.m4a  public/audio/voice-of-olen.opus
```

`voice-of-olen` TIDAK bisa dibangun ulang di server: `scripts/build-voice.py`
membutuhkan ekspor WhatsApp lengkap, yang tidak ada di sana dan memang tidak
boleh ada di sana.

`data/olen.db` **jangan pernah ditimpa** — di dalamnya ada tabel `notes`,
tulisan pribadi Olen. Kalau server belum punya database, buat baru di sana
dengan `npm run seed`; kalau sudah punya, biarkan.

---

## Menjalankan di VPS

VPS `76.13.196.172` menjalankan 4 aplikasi produksi lain lewat PM2:
spd-backend, prototype-toko-ban, jubir-warga, arcc-hivee.

**Jangan mengubah Node sistem di sana.** Pernah dilakukan dan mengganggu
keempatnya. Pakai nvm per-user:

> **RALAT 31 Agustus 2026.** Bagian ini menggambarkan pemasangan yang belum
> terjadi. Sekarang sudah terpasang, dan bentuknya berbeda dari yang ditulis
> di sini. Keadaan sebenarnya:

| | |
|---|---|
| Jalur | `/srv/untuk-olen` |
| Port | 3002 |
| Node | v22.23.2, sudah jadi node sistem — nvm tidak dipakai |
| PM2 | proses `untuk-olen`, milik `spd`, sudah `pm2 save` |
| Alamat | `https://arcc-hivee.cloud/len` (basePath `/len`) |
| Gerbang | PIN empat angka di dalam aplikasi, BUKAN basic auth nginx |

```bash
# memasang ulang dari nol, sebagai spd — jangan sebagai root
cd /srv/untuk-olen
npm ci
npx next build
pm2 start node_modules/next/dist/bin/next --name untuk-olen --cwd /srv/untuk-olen -- start -p 3002
pm2 save
```

### Gerbangnya bukan basic auth

Rencana semula memakai `auth_basic` nginx. Yang terpasang berbeda, atas
permintaan pemilik: **PIN empat angka di dalam aplikasi**, supaya Olen bisa
menggantinya sendiri dan supaya pintunya terasa seperti gembok buku harian,
bukan kotak dialog peramban.

Nginx hanya meneruskan, tanpa memotong awalan `/len` (aplikasinya sendiri
yang mengharapkan awalan itu lewat `basePath`):

```nginx
location /len { proxy_pass http://127.0.0.1:3002; }
location /Len { rewrite ^/Len(/.*)?$ /len$1 permanent; }
```

Yang menjaga isinya adalah `src/proxy.ts`, dan ia duduk di depan SEMUA
permintaan — bukan cuma halaman. Itu wajib: foto dan rekaman suara tinggal di
`public/`, yang disajikan Next sebagai berkas statis tanpa melewati React.
Layar PIN yang hanya menyembunyikan halaman tidak menghalangi siapa pun
mengambil `/len/memori/senyum-2024.jpg` langsung.

Memasang PIN pertama kali, sebelum alamatnya dibuka ke siapa pun:

```bash
cd /srv/untuk-olen && sudo -u spd node scripts/set-kunci.mjs <empat angka>
```

Rahasia penanda tangan tiket ada di `.env.local` (tidak ikut git). Kalau
nilainya diganti, semua sesi yang sedang terbuka langsung batal — itu juga
cara mencabut akses dari perangkat yang hilang.

> **Catatan yang belum selesai.** Berkas ini menulis "Repo-nya **harus
> private**". Per 31 Agustus repo di GitHub **publik** — bisa di-clone tanpa
> kredensial apa pun. Isi milik Olen tidak ikut bocor, karena `.gitignore`
> menahan foto, suara, dan basis datanya, dan itu sudah diperiksa. Yang bocor
> hanya kodenya. Tetap perlu diputuskan pemilik: repo dijadikan private, atau
> kalimat di atas yang diperbarui. Yang berbahaya adalah membiarkan keduanya
> berbeda, karena orang berikutnya akan percaya kalimatnya, bukan kenyataannya.

---

## Membangun ulang montase suara

Butuh ekspor WhatsApp di folder induk (`../WhatsApp Chat - …`).

```bash
python3 scripts/build-voice.py
```

Skripnya membaca `scripts/voice-sources.json` (ikut git — itu cuma daftar
nama berkas, bukan suaranya) dan menulis `public/audio/voice-of-olen.*`.
Di akhir ia memeriksa sendiri hasilnya; kalau ada hentakan, lubang senyap,
atau nada tidak stabil, ia yang memberi tahu.

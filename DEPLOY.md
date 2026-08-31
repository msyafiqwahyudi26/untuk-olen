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

Lewat `scp`, di luar git. Jalankan dari komputer Yaya:

```powershell
# kode: lewat git di server
ssh root@76.13.196.172 "cd /var/www/untuk-olen && git pull"

# isi: langsung, tidak lewat git
scp -r public\memori root@76.13.196.172:/var/www/untuk-olen/public/
scp public\audio\*.m4a public\audio\*.opus root@76.13.196.172:/var/www/untuk-olen/public/audio/
```

`data/olen.db` **jangan pernah ditimpa** — di dalamnya ada tabel `notes`,
tulisan pribadi Olen. Kalau server belum punya database, buat baru di sana
dengan `npm run seed`; kalau sudah punya, biarkan.

---

## Menjalankan di VPS

VPS `76.13.196.172` menjalankan 4 aplikasi produksi lain lewat PM2:
spd-backend, prototype-toko-ban, jubir-warga, arcc-hivee.

**Jangan mengubah Node sistem di sana.** Pernah dilakukan dan mengganggu
keempatnya. Pakai nvm per-user:

```bash
# di VPS, sebagai user biasa — BUKAN apt install nodejs
nvm install 22
nvm use 22

cd /var/www/untuk-olen
npm ci
npm run build
pm2 start npm --name untuk-olen -- start -- -p 3010
pm2 save
```

Lalu di depannya pasang basic auth. Contoh nginx:

```nginx
location / {
    auth_basic           "untuk Olen";
    auth_basic_user_file /etc/nginx/.htpasswd-olen;
    proxy_pass           http://127.0.0.1:3010;
    proxy_set_header     Host $host;
}
```

```bash
htpasswd -c /etc/nginx/.htpasswd-olen olen
```

Pakai subdomain yang tidak bisa ditebak, bukan `/untuk-olen` di domain
utama.

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

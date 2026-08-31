@AGENTS.md

Kalau kamu baru masuk ke proyek ini, baca **`PELAJARAN.md`** lebih dulu:
kelas-kelas kesalahan yang terus berulang di sini, berikut cara mengujinya
supaya tidak terulang lagi.

Lalu `HANDOVER.md` — keadaan sekarang, aturan keras, dan yang sedang
dikerjakan.

Lalu `docs/ai-memory/memory.md`: riwayat keputusan **berikut alasannya**,
entri terbaru di atas. Isinya bukan daftar fitur melainkan daftar kesalahan.

Dua aturan yang merangkum sebagian besarnya:

1. **Kalau sebuah angka bisa diturunkan dari angka lain, turunkan** — jangan
   ditebak.
2. **Satu nilai hanya boleh punya satu pemilik.** Hampir semua cacat tampilan
   di sini lahir dari dua tempat yang menulis hal yang sama, dan yang menang
   adalah yang ditulis belakangan.

Dan satu kebiasaan yang menyelamatkan berkali-kali: **kalau sebuah
pemeriksaan menjawab "aman", tanyakan apakah ia benar-benar bisa gagal.**

#!/usr/bin/env python3
"""
Mencari VN Olen yang belum dipakai di montase — terutama yang TERTAWA.

═══ Kenapa berkas ini ada ═══

Yaya: "Kompilasi olen ketawa juga nggak ada terus beberapa kalimat olen
ngomong juga ada yang hilang bisa nggak di balikin lagi."

Dua sebab, dan keduanya bukan kelalaian memilih:

1. **Bug lama yang sudah tercatat.** `build-voice.py` dulu MEMBACA dan
   MENULIS manifes yang sama. Tiap kali dijalankan ulang, klip yang gagal
   lolos pagar hilang dari daftar sumbernya sendiri — jadi daftar itu
   menyusut sedikit demi sedikit tanpa ada yang menghapusnya. Sudah
   diperbaiki (sumber dan keluaran dipisah), tapi yang sudah terpangkas
   tidak kembali sendiri.

2. **Pagar `goyang` membuang tawa.** Pagar itu dipasang untuk menolak
   rekaman rusak: nada yang melompat lebih dari 1,7× dalam 20 ms. Masalahnya,
   TAWA adalah nada yang melompat-lompat — itu definisinya. Di babak `harian`
   ambangnya 3,5%, dan tawa hampir selalu di atas 8%. Jadi tiap kali Olen
   tertawa, pagar itu membuangnya, dan alasannya tercatat sebagai "nada tidak
   stabil" seolah rekamannya cacat.

   Ini pengulangan pelajaran yang sudah ada di HANDOVER.md soal klip menangis
   dan marah: **emosi memang membuat nada goyang. Yang goyang belum tentu
   rusak.** Waktu itu jawabannya membuat ambang berbeda per babak. Tawa butuh
   perlakuan yang sama.

Skrip ini TIDAK mengubah apa pun. Ia cuma membaca dan melapor, supaya
pemilihan klip dilakukan dengan angka di depan mata, bukan dengan menebak
dari nama berkas.

Jalankan:  python3 scripts/cari-vn.py
"""

import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDUK = os.path.dirname(ROOT)

SUMBER = [
    os.path.join(INDUK, "WhatsApp Chat - My little sister 👧🏻 🤍 WA 2 FILE"),
    os.path.join(INDUK, "Terbaru Olen", "WhatsApp Chat - My little sister 👧🏻 🤍"),
]

OLEN = "My little sister"

# Baris ekspor WhatsApp diawali tanda arah teks yang tak terlihat (U+200E).
# Tanpa dibuang, pola apa pun yang dipatok ke awal baris tidak akan cocok —
# dan yang muncul bukan error melainkan "tidak ada hasil", yang jauh lebih
# lama ketahuannya.
BERSIH = re.compile(r"[‎‏‪-‮]")
BARIS = re.compile(r"^\[(\d{2}/\d{2}/\d{2}), ([\d.]+)\] ([^:]+): (.*)$")
LAMPIR = re.compile(r"<attached: ([^>]+)>")


def baca_percakapan():
    """
    Semua pesan, berurutan, dari kedua folder ekspor.
    Yang dikembalikan: daftar (tanggal, jam, pengirim, isi, berkas|None).
    """
    pesan = []
    for folder in SUMBER:
        f = os.path.join(folder, "_chat.txt")
        if not os.path.exists(f):
            continue
        with open(f, encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                s = BERSIH.sub("", raw).rstrip("\n")
                m = BARIS.match(s)
                if not m:
                    continue
                tgl, jam, siapa, isi = m.groups()
                lam = LAMPIR.search(isi)
                pesan.append(
                    {
                        "tgl": tgl,
                        "jam": jam,
                        "siapa": siapa.strip(),
                        "isi": isi.strip(),
                        "berkas": lam.group(1) if lam else None,
                        "folder": folder,
                    }
                )
    return pesan


def muat(path):
    """opus → mono float32 48 kHz, lewat ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix=".raw", delete=False) as t:
        keluar = t.name
    try:
        subprocess.run(
            ["ffmpeg", "-v", "quiet", "-y", "-i", path, "-ac", "1", "-ar", str(SR),
             "-f", "f32le", keluar],
            check=True,
        )
        x = np.fromfile(keluar, dtype=np.float32)
    finally:
        os.unlink(keluar)
    return x


def amplop(x, win=1024, hop=256):
    """akar-rata-rata-kuadrat per bingkai — bentuk kasar energi suara"""
    n = max(1, 1 + (len(x) - win) // hop)
    e = np.empty(n, dtype=np.float32)
    for i in range(n):
        p = x[i * hop : i * hop + win]
        e[i] = np.sqrt(np.mean(p * p) + 1e-12)
    return e


"""
Nada diukur pada 8 kHz, bukan 48 kHz.

Percobaan pertama memakai `np.correlate(p, p, mode="full")` atas bingkai
2048 sampel pada 48 kHz. Itu O(n²): satu klip sepuluh detik butuh sekitar
tiga setengah miliar operasi, dan mengukur 570 klip diperkirakan lebih dari
satu jam. Dihentikan di klip ke-40.

Nada dasar suara manusia ada di 70–500 Hz. Laju cuplik 8 kHz sudah lebih
dari cukup untuk itu (Nyquist 4 kHz), dan autokorelasi lewat FFT mengubah
O(n²) jadi O(n log n). Dua perubahan itu bersama mempercepatnya ratusan kali,
tanpa kehilangan apa pun yang sedang diukur.
"""
SR_NADA = 8000


def nada(x, lo=70, hi=500):
    """
    Nada dasar per bingkai lewat autokorelasi FFT. 0 kalau bingkai itu tak
    bersuara. Dipakai untuk mengukur seberapa liar nadanya melompat.
    """
    # turunkan laju cuplik dengan mengambil tiap sampel ke-6 (48k → 8k).
    # Cukup untuk nada dasar; harmonik tinggi yang hilang tidak dipakai.
    d = x[::6].astype(np.float64)
    win, hop = 512, 128
    n = max(1, 1 + (len(d) - win) // hop)
    f = np.zeros(n, dtype=np.float32)
    lag_lo, lag_hi = int(SR_NADA / hi), int(SR_NADA / lo)
    nfft = 1 << (2 * win - 1).bit_length()
    jendela = np.hanning(win)
    for i in range(n):
        p = d[i * hop : i * hop + win]
        if len(p) < win or np.sqrt(np.mean(p * p)) < 0.004:
            continue
        p = (p - p.mean()) * jendela
        S = np.fft.rfft(p, nfft)
        ac = np.fft.irfft(S * np.conj(S), nfft)[:win]
        if ac[0] <= 0:
            continue
        seg = ac[lag_lo:lag_hi]
        if len(seg) == 0:
            continue
        k = int(np.argmax(seg)) + lag_lo
        if ac[k] / ac[0] > 0.3:
            f[i] = SR_NADA / k
    return f


def goyang(x):
    """persentase peralihan bingkai yang nadanya melompat lebih dari 1,7×"""
    f = nada(x)
    v = f[f > 0]
    if len(v) < 6:
        return 0.0
    idx = np.where(f > 0)[0]
    lompat = 0
    pasang = 0
    for a, b in zip(idx[:-1], idx[1:]):
        if b - a > 3:
            continue
        pasang += 1
        r = f[b] / f[a]
        if r > 1.7 or r < 1 / 1.7:
            lompat += 1
    return 100.0 * lompat / max(pasang, 1)


def skor_tawa(x):
    """
    Seberapa mirip TAWA, 0–100.

    Tawa punya bentuk yang khas dan bisa diukur, tidak perlu ditebak dari
    konteks percakapan:

      · letupan pendek berulang ("ha-ha-ha"), 3,5–8 kali per detik
      · tiap letupan naik-turun tajam — kedalaman modulasinya besar
      · nadanya melompat-lompat (itu sebabnya pagar `goyang` membuangnya)

    Yang diukur di sini dua yang pertama; `goyang` diukur terpisah supaya
    keduanya bisa dilihat berdampingan. Bicara biasa juga bermodulasi, tapi
    jauh lebih pelan (1–3 Hz) dan lebih dangkal.
    """
    e = amplop(x)
    if len(e) < 40:
        return 0.0
    # buang bagian senyap supaya jeda panjang tidak ikut dihitung
    amb = np.percentile(e, 55)
    hidup = e[e > max(amb, 1e-5)]
    if len(hidup) < 30:
        return 0.0

    # kedalaman modulasi: seberapa jauh energi naik-turun relatif rata-ratanya
    dalam = float(np.std(hidup) / (np.mean(hidup) + 1e-9))

    # Laju modulasi lewat spektrum amplop; hop 256 → 187,5 bingkai per detik.
    #
    # Panjangnya DIBULATKAN ke pangkat dua. Tanpa itu, panjang amplop adalah
    # bilangan sembarang — dan kalau kebetulan bilangan prima yang besar, FFT
    # numpy jatuh ke jalur Bluestein yang lambatnya berlipat-lipat. Skrip ini
    # sempat menggantung bermenit-menit di satu klip persis karena itu, tanpa
    # pesan apa pun; yang terlihat cuma kemajuan yang berhenti.
    n = 1 << max(8, (len(hidup) - 1).bit_length())
    a = hidup - hidup.mean()
    a = np.pad(a, (0, n - len(a))) if len(a) < n else a[:n]
    spek = np.abs(np.fft.rfft(a * np.hanning(len(a))))
    frek = np.fft.rfftfreq(len(a), d=256 / SR)
    pita = (frek >= 3.5) & (frek <= 8.0)
    dasar = (frek >= 0.5) & (frek <= 3.0)
    if not pita.any() or not dasar.any():
        return 0.0
    rasio = float(spek[pita].sum() / (spek[dasar].sum() + 1e-9))

    return float(min(100.0, 55 * min(dalam, 1.4) + 60 * min(rasio, 1.2)))


def main():
    pesan = baca_percakapan()
    if not pesan:
        print("Tidak ada _chat.txt yang terbaca. Periksa jalur di SUMBER.")
        sys.exit(1)

    dipakai = set()
    f = os.path.join(ROOT, "scripts", "voice-sources.json")
    if os.path.exists(f):
        with open(f, encoding="utf-8") as fh:
            dipakai = {k["file"] for k in json.load(fh)}

    # VN dari Olen saja, dan yang berkasnya benar-benar ada
    kandidat = []
    for i, p in enumerate(pesan):
        if not p["berkas"] or "AUDIO" not in p["berkas"]:
            continue
        if OLEN not in p["siapa"]:
            continue
        path = os.path.join(p["folder"], p["berkas"])
        if not os.path.exists(path):
            continue
        # dua pesan sebelum dan sesudah — konteks yang memberi tahu suasana
        sekitar = [
            f'{q["siapa"][:12]}: {q["isi"][:70]}'
            for q in pesan[max(0, i - 2) : i + 3]
            if q is not p and not q["berkas"]
        ]
        kandidat.append({**p, "path": path, "sekitar": sekitar})

    print(f"VN dari Olen: {len(kandidat)}  ·  sudah dipakai: {len(dipakai)}")
    print("Mengukur… (ini butuh beberapa menit)\n")

    hasil = []
    for n, k in enumerate(kandidat):
        if n % 40 == 0:
            print(f"  … {n}/{len(kandidat)}", flush=True)
        try:
            x = muat(k["path"])
        except Exception:
            continue
        if len(x) < SR * 0.7:
            continue
        durasi = len(x) / SR
        # Yang diukur cuma SIDIK JARI klip — cukup dari satu menit pertama.
        # Beberapa VN Olen panjangnya bermenit-menit, dan mengukur seluruhnya
        # tidak membuat angkanya lebih benar, cuma lebih lama.
        x = x[: SR * 60]
        e = amplop(x)
        lantai = float(np.percentile(e, 10))
        suara = float(np.percentile(e, 90))
        snr = 20 * np.log10(suara / max(lantai, 1e-7))
        hasil.append(
            {
                "file": k["berkas"],
                "tgl": k["tgl"],
                "jam": k["jam"],
                "detik": round(durasi, 1),
                "snr": round(float(snr), 1),
                "goyang": round(goyang(x), 1),
                "tawa": round(skor_tawa(x), 1),
                "rms": round(float(np.sqrt(np.mean(x * x))), 4),
                "dipakai": k["berkas"] in dipakai,
                "sekitar": k["sekitar"],
            }
        )

    keluar = os.path.join(ROOT, "scripts", "_kandidat-vn.json")
    with open(keluar, "w", encoding="utf-8") as fh:
        json.dump(hasil, fh, ensure_ascii=False, indent=1)

    baru = [h for h in hasil if not h["dipakai"]]
    tawa = sorted(baru, key=lambda h: -h["tawa"])[:25]

    print(f"\nTerukur: {len(hasil)}  ·  belum dipakai: {len(baru)}")
    print(f"Ditulis ke scripts/_kandidat-vn.json\n")
    print("── PALING MIRIP TAWA (belum dipakai) ──")
    print(f"{'berkas':44} {'dtk':>5} {'SNR':>6} {'goyang':>7} {'tawa':>6}")
    for h in tawa:
        print(f"{h['file']:44} {h['detik']:5.1f} {h['snr']:6.1f} {h['goyang']:6.1f}% {h['tawa']:6.1f}")


if __name__ == "__main__":
    main()

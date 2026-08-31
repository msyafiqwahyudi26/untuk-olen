#!/usr/bin/env python3
"""
Menyaring hasil `cari-vn.py` jadi daftar pendek yang layak didengar.

═══ Kenapa tidak cukup memakai skor akustik saja ═══

`skor_tawa` di `cari-vn.py` jenuh di 100 untuk puluhan klip sekaligus, jadi ia
bisa memberi tahu "ini kelompok yang mirip tawa" tapi tidak bisa mengurutkan
di dalam kelompok itu. Menambah pembobotan sampai angkanya menyebar cuma akan
membuat angkanya terlihat lebih meyakinkan tanpa jadi lebih benar.

Bukti kedua yang jauh lebih murah dan lebih jujur: **kata-kata di sekitar VN
itu.** Kalau Olen menulis "wkwk" atau memasang 😭 tepat sebelum atau sesudah
merekam, itu keterangan suasana yang ditulis Olen sendiri — bukan tebakan
mesin dari bentuk gelombang.

Jadi yang dipakai di sini gabungan keduanya: bentuk bunyi menyaring, konteks
percakapan memberi nama. Klip yang keduanya sepakat naik ke atas.

Jalankan:  python3 scripts/pilih-vn.py
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Penanda suasana, ditulis Olen dan Yaya sendiri di percakapan.
# Sengaja apa adanya — ini bahasa mereka, bukan daftar kata baku.
TANDA = {
    "tawa": r"(wk+|haha|hehe|xixi|😂|🤣|😆|ngakak|lucu|kocak|😹)",
    "bahagia": r"(seneng|senang|happy|yeay|asik|asyik|😍|🥰|😊|🤍|makasih|terima kasih)",
    "sedih": r"(sedih|nangis|😭|😢|:\(|kecewa|hancur|capek banget|gapapa kok|maaf)",
    "sakit": r"(sakit|pusing|demam|meriang|perut|kepala|lemes|gaenak badan|ga enak badan)",
    "marah": r"(kesel|marah|sebel|bete|jengkel|nyebelin|😤|emosi)",
}


def skor_tanda(sekitar, pola):
    teks = " ".join(sekitar).lower()
    return len(re.findall(pola, teks))


def main():
    f = os.path.join(ROOT, "scripts", "_kandidat-vn.json")
    with open(f, encoding="utf-8") as fh:
        semua = json.load(fh)

    baru = [h for h in semua if not h["dipakai"]]

    # Pagar mutu yang sama dengan build-voice.py, supaya yang diusulkan di sini
    # tidak akan dibuang lagi di tahap berikutnya karena berisik. Yang TIDAK
    # dipagari di sini: `goyang`. Justru itu yang sedang dicari.
    layak = [h for h in baru if h["snr"] >= 30 and 1.5 <= h["detik"] <= 90 and h["rms"] >= 0.01]

    print(f"belum dipakai: {len(baru)}  ·  lolos pagar mutu: {len(layak)}\n")

    for nama, pola in TANDA.items():
        pilihan = []
        for h in layak:
            s = skor_tanda(h["sekitar"], pola)
            if s == 0:
                continue
            # tawa dinilai dari bunyinya juga; sisanya cukup dari konteks
            bobot = s * 10 + (h["tawa"] if nama == "tawa" else 0)
            pilihan.append((bobot, h))
        pilihan.sort(key=lambda t: -t[0])

        print(f"── {nama.upper()} ── ({len(pilihan)} kandidat)")
        print(f"{'berkas':44} {'tgl':>9} {'dtk':>5} {'SNR':>6} {'goyang':>7}")
        for bobot, h in pilihan[:12]:
            print(
                f"{h['file']:44} {h['tgl']:>9} {h['detik']:5.1f} "
                f"{h['snr']:6.1f} {h['goyang']:6.1f}%"
            )
        print()


if __name__ == "__main__":
    main()

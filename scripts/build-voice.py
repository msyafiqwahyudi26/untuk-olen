#!/usr/bin/env python3
"""
Menyusun montase suara Olen jadi satu berkas: public/audio/voice-of-olen.*

═══ Riwayat kegagalan — baca sebelum mengubah apa pun ═══

Versi 1. Tiap potongan dinormalkan dengan x * (0.16 / rms) TANPA BATAS.
  VN paling pelan ber-RMS 0.009, jadi dikuatkan 17×. Suaranya terdengar, tapi
  lantai derau opus WhatsApp ikut naik 17× — itulah desis yang terdengar tiap
  beberapa detik. Ditambah np.clip(-1,1) yang memotong puncak jadi distorsi.

Versi 2. Gain diberi pagar, denoise disesuaikan SNR. Desisnya hilang, tapi
  muncul cacat lain di detik 13: hening total 0.5 detik lalu ledakan energi
  0.43 (tiga kali lipat suara normal). Dua sebabnya:
    a. Klip itu cuma 1,6 detik, sedangkan jendela dipatok 3,0 detik. Kode
       mengembalikan seluruh klip apa adanya, jadi slotnya jadi pendek
       sendiri dan iramanya patah.
    b. Jendela dipilih hanya berdasar "bagian paling berenergi". Yang paling
       berenergi sering justru hentakan awal rekaman — suara jari menyentuh
       tombol, bukan suara Olen. Dan karena dipotong sembarang, kalimatnya
       kepotong di tengah kata.

Versi 3 (ini). Yang berubah secara mendasar:
  1. Potongan dipilih dari RENTANG BERSUARA, bukan dari jendela panjang tetap.
     Diam yang lebih pendek dari 0.28 dtk dianggap jeda di dalam kalimat, jadi
     kalimatnya tidak terbelah. Rentang di bawah 1.6 dtk dibuang.
  2. Hentakan di tepi dipangkas; hentakan di tengah ditekan oleh limiter
     ber-amplop, bukan dipotong keras.
  3. Semua potongan diberi durasi sama supaya iramanya rata dan bisa
     menyandingkan diri dengan lagu.
  4. Temponya dipelankan sedikit (atempo, nada tidak berubah).
  5. Ada pemeriksaan otomatis di akhir. Kalau masih ada hentakan atau lubang
     senyap, skrip ini yang memberi tahu — bukan telinga orang.

Jalankan:  python3 scripts/build-voice.py
"""

import json
import os
import subprocess
import sys
import tempfile
import numpy as np

SR = 48000

SLOT = 3.5          # panjang tiap potongan setelah dirapikan, detik
XF = 0.85           # silang antar potongan — saling menimpa, bukan bergantian
JEDA = 0.42         # napas tambahan antar potongan di luar silang
EDGE = 0.20         # naik/turun di ujung tiap potongan
LEAD_IN = 1.8       # fade masuk di awal montase — VN tidak menabrak lagu

# ── Tempo per BABAK ──
# Yaya: "pas bagian depan di bikin lebih slow terus standar, pas bagian sedih
# slow lagi, terakhir standar lagi." Ini bukan sekadar selera — kecepatan
# bicara itu yang menentukan apakah sebuah kalimat terasa diberi ruang atau
# diburu-buru. Bagian pembuka dan bagian sedih perlu ruang.
#
# `maks` = panjang rentang bersuara terpanjang yang boleh diambil dari satu
# klip. Klip pembuka dan penutup sengaja diberi jatah panjang supaya punya
# cukup bahan untuk fade masuk dan fade keluar. Yaya: "di bagian akhir masih
# agak gantung, coba cari VN yang agak panjang di akhir biar bisa di fade out".
# `goyang` = batas ketidakstabilan nada yang masih boleh lolos, dalam persen.
#
# Ini pagar terpenting yang dulu tidak ada. Yaya: "banyak audio yang rusak
# dalam artian rusak suaranya tb tb tinggi dan noise isinya bukan kalimat".
# Setelah diukur, ketidakstabilan itu ADA DI KLIP SUMBERNYA — bukan dibuat
# oleh pengolahan di sini. Klip pembuka lama goyang 22% sejak mentah; yang
# bersih cuma 0–2%.
#
# Tapi ambangnya TIDAK boleh sama untuk semua babak. Orang menangis, marah,
# atau bicara sambil menahan sakit memang nadanya melompat-lompat — itu bunyi
# emosinya, bukan cacat rekaman. Kalau ambang ketat dipakai di babak sedih,
# yang tersisa cuma Olen yang tenang, dan justru bagian paling penting hilang.
BABAK = {
    "pembuka": {"laju": 0.94, "slot": 3.8, "maks": 5.0, "goyang": 3.5},
    "harian":  {"laju": 1.00, "slot": 3.6, "maks": 4.8, "goyang": 3.5},
    "keluh":   {"laju": 0.97, "slot": 3.8, "maks": 5.2, "goyang": 9.0},
    "sedih":   {"laju": 0.93, "slot": 4.0, "maks": 5.4, "goyang": 8.0},
    "pulih":   {"laju": 1.00, "slot": 3.5, "maks": 4.8, "goyang": 4.5},
    "penutup": {"laju": 0.95, "slot": 7.5, "maks": 8.5, "goyang": 3.5},
}

# ── Ambang kestabilan nada per SUASANA ──
#
# Ambang per babak di atas ternyata belum cukup, dan cara ketahuannya mahal:
# Yaya bilang "kompilasi olen ketawa juga nggak ada". Setelah 570 VN Olen
# diukur ulang (`scripts/cari-vn.py`), sebabnya kelihatan — **tawa adalah
# nada yang melompat-lompat. Itu definisinya.** Klip tawa Olen bergoyang
# 5–16%, sedangkan ambang babak `harian` 3,5% dan `pulih` 4,5%. Jadi tiap
# kali Olen tertawa, pagar ini membuangnya dan mencatat alasannya sebagai
# "nada tidak stabil", seolah rekamannya rusak.
#
# Ini pengulangan pelajaran yang SUDAH ada di berkas ini soal menangis dan
# marah. Waktu itu jawabannya membuat ambang berbeda per babak. Yang
# terlewat: suasana tidak selalu sejalan dengan babak — Olen tertawa di
# babak `harian` dan `pulih`, dua babak yang ambangnya justru paling ketat.
#
# Jadi ambangnya sekarang diambil yang paling longgar antara babak dan
# suasana. Pagar ini tetap ada gunanya: ia masih membuang rekaman yang
# benar-benar rusak, yang bergoyang di atas 20%. Yang berubah cuma satu hal —
# **klip tidak lagi dibuang karena Olen sedang merasakan sesuatu.**
GOYANG_SUASANA = {
    "tawa": 20.0,
    "nangis": 16.0,
    "marah": 16.0,
    # 13,0 sempat dipakai dan menolak satu klip di angka 13% tepat — di garis
    # batas, bukan karena rusak. Ambang yang menolak tepat di titik ukurnya
    # sendiri terlalu ketat untuk dipercaya.
    "sakit": 15.0,
    "sedih": 12.0,
    # Bahagia bukan `ringan`. Orang yang sedang senang bicaranya naik-turun
    # jauh lebih lebar daripada orang yang sedang bercerita biasa — satu klip
    # ditolak di 5% oleh ambang babak `pulih` yang 4,5%.
    "bahagia": 9.0,
}

# Tawa dipotong lebih pendek daripada kalimat.
#
# Kalimat butuh ruang untuk selesai; tawa tidak — tawa yang diberi slot 3,5
# detik akan berisi satu letupan lalu ekor yang memudar, dan yang terdengar
# jadi orang yang berhenti tertawa. Slot pendek membuat letupannya saling
# menyusul, dan ITU yang terdengar seperti kompilasi tawa.
SLOT_SUASANA = {"tawa": 2.9}

# Batas atas untuk klip bertanda `"utuh": true`. Cukup panjang untuk memuat
# satu kalimat penuh yang diucapkan pelan, tapi tetap ada batasnya — VN Olen
# ada yang lebih dari satu menit, dan satu menit tanpa jeda di tengah montase
# akan menenggelamkan sisanya.
UTUH_MAKS = 16.0

# Potongan PERTAMA di babak pembuka lebih panjang, supaya suaranya bisa muncul
# pelan-pelan dari kesunyian alih-alih langsung ada.
SLOT_PEMBUKA_PERTAMA = 6.5

# MIN_RUN sempat 1.6 dtk dan membuang sembilan dari dua puluh satu klip —
# VN WhatsApp memang banyak yang pendek. Diturunkan lagi ke 0.88 karena klip
# tawa yang paling hidup justru yang paling pendek (1,8–2,0 dtk), dan itu
# persis bahan untuk tumpukan tawa di penutup.
MIN_RUN = 0.88
MAX_RUN = 5.0       # lebih panjang dari ini dipotong di jeda dalam kalimat
GAP = 0.36          # diam sependek ini masih dianggap bagian dari kalimat

TARGET_RMS = 0.13
GAIN_MAX = 3.5
# Yaya masih mendengar sisa derau pada klip yang "cuma diredam":
#   "kalo bisa di hilangkan atau ya di redam tapi lebih baik nggak usah di
#    masukin yang cuman suara nggak jelas"
# Jadi ambangnya dinaikkan tajam. Klip berisik sekarang DIBUANG, bukan
# diselamatkan dengan denoise berat — denoise berat sendiri meninggalkan
# jejak "berkecipak" yang juga terdengar.
NOISE_MAX = 0.0035  # lantai derau tertinggi yang boleh lolos setelah gain
SNR_MIN = 26.0
BURST = 3.2         # energi sekian kali median = hentakan, bukan suara

# CEIL sempat 0.89. Setelah atempo (yang me-resample) dan encoder AAC (yang
# punya puncak antar-sampel), berkas jadinya berpuncak 1.17 — menabrak batas
# dan pecah di dekoder. Ruang kepala 3 dB ini yang menahannya.
CEIL = 0.72

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(HERE)
SRC_DIRS = [
    os.path.join(ROOT, "WhatsApp Chat - My little sister 👧🏻 🤍 WA 2 FILE"),
    os.path.join(ROOT, "Terbaru Olen", "WhatsApp Chat - My little sister 👧🏻 🤍"),
]
OUT = os.path.join(HERE, "public", "audio")
HOP = SR // 100     # 10 ms


def locate(name):
    for d in SRC_DIRS:
        p = os.path.join(d, name)
        if os.path.isfile(p):
            return p
    return None


def decode(path, af=""):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR)]
    if af:
        cmd += ["-af", af]
    cmd += ["-f", "f32le", "-"]
    r = subprocess.run(cmd, capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)


def envelope(x):
    """RMS tiap 10 ms — dasar semua keputusan di bawah."""
    if len(x) < HOP:
        return np.array([1e-9])
    f = x[: len(x) // HOP * HOP].reshape(-1, HOP)
    return np.sqrt((f ** 2).mean(1)) + 1e-9


def measure(x):
    e = envelope(x)
    voiced = e[e > np.percentile(e, 55)]
    voice = float(np.median(voiced)) if len(voiced) else float(np.percentile(e, 90))
    floor = float(np.percentile(e, 10))
    return voice, floor, 20 * np.log10(voice / max(floor, 1e-9))


def voiced_runs(x):
    """
    Rentang di mana Olen benar-benar bicara.

    Ambangnya diambil dari lantai derau klip itu sendiri, bukan angka mati —
    tiap VN direkam di tempat berbeda. Jeda pendek disambung supaya satu
    kalimat tidak terpecah jadi beberapa potongan.
    """
    e = envelope(x)
    floor = np.percentile(e, 15)
    peak = np.percentile(e, 95)
    thr = max(floor * 3.5, peak * 0.13)

    on = e > thr
    runs, start = [], None
    gap = int(GAP * 100)
    silent = 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            silent = 0
        elif start is not None:
            silent += 1
            if silent > gap:
                runs.append((start, i - silent))
                start = None
    if start is not None:
        runs.append((start, len(on)))
    return [(a, b) for a, b in runs if b > a], e


def nada(seg):
    """Nada dasar satu bingkai lewat autokorelasi. 0 kalau tidak bersuara."""
    seg = seg - seg.mean()
    if np.sqrt((seg ** 2).mean()) < 0.01:
        return 0.0
    c = np.correlate(seg, seg, "full")[len(seg) - 1 :]
    lo, hi = SR // 400, SR // 70          # 70–400 Hz, rentang suara manusia
    if hi >= len(c):
        return 0.0
    k = lo + int(np.argmax(c[lo:hi]))
    return SR / k if k else 0.0


def goyang(x):
    """
    Seberapa sering nada MELOMPAT mendadak, dalam persen bingkai bersuara.

    Ini ukuran yang paling langsung menjawab keluhan "suaranya tb tb tinggi".
    Suara manusia yang sehat bergerak mulus; lompatan lebih dari 1,7 kali
    dalam 20 milidetik berarti ada yang lain di rekaman itu — suara kedua,
    musik latar, atau cacat codec.

    Diukur pada rentang yang BENAR-BENAR dipakai, bukan seluruh klip: bagian
    yang dibuang tidak perlu ikut dinilai.
    """
    W = SR // 50
    if len(x) < W * 8:
        return 100.0
    nn = np.array([nada(x[i * W : (i + 1) * W]) for i in range(len(x) // W)])
    hidup = int((nn > 0).sum())
    if hidup < 8:
        return 100.0
    lompat = sum(
        1
        for i in range(1, len(nn))
        if nn[i] > 0 and nn[i - 1] > 0 and (nn[i] / nn[i - 1] > 1.7 or nn[i] / nn[i - 1] < 0.58)
    )
    return lompat / hidup * 100.0


def squeeze_gaps(x, maks=0.45, sisa=0.26):
    """
    Memangkas keheningan DI DALAM satu potongan.

    Olen sering berhenti berpikir di tengah kalimat. Jeda itu manusiawi, tapi
    jeda 1,5 detik di tengah montase terdengar seperti berkasnya macet — dan
    kalau potongannya dipotong sebelum jeda, kalimatnya jadi tidak selesai.
    Jadi jedanya tidak dibuang, cuma dipendekkan: yang lebih panjang dari
    `maks` disusutkan jadi `sisa`, dengan silang halus di sambungannya supaya
    tidak berbunyi klik.

    Yaya: "yang kosong-kosong nggak ada suaranya jedanya itu di potong-potong
    atau di isi".
    """
    e = envelope(x)
    if len(e) < 20:
        return x
    floor = np.percentile(e, 15)
    diam = e < max(floor * 3.0, np.percentile(e, 95) * 0.09)

    potong = []
    run = 0
    for i, q in enumerate(diam):
        if q:
            run += 1
        else:
            if run > maks * 100:
                potong.append((i - run, i))
            run = 0
    if run > maks * 100:
        potong.append((len(diam) - run, len(diam)))
    if not potong:
        return x

    xf = int(0.06 * SR)  # silang 60 ms di tiap sambungan
    keep, pos = [], 0
    for a, b in potong:
        tengah = (a + b) // 2
        half = int(sisa * 50)                       # separuh jeda yang disisakan
        akhir = max(pos, (tengah - half)) * HOP
        mulai = min(len(diam), tengah + half) * HOP
        if akhir > pos * HOP:
            keep.append(x[pos * HOP : akhir])
        pos = mulai // HOP
    keep.append(x[pos * HOP :])

    out = keep[0]
    for seg in keep[1:]:
        if len(out) < xf or len(seg) < xf:
            out = np.concatenate([out, seg])
            continue
        a = np.linspace(0, np.pi / 2, xf)
        out = np.concatenate(
            [out[:-xf], out[-xf:] * np.cos(a) + seg[:xf] * np.sin(a), seg[xf:]]
        )
    return out


def pick_run(x, maks=MAX_RUN):
    """Rentang terbaik: cukup panjang, isinya padat, dan tidak dipotong di
    tengah kata. Kalau kepanjangan, dipotong di jeda terdalam di dalamnya."""
    runs, e = voiced_runs(x)
    best, score_best = None, -1.0
    for a, b in runs:
        dur = (b - a) / 100.0
        if dur < MIN_RUN:
            continue
        if dur > maks:
            # cari lembah paling dalam di dekat batas
            lo = a + int(MIN_RUN * 100)
            hi = min(b, a + int(maks * 100))
            if hi > lo:
                b = lo + int(np.argmin(e[lo:hi]))
                dur = (b - a) / 100.0
        # potongan panjang diberi nilai lebih tinggi — untuk babak pembuka dan
        # penutup, panjang justru yang dicari
        score = float(np.median(e[a:b])) * min(1.4, dur / 2.2)
        if score > score_best:
            score_best, best = score, (a, b)
    if best is None:
        return None
    a, b = best

    # buang hentakan di tepi: kalau bingkai tepi jauh lebih keras daripada
    # median, itu bunyi jari/tombol, bukan suara
    med = float(np.median(e[a:b]))
    while b - a > MIN_RUN * 100 and e[a] > med * BURST:
        a += 1
    while b - a > MIN_RUN * 100 and e[b - 1] > med * BURST:
        b -= 1
    return a * HOP, b * HOP


def fit_slot(x, s, e, slot=SLOT):
    """
    Semua potongan dibuat sepanjang SLOT.

    Kalau rentang bersuaranya lebih pendek, jendelanya dilebarkan ke suara di
    sekitarnya (bukan ditambal senyap — senyap di tengah montase justru
    terdengar seperti kerusakan). Kalau klipnya sendiri lebih pendek dari
    SLOT, sisanya baru diisi hening lembut di ujung, bukan di tengah.
    """
    want = int(slot * SR)
    have = e - s
    if have >= want:
        # ── Dipangkas dari BELAKANG saja, tidak pernah dari depan ──
        #
        # Versi sebelumnya memusatkan jendela: `s + extra//2`. Artinya kalimat
        # yang lebih panjang daripada slot kehilangan kata-kata PEMBUKANYA.
        # Yaya: "beberapa bagian yang dia ngomong blm selesai itu kepotong di
        # awal".
        #
        # Kalimat yang mulai utuh lalu mengabur di ujung masih terdengar
        # seperti kalimat. Kalimat yang mulai di tengah kata terdengar seperti
        # berkas rusak — dan yang hilang justru bagian yang membawa maksudnya,
        # karena orang menaruh pokok kalimat di depan.
        #
        # Kalau sebuah kalimat memang harus utuh seluruhnya, tandai klipnya
        # dengan `"utuh": true` di voice-sources.json; slotnya akan mengikuti
        # panjang kalimatnya, bukan sebaliknya.
        return x[s : s + want]

    need = want - have
    left = min(s, need // 2)
    right = min(len(x) - e, need - left)
    left = min(s, need - right)
    seg = x[s - left : e + right]

    # Kalau pelebaran tadi justru menyeret senyap panjang ke dalam potongan,
    # lebih baik potongannya memang lebih pendek. Senyap 0.5 detik di tengah
    # montase terdengar seperti berkasnya rusak, bukan seperti jeda.
    env = envelope(seg)
    if len(env) > 10:
        med = float(np.median(env[env > np.percentile(env, 55)]))
        run = 0
        for v in env < med * 0.03:
            run = run + 1 if v else 0
            if run > 50:  # 0.5 dtk
                pad = int(0.15 * SR)
                return x[max(0, s - pad) : min(len(x), e + pad)]
    return seg


def tame_bursts(x):
    """
    Limiter ber-amplop. Menekan hentakan yang tersisa dengan naik-turun halus
    — bukan np.clip, yang justru MEMBUAT sudut tajam dan berbunyi keresek.
    """
    e = envelope(x)
    med = float(np.median(e[e > np.percentile(e, 55)])) if len(e) > 4 else float(np.mean(e))
    thr = max(med * BURST, 1e-4)
    gain = np.minimum(1.0, thr / np.maximum(e, 1e-9))

    # haluskan amplop gain: serang cepat, lepas pelan
    g = np.ones_like(gain)
    a_att, a_rel = 0.35, 0.03
    cur = 1.0
    for i, v in enumerate(gain):
        cur += (v - cur) * (a_att if v < cur else a_rel)
        g[i] = cur
    # kembalikan ke laju sampel
    full = np.interp(np.arange(len(x)), np.arange(len(g)) * HOP + HOP / 2, g,
                     left=g[0], right=g[-1])
    return x * full


def shape(x):
    """Naik/turun halus di ujung — raised-cosine, turunannya nol di tepi."""
    f = min(int(EDGE * SR), len(x) // 2)
    if f > 0:
        r = np.linspace(0, np.pi, f)
        up = (1 - np.cos(r)) / 2
        x = x.copy()
        x[:f] *= up
        x[-f:] *= up[::-1]
    return x


def find_transients(x):
    """
    SATU definisi hentakan, dipakai oleh pemulih maupun pemeriksa.

    Sebelumnya keduanya punya rumus sendiri-sendiri dengan ambang berbeda,
    jadi pemeriksa melaporkan tiga titik yang tidak pernah disentuh pemulih —
    laporan dan perbaikan bicara tentang hal yang berbeda.

    Dasarnya satu fakta: suara manusia tidak pernah mencapai puncaknya dalam
    kurang dari 4 milidetik — pita suara dan rongga mulut punya kelembaman.
    Apa pun yang naik secepat itu adalah benturan mikrofon, sambungan berkas,
    atau cacat codec.

    Mengembalikan daftar (indeks bingkai 10 ms, kekuatan, tingkat setempat).
    """
    e = envelope(x)
    if len(e) < 30:
        return [], e, e
    win = 120
    pad = np.pad(e, (win, win), mode="edge")
    local = np.maximum(
        np.convolve(pad, np.ones(win * 2 + 1) / (win * 2 + 1), mode="valid")[: len(e)], 1e-6
    )
    ms = np.abs(x[: len(x) // 48 * 48].reshape(-1, 48)).max(1)

    out = []
    for i in range(3, len(e)):
        if e[i] <= local[i] * BURST or e[i] <= e[i - 3] * 12:
            continue
        j = i * 10
        w = ms[max(0, j - 20) : j + 20]
        if len(w) < 8:
            continue
        top, base = float(w.max()), float(np.percentile(w, 10))
        lo = int(np.argmax(w > base + 0.1 * (top - base)))
        hi = int(np.argmax(w > base + 0.9 * (top - base)))
        if hi - lo <= 4:
            out.append((i, float(e[i]), float(local[i])))
    return out, e, local


def repair_transients(x):
    """
    Menekan hentakan lewat lekukan gain halus selama 30 ms.

    Yang ditekan gain di sekitarnya, bukan sampelnya. Memotong sampel justru
    menciptakan sudut baru — dan sudut baru itu bunyinya juga keresek.
    """
    hits, _, _ = find_transients(x)
    if not hits:
        return x
    gain = np.ones(len(x) // HOP + 2)
    for i, val, loc in hits:
        want = min(1.0, loc * 1.8 / max(val, 1e-9))
        a, b = max(0, i - 3), min(len(gain), i + 4)
        dip = 1 - (1 - want) * (1 + np.cos(np.linspace(-np.pi, np.pi, b - a))) / 2
        gain[a:b] = np.minimum(gain[a:b], dip)
    full = np.interp(np.arange(len(x)), np.arange(len(gain)) * HOP + HOP / 2, gain,
                     left=gain[0], right=gain[-1])
    return x * full


def stretch(x, laju):
    """
    Melarkan/memampatkan satu potongan tanpa mengubah nadanya.

    Dilakukan PER POTONGAN, bukan sekali di akhir, supaya tiap babak bisa
    punya kecepatannya sendiri. atempo di bawah 0.5 pecah, tapi rentang yang
    dipakai di sini (0.84–1.0) jauh dari batas itu.
    """
    if abs(laju - 1.0) < 0.005:
        return x
    tmp = os.path.join(tempfile.gettempdir(), "_seg.f32")
    x.astype(np.float32).tofile(tmp)
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
         "-af", f"atempo={laju}", "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    os.remove(tmp)
    return np.frombuffer(r, dtype=np.float32).astype(np.float64)


def limit(x, ceil):
    """
    Limiter BERPANDANGAN KE DEPAN.

    Versi pertama cuma menghaluskan gain ke depan, jadi waktu puncak datang
    gainnya belum sempat turun — puncaknya lolos ke 1.04 padahal batasnya
    0.72. Kuncinya: ambil gain terkecil dari beberapa blok BERIKUTNYA dulu,
    baru dihaluskan. Dengan begitu gain sudah rendah sebelum puncaknya tiba,
    dan turunnya tetap mulus jadi tidak berbunyi klik.
    """
    win = 240  # 5 ms
    n = len(x) // win + 1
    pad = np.pad(np.abs(x), (0, n * win - len(x)), mode="constant")
    env = np.maximum(pad.reshape(n, win).max(1), 1e-9)
    g = np.minimum(1.0, ceil / env)

    # pandangan ke depan 4 blok (20 ms)
    look = 4
    g = np.array([g[i : i + look + 1].min() for i in range(len(g))])

    # haluskan: turun boleh cepat, naik harus pelan
    cur = 1.0
    for i, v in enumerate(g):
        cur += (v - cur) * (0.6 if v < cur else 0.02)
        g[i] = min(cur, v)

    full = np.interp(np.arange(len(x)), np.arange(len(g)) * win + win / 2, g,
                     left=g[0], right=g[-1])
    return x * full


def level_ride(x):
    """
    Penyamaan kenyaringan yang bergerak lambat.

    Tiap VN direkam dengan jarak mulut berbeda, jadi antar potongan bisa
    terpaut 10 dB. Menyamakannya di tiap potongan saja tidak cukup karena
    kenyaringan juga berubah DI DALAM satu potongan. Amplopnya sengaja
    dibuat lamban (1.5 dtk) supaya tidak memompa, dan dibatasi ±5 dB supaya
    tidak menaikkan derau waktu Olen sedang diam.
    """
    e = envelope(x)
    win = 150  # 1.5 detik
    pad = np.pad(e, (win, win), mode="edge")
    smooth = np.convolve(pad, np.ones(win * 2 + 1) / (win * 2 + 1), mode="valid")[: len(e)]
    med = float(np.median(e[e > np.percentile(e, 55)]))
    want = np.clip(med / np.maximum(smooth, 1e-6), 10 ** (-5 / 20), 10 ** (5 / 20))
    # jangan menguatkan bagian yang memang sedang senyap
    want = np.where(smooth < med * 0.25, 1.0, want)
    full = np.interp(np.arange(len(x)), np.arange(len(want)) * HOP + HOP / 2, want,
                     left=want[0], right=want[-1])
    return x * full


JEDA_MAKS = 0.30


def rapikan_jeda(x, maks=JEDA_MAKS):
    """
    Memendekkan jeda yang terlalu panjang SESUDAH semuanya disambung.

    ── Kenapa tidak cukup mengecilkan JEDA saja ──

    `JEDA` mengatur jarak yang SENGAJA dipasang antar potongan. Tapi jeda yang
    benar-benar terdengar bukan cuma itu: tiap potongan juga membawa sisa
    hening di kedua ujungnya — dari `fit_slot` yang melebarkan jendela waktu
    kalimatnya lebih pendek daripada slot, dan dari `EDGE` yang menurunkan
    volumenya di ujung. Ketiganya bertumpuk.

    Yaya: "beberapa jedanya masih terlalu ada yang jauh gitu". Diukur pada
    hasilnya: 35 jeda di atas 0,2 detik, yang terpanjang 0,56 detik — dua kali
    lipat yang dimaksudkan. Mengecilkan `JEDA` tidak akan menyentuh dua sumber
    lainnya, dan menebak nilai baru sampai kedengarannya pas adalah persis
    cara kerja yang dilarang di proyek ini.

    Jadi yang diukur dan dipotong adalah HASILNYA, bukan salah satu bahannya:
    tiap keheningan yang lebih panjang dari `maks` dipendekkan jadi `maks`.
    Jeda yang sudah wajar tidak disentuh sama sekali.

    Sambungannya disilangkan 12 ms. Memotong begitu saja di tengah keheningan
    pun bisa berbunyi 'tik', karena lantai derau di kedua sisi tidak pernah
    persis sama tingginya.
    """
    e = envelope(x)
    if len(e) < 50:
        return x, []
    med = float(np.median(e[e > np.percentile(e, 55)]))
    amb = med * 0.06
    batas = int(maks * 100)          # envelope 100 bingkai/detik
    xf = int(0.012 * SR)

    potong = []                      # (mulai, selesai) dalam sampel
    run = 0
    for i, sepi in enumerate(e < amb):
        if sepi:
            run += 1
            continue
        if run > batas:
            # sisakan `batas` bingkai, buang selebihnya dari TENGAH jeda —
            # supaya ekor kalimat sebelumnya dan napas sebelum kalimat
            # berikutnya sama-sama utuh
            lebih = run - batas
            tengah = i - run // 2
            potong.append(((tengah - lebih // 2) * HOP, (tengah + (lebih - lebih // 2)) * HOP))
        run = 0

    if not potong:
        return x, []

    bagian = []
    lalu = 0
    for a, b in potong:
        a, b = max(0, a), min(len(x), b)
        if b - a < xf * 2:
            continue
        bagian.append(x[lalu:a])
        lalu = b
    bagian.append(x[lalu:])

    hasil = bagian[0]
    for seg in bagian[1:]:
        if len(hasil) < xf or len(seg) < xf:
            hasil = np.concatenate([hasil, seg])
            continue
        naik = np.linspace(0, 1, xf, dtype=np.float32)
        sambung = hasil[-xf:] * (1 - naik) + seg[:xf] * naik
        hasil = np.concatenate([hasil[:-xf], sambung, seg[xf:]])

    # Daftar potongan dikembalikan supaya waktu di manifes bisa DIPETAKAN
    # ULANG. Kalau tidak, `voice-of-olen.json` tetap memakai waktu sebelum
    # jedanya dipendekkan — dan peta yang meleset beberapa detik lebih buruk
    # daripada tidak ada peta, karena orang percaya padanya.
    return hasil, potong


def audit(x):
    """
    Pemeriksaan akhir. Yang selama ini lolos ke telinga Yaya, di sini harus
    lolos ke laporan dulu.

    Ambangnya dibandingkan dengan median SETEMPAT, bukan median seluruh
    berkas. Dengan median global, potongan yang memang wajar-wajar keras
    ikut tertuduh sebagai hentakan — versi sebelumnya menandai detik 26.4
    dan 28.5 padahal di sana Olen cuma sedang bicara lebih lantang.
    """
    problems = []
    hits, e, _ = find_transients(x)

    # ── Hentakan yang BERSUARA bukan cacat ──
    #
    # `find_transients` bersandar pada satu fakta: suara manusia tidak
    # mencapai puncaknya dalam kurang dari 4 milidetik. Itu benar untuk
    # kalimat. Ternyata tidak benar untuk TAWA: satu letupan "ha!" sesudah
    # jeda naik hampir secepat benturan mikrofon.
    #
    # Ketahuannya sesudah klip tawa ditambahkan — pemeriksa melaporkan
    # hentakan di detik 138,8, dan setelah dibongkar, di situ Olen sedang
    # tertawa. Persis kelas kesalahan yang sama dengan pagar `goyang` di
    # atas: alat yang dibuat untuk menangkap cacat menuduh emosi.
    #
    # Pembedanya bisa diukur, tidak perlu ditebak: benturan mikrofon,
    # sambungan berkas, dan cacat codec TIDAK punya nada dasar. Suara punya.
    # Jadi tiap hentakan diperiksa 150 ms sesudahnya — kalau di situ ada nada
    # yang terbaca, itu Olen, dan dibiarkan.
    #
    # Ini penting bukan karena laporannya jelek dilihat, tapi karena
    # peringatan palsu yang muncul terus membuat peringatan SUNGGUHAN jadi
    # tidak terlihat. Alasan yang sama dengan suppressHydrationWarning di
    # layout.tsx.
    # `nada()` mengambil SATU bingkai dan mengembalikan satu angka, jadi
    # bingkainya dibuat di sini: 150 ms sesudah hentakan, dibagi jendela
    # 2048 sampel. Bersuara kalau setidaknya sepertiga bingkainya punya nada.
    WIN, LANGKAH = 2048, 512
    keras, bersuara = [], []
    for i, _, _ in hits:
        j = i * HOP
        w = x[j : j + int(0.15 * SR)]
        n = max(0, 1 + (len(w) - WIN) // LANGKAH)
        ada = sum(1 for b in range(n) if nada(w[b * LANGKAH : b * LANGKAH + WIN]) > 0)
        (bersuara if n and ada >= max(1, n // 3) else keras).append(i)

    if keras:
        problems.append(f"hentakan di detik {sorted({round(i / 100, 1) for i in keras})[:8]}")
    if bersuara:
        print(
            f"  (catatan: {len(bersuara)} letupan bersuara dilewati — itu tawa Olen, "
            f"bukan cacat: detik {sorted({round(i / 100, 1) for i in bersuara})[:6]})"
        )

    # lubang senyap di tengah montase
    # Ambangnya harus lebih panjang daripada JEDA + dua ujung fade, karena
    # jeda antar potongan memang DISENGAJA. Kalau tidak, pemeriksa melaporkan
    # setiap napas yang justru diminta Yaya sebagai kerusakan.
    med = float(np.median(e[e > np.percentile(e, 55)]))
    batas = int((JEDA + 2 * EDGE + 0.35) * 100)
    run, holes = 0, []
    for i, q in enumerate(e < med * 0.02):
        run = run + 1 if q else 0
        if run == batas:
            holes.append(round((i - batas) / 100, 1))
    if holes:
        problems.append(f"lubang senyap di detik {holes[:8]}")

    # Klik sejati: satu lompatan besar yang langsung balik lagi. Desis "s"
    # dan "t" juga melompat, tapi tidak berbalik dalam satu sampel.
    d = np.diff(x)
    clicks = np.where((np.abs(d[:-1]) > 0.32) & (np.sign(d[:-1]) != np.sign(d[1:]))
                      & (np.abs(d[1:]) > 0.32))[0]
    if len(clicks) > 8:
        problems.append(f"{len(clicks)} klik di detik {sorted(set((clicks / SR).round(1)))[:6]}")

    if float(np.max(np.abs(x))) > 0.97:
        problems.append("puncak terlalu dekat batas")
    return problems


def main():
    # Daftar sumber dibaca dari scripts/voice-sources.json dan TIDAK PERNAH
    # ditulisi. Dulu skrip ini membaca dan menulis berkas yang sama di
    # public/audio, jadi tiap kali dijalankan ulang klip yang dilewati hilang
    # dari daftar — jalan tiga kali, tinggal separuhnya, dan urutan suasana
    # hatinya rusak tanpa ada yang sadar.
    man = json.load(open(os.path.join(HERE, "scripts", "voice-sources.json"), encoding="utf-8"))
    segs, penutup, kept, dropped, terpotong = [], [], [], [], []

    for m in man:
        path = locate(m["file"])
        if not path:
            dropped.append((m["file"], "berkas tidak ketemu"))
            continue

        raw = decode(path)
        if len(raw) < int(1.2 * SR):
            dropped.append((m["file"], f"cuma {len(raw)/SR:.1f} dtk"))
            continue

        _, raw_floor, snr = measure(raw)

        # DUA peran berbeda untuk angka SNR, yang dulu tercampur jadi satu:
        #
        #   snr        — mutu sebenarnya. Ini yang menentukan klip diterima
        #                atau dibuang.
        #   snr_saring — dipakai hanya untuk memilih sekuat apa denoise-nya.
        #                Klip yang direkam di tempat ramai bisa ber-SNR bagus
        #                tapi lantai deraunya tinggi secara mutlak, jadi tetap
        #                butuh saringan kuat.
        #
        # Waktu keduanya satu angka, VN Olen menangis (SNR 36 dB, lantai derau
        # 0.0025) ikut ditolak karena angkanya sudah terlanjur dipangkas ke 24
        # demi memilih saringan. Padahal justru VN itu yang diminta.
        snr_saring = min(snr, 24.0) if raw_floor > 0.002 else snr
        if snr < SNR_MIN:
            dropped.append((m["file"], f"terlalu berisik ({snr:.0f} dB)"))
            continue

        # adeclip ditambahkan: beberapa VN direkam terlalu dekat mulut dan
        # puncaknya sudah rata sejak dari WhatsApp
        if snr_saring > 35:
            af = "highpass=f=85,adeclick,adeclip,afftdn=nr=6:nf=-38"
        elif snr_saring > 25:
            af = "highpass=f=90,adeclick,adeclip,afftdn=nr=14:nf=-34:nt=w"
        else:
            af = "highpass=f=100,adeclick,adeclip,afftdn=nr=28:nf=-30:nt=w:tn=1"
        x = decode(path, af)
        if len(x) < int(1.2 * SR):
            x = raw

        nama_babak = m.get("babak", "harian")
        babak = BABAK.get(nama_babak, BABAK["harian"])
        # potongan pertama di babak pembuka diberi jatah lebih panjang
        pertama_pembuka = nama_babak == "pembuka" and not any(
            k[3] == "pembuka" for k in kept
        )
        suasana = m.get("mood", "ringan")
        if pertama_pembuka:
            slot = SLOT_PEMBUKA_PERTAMA
        else:
            slot = SLOT_SUASANA.get(suasana, babak["slot"])

        # ── Klip yang ditandai `"utuh": true` ──
        #
        # Beberapa kalimat tidak boleh dipotong sama sekali. Yang Yaya sebut:
        # momen Olen mengafirmasi dirinya sendiri. Kalimat seperti itu kehilangan
        # seluruh maksudnya kalau berhenti di tengah — dan tidak ada slot yang
        # cukup panjang untuk semuanya tanpa membuat sisa montase terasa lamban.
        #
        # Jadi slotnya yang mengikuti kalimatnya, bukan sebaliknya: klip `utuh`
        # boleh mengambil rentang bersuara sepanjang apa pun sampai UTUH_MAKS,
        # dan panjang potongannya ditetapkan SESUDAH rentangnya diketahui.
        utuh = bool(m.get("utuh"))
        maks = UTUH_MAKS if utuh else max(babak["maks"], slot + 1.0)

        # Lantai derau diukur SEBELUM jeda dipangkas.
        #
        # `measure` mengambil persentil ke-10 amplop sebagai lantai derau —
        # yang benar hanya selama klipnya masih punya keheningan. Sesudah
        # squeeze_gaps, hampir seluruh potongan berisi suara, jadi persentil
        # ke-10 jatuh di suara pelan, bukan di derau. Angkanya melonjak
        # sepuluh kali lipat dan gerbang derau membuang klip yang sebenarnya
        # paling bersih — termasuk VN penutup yang justru dicari.
        _, floor_asli, _ = measure(x)

        # Jeda panjang di dalam klip dipangkas SESUDAH itu, sebelum rentang
        # bersuara dicari. Kalau tidak, satu jeda 1,5 detik memecah satu
        # kalimat jadi dua rentang pendek dan keduanya kalah oleh potongan lain.
        x = squeeze_gaps(x)

        picked = pick_run(x, maks)
        if picked is None:
            dropped.append((m["file"], "tidak ada kalimat utuh yang cukup panjang"))
            continue

        # Gerbang kestabilan nada — diukur pada rentang yang benar-benar
        # dipakai. Ambangnya beda per babak: bagian sedih memang goyang, dan
        # itu memang bunyi emosinya.
        # Ambang paling longgar antara babak dan suasana — lihat GOYANG_SUASANA.
        g = goyang(x[picked[0] : picked[1]])
        ambang = max(babak["goyang"], GOYANG_SUASANA.get(suasana, 0.0))
        if g > ambang:
            dropped.append((m["file"], f"nada tidak stabil ({g:.0f}% > {ambang:.0f}%)"))
            continue

        # Klip `utuh`: panjang potongan MENGIKUTI kalimatnya. Ditetapkan di
        # sini, sesudah rentang bersuaranya diketahui — bukan ditebak di depan.
        if utuh:
            slot = (picked[1] - picked[0]) / SR

        # Dicatat untuk laporan di akhir: kalimat yang lebih panjang daripada
        # slotnya PASTI terpotong ekornya. Tanpa daftar ini, "ada yang kepotong"
        # cuma bisa dicari dengan mendengarkan seluruh montase berulang kali.
        panjang_kalimat = (picked[1] - picked[0]) / SR
        if not utuh and panjang_kalimat > slot + 0.15:
            terpotong.append((m["file"], panjang_kalimat, slot))

        seg = fit_slot(x, *picked, slot=slot)
        seg = tame_bursts(seg)

        voice, _, _ = measure(seg)
        floor = floor_asli
        # EMPAT pagar. Yang keempat — batas puncak — yang paling lama tidak
        # ada, dan itu penyebab hentakan yang tersisa: gain dihitung dari
        # RMS, jadi klip yang punya satu puncak tinggi tapi rata-ratanya
        # pelan tetap dikuatkan 3.5× sampai puncaknya menembus 2.4.
        peak = float(np.max(np.abs(seg))) or 1.0
        gain = min(
            TARGET_RMS / max(voice, 1e-6),
            GAIN_MAX,
            NOISE_MAX / max(floor, 1e-6),
            0.82 / peak,
        )
        gain = max(gain, 0.35)
        if floor * gain > 0.008:
            dropped.append((m["file"], f"latar terlalu ramai ({floor * gain:.3f})"))
            continue

        seg = stretch(shape(seg * gain), babak["laju"])
        if nama_babak == "penutup":
            penutup.append(seg)
        else:
            segs.append(seg)
        kept.append((m["file"], m["date"], m["mood"], nama_babak,
                     snr, gain, floor * gain, g))

    if not segs:
        print("tidak ada potongan yang lolos", file=sys.stderr)
        return 1

    # ── sambung: silang setara-daya, plus napas ──
    #
    # JEDA ditambahkan DI ANTARA silang. Tanpa itu tiap potongan langsung
    # disusul potongan berikutnya dan montasenya terasa diburu — keluhan
    # "antar VN masih kedeketan jaraknya". Silangnya sendiri sengaja panjang
    # (0.95 dtk) supaya suaranya saling menimpa, bukan bergantian.
    xf = int(XF * SR)
    a = np.linspace(0, np.pi / 2, xf)
    fo, fi = np.cos(a), np.sin(a)      # fo²+fi²=1 → kenyaringan tetap rata
    napas = np.zeros(int(JEDA * SR))

    out = segs[0].copy()
    marks = [0.0]
    for s in segs[1:]:
        out = np.concatenate([out, napas])
        head = len(out) - xf
        marks.append(head / SR)
        out = np.concatenate([out[:head], out[head:] * fo + s[:xf] * fi, s[xf:]])

    # ── Tumpukan tawa DIHAPUS ──
    #
    # Dulu tiga klip tawa ditumpuk di ujung montase. Idenya menarik, hasilnya
    # tidak: begitu babak sedih selesai, tawa bertumpuk langsung menghantam
    # tanpa jembatan. Yaya: "dari nangis tiba-tiba ada suara ketawa, nggak
    # smooth transisinya". Emosi butuh urutan, bukan tumpukan. Sekarang tawa
    # ditaruh di babak `pulih` dalam urutan biasa, sesudah satu potongan
    # tenang yang jadi jembatannya.

    # ── penutup: satu kalimat panjang yang meredup pelan ──
    #
    # Yaya: "di bagian akhir masih agak gantung ajaah kayak kurang smooth".
    # Sebabnya montase berhenti di tengah rangkaian potongan pendek — tidak
    # ada yang cukup panjang untuk diredupkan. Potongan penutup sengaja
    # dipilih dari VN terpanjang yang bersih (rentang bicara 8,8 detik) dan
    # disambung dengan silang dua kali lipat, supaya peralihannya tidak
    # terasa sebagai potongan lagi melainkan sebagai penurunan.
    if penutup:
        xf2 = int(1.9 * SR)
        p = penutup[0]
        out = np.concatenate([out, napas, napas])
        if len(out) > xf2 and len(p) > xf2:
            a2 = np.linspace(0, np.pi / 2, xf2)
            head = len(out) - xf2
            marks.append(head / SR)
            out = np.concatenate(
                [out[:head], out[head:] * np.cos(a2) + p[:xf2] * np.sin(a2), p[xf2:]]
            )
        else:
            marks.append(len(out) / SR)
            out = np.concatenate([out, p])

    # ═══ URUTAN INI PENTING ═══
    # Tempo sekarang diterapkan PER POTONGAN sebelum disambung (lihat
    # `stretch`), bukan sekali di akhir. Dulu atempo dijalankan di langkah
    # encode SESUDAH limiter — limiter merapikan sesuatu yang lalu di-resample
    # lagi, dan puncaknya melonjak dari 0.62 jadi 0.95.
    tmp = tempfile.gettempdir()

    # dua kali: level_ride bisa memunculkan kembali hentakan yang tadi ditekan
    out = repair_transients(out)
    out = level_ride(out)
    out = repair_transients(out)
    out, jeda_dipotong = rapikan_jeda(out)

    # ── masuk pelan-pelan; lagunya sudah jalan duluan ──
    lead = int(LEAD_IN * SR)
    ramp = (1 - np.cos(np.linspace(0, np.pi, lead))) / 2
    out[:lead] *= ramp

    # Redup keluar 4,5 detik — bukan 1,2 seperti dulu. Itu sebabnya akhirnya
    # terasa "gantung": suaranya belum sempat pergi, tiba-tiba sudah tidak ada.
    tail = min(int(4.5 * SR), len(out) // 3)
    out[-tail:] *= (1 + np.cos(np.linspace(0, np.pi, tail))) / 2

    # ── puncak: limiter berpandangan ke depan ──
    # tanh pada SELURUH berkas sempat dipakai dan itu keliru: ia melengkungkan
    # setiap sampel, termasuk yang pelan, jadi seluruh montase kena distorsi
    # harmonik demi menjinakkan beberapa puncak. Limiter hanya menyentuh
    # bagian yang memang melewati batas.
    out = limit(out, CEIL)
    peak = float(np.max(np.abs(out)))

    def geser(t):
        """
        Waktu LAMA (sebelum jeda dipendekkan) → waktu BARU.

        Tiap potongan jeda yang dibuang dan letaknya sebelum `t` menggeser
        `t` maju sebanyak panjangnya. Tanpa ini, `voice-of-olen.json` dan
        PETA-SUARA-OLEN.txt akan menunjuk detik yang meleset makin jauh ke
        arah belakang berkas — dan peta yang meleset lebih berbahaya daripada
        tidak ada peta.
        """
        s = t * SR
        buang = sum(min(b, s) - a for a, b in jeda_dipotong if a < s)
        return max(0.0, (s - buang) / SR)

    problems = audit(out)

    raw_path = os.path.join(tmp, "_voice.f32")
    out.astype(np.float32).tofile(raw_path)
    base = os.path.join(OUT, "voice-of-olen")
    common = ["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1",
              "-i", raw_path]
    subprocess.run(common + ["-c:a", "aac", "-b:a", "128k", base + ".m4a"], check=True)
    subprocess.run(common + ["-c:a", "libopus", "-b:a", "96k", base + ".opus"], check=True)
    os.remove(raw_path)

    dur = len(out) / SR
    json.dump(
        [{"file": f, "date": d, "mood": mo, "babak": b, "at": round(geser(t), 2)}
         for (f, d, mo, b, _, _, _, _), t in zip(kept, marks)],
        open(os.path.join(OUT, "voice-of-olen.json"), "w", encoding="utf-8"),
        ensure_ascii=False, indent=1,
    )

    print(f"{len(kept)} potongan, {dur:.1f} dtk, puncak {peak:.3f}")
    print(f"{'klip':<22} {'babak':<9} {'SNR':>6} {'gain':>6} {'derau':>9} {'goyang':>7}  suasana")
    for f, d, mo, b, snr, gain, nf, gy in kept:
        laju = BABAK.get(b, BABAK["harian"])["laju"]
        print(f"{f[:20]:<22} {b:<9} {snr:6.1f} {gain:6.2f}x {nf:9.5f} {gy:6.1f}%  {mo} ({laju}x)")
    for f, why in dropped:
        print(f"dilewati: {f[:20]} — {why}")

    # ── Kalimat yang ekornya terpotong ──
    #
    # Daftar ini yang mengubah keluhan "ada yang kepotong" jadi sesuatu yang
    # bisa ditunjuk. Kalau salah satu di sini ternyata kalimat yang harus utuh,
    # tambahkan `"utuh": true` pada klipnya di voice-sources.json.
    if terpotong:
        print(f"\nkalimat lebih panjang daripada slotnya ({len(terpotong)}):")
        for f, panjang, s in sorted(terpotong, key=lambda t: -(t[1] - t[2])):
            print(f"  {f[:24]}  kalimat {panjang:4.1f} dtk → slot {s:4.1f} dtk"
                  f"  (hilang {panjang - s:4.1f} dtk di ekor)")
    # Periksa berkas yang SUDAH dikodekan, bukan cuma larik di memori.
    # Puncak antar-sampel milik AAC baru kelihatan setelah dekode.
    back = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", base + ".m4a", "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "-"], capture_output=True)
    dec = np.frombuffer(back.stdout, dtype=np.float32).astype(np.float64)
    if len(dec):
        tp = float(np.max(np.abs(dec)))
        print(f"puncak sesudah dikodekan: {tp:.3f}")
        if tp > 0.99:
            problems.append(f"berkas jadi menabrak batas ({tp:.2f}) — turunkan CEIL")
        problems += [p for p in audit(dec) if p not in problems]

    print()
    if problems:
        print("PEMERIKSAAN — masih ada yang perlu dibereskan:")
        for p in problems:
            print("  •", p)
    else:
        print("PEMERIKSAAN: bersih — tidak ada hentakan, lubang senyap, atau lompatan tajam.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

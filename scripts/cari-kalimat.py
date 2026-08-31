#!/usr/bin/env python3
"""
Mencari kalimat Olen yang layak jadi kenangan di turunan laut.

═══ Kenapa berkas ini ada ═══

Pilihan kutipan versi pertama dinilai Yaya "jelek banget". Waktu ditanya
salahnya di mana, jawabannya KEEMPAT-EMPATNYA:

  1. terlalu dangkal — lucu, tapi tidak mengatakan siapa Olen
  2. salah momen — kalimatnya asli, tapi diambil dari saat yang tidak berbobot
  3. nada meleset — terdengar seperti kartu ucapan terima kasih
  4. terlalu banyak menyebut Yaya, bukan tentang Olen

Empat-empatnya sekaligus berarti yang salah bukan pilihan satu per satu,
melainkan CARA memilihnya. Menulis sepuluh kutipan baru menurut selera akan
mengulang putaran yang sama dengan lebih rapi.

Jadi urutannya dibalik: keempat keberatan itu diterjemahkan jadi saringan,
seluruh ekspor disisir, dan yang keluar adalah kandidat — bukan keputusan.
Yang memilih tetap Yaya, karena dia yang mengenal Olen.

Skrip ini TIDAK menulis kenangan.ts. Ia cuma melapor.

Jalankan:  python3 scripts/cari-kalimat.py
Hasilnya:  scripts/_kalimat.json  dan  ../PILIH-KALIMAT.html
"""

import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDUK = os.path.dirname(ROOT)

SUMBER = [
    os.path.join(INDUK, "WhatsApp Chat - My little sister 👧🏻 🤍 WA 2 FILE"),
    os.path.join(INDUK, "Terbaru Olen", "WhatsApp Chat - My little sister 👧🏻 🤍"),
]
OLEN = "My little sister"

BERSIH = re.compile(r"[‎‏‪-‮]")
BARIS = re.compile(r"^\[(\d{2}/\d{2}/\d{2}), ([\d.]+)\] ([^:]+): (.*)$")

# ── Saringan 4: menyebut Yaya, bukan tentang Olen ──
# Kalimat yang ditujukan KEPADA Yaya membuat halaman ini jadi tentang
# hubungan mereka, bukan tentang Olen. Yang dicari kalimat Olen soal
# dunianya sendiri, di mana Yaya kebetulan cuma yang mendengarkan.
#
# Daftarnya ditulis LENGKAP, bukan pakai `kak+`. Percobaan pertama memakai
# `\bkak+\b` dan itu meleset justru pada bentuk yang paling sering dipakai:
# "kakak" tidak cocok, karena sesudah "kak" masih ada huruf sehingga batas
# katanya tidak ketemu. Yang lolos akibatnya kalimat-kalimat yang paling
# jelas ditujukan kepada Yaya — persis yang paling ingin dibuang.
MENYEBUT = re.compile(
    r"\b(ka|kk+|kak|kaka|kakak|kakaknya|kakak'?nya|ka syafiq|syafiq|abang|bang)\b",
    re.I,
)

# "lu", "lo", "kamu" juga menunjuk Yaya, tapi tidak selalu membuat kalimatnya
# jadi tentang dia — Olen sering memakainya sambil bercerita soal dirinya.
# Jadi ini pengurang nilai, bukan pembuang.
LAWAN_BICARA = re.compile(r"\b(lu|lo|elu|kamu|km)\b", re.I)

# ── Saringan 3: nada kartu ucapan ──
# Ini yang paling penting dibuang. Tujuan halaman ini, dari HANDOVER.md:
# supaya Olen diingatkan siapa dirinya — BUKAN untuk memamerkan kebaikan
# penulisnya. Kalimat terima kasih memutar arahnya 180 derajat.
UCAPAN = re.compile(
    r"(makasi|makasih|terima kasih|thanks|maaf ya|baik banget|"
    r"bersyukur (punya|karena kak)|sayang (kaka|kak)|semoga (kaka|kak))",
    re.I,
)

# ── Saringan 1: terlalu dangkal ──
# Yang dicari kalimat yang membuat orang berhenti sebentar. Penandanya:
# Olen sedang MENGAKU sesuatu tentang dirinya — kesukaan, ketakutan,
# kebiasaan, penilaian atas diri sendiri, atau perubahan.
AKU = re.compile(r"\b(aku|gw|gua|gue)\b", re.I)

TANDA_DALAM = [
    # kesukaan & keengganan yang dimiliki sendiri
    (r"\b(suka|gasuka|ga suka|nggak suka|benci|males|malas|pengen|pengin|kepengen)\b", 3),
    # penilaian atas diri
    (r"\b(aku tuh|aku emang|aku mah|aku orangnya|gw tuh|gw emang|gw mah|gw orangnya)\b", 5),
    # perasaan yang diakui
    (r"\b(takut|sedih|kesel|marah|capek|lelah|kecewa|bangga|lega|senang|seneng|deg)\b", 3),
    # kemampuan / batas diri
    (r"\b(bisa|nggak bisa|gabisa|ga bisa|belum bisa|berani|nggak berani)\b", 2),
    # perubahan waktu — inti seluruh proyek ini
    (r"\b(dulu|sekarang|udah nggak|udah ga|jadi lebih|makin)\b", 4),
    # sebab & prinsip: kalimat yang MENJELASKAN dirinya
    (r"\b(soalnya|makanya|menurut aku|menurut gw|karena aku|karena gw|kalo aku|kalau aku)\b", 4),
    # menjaga orang lain — sifat Olen yang paling sering muncul
    (r"\b(hati-hati|tiati|jangan (ngebut|mengebut)|jaga|istirahat|jangan lupa)\b", 4),
]

# ── Saringan 2: salah momen ──
# Basa-basi dan urusan sehari-hari dibuang. Bukan karena tidak berharga,
# tapi karena ia tidak membawa apa pun ke permukaan.
DANGKAL = re.compile(
    r"^(iya|ya|oke|ok|okee+|hah|hm+|wkwk+|haha+|hehe+|anjay|yaudah|udah|blm|belum|"
    r"lagi apa|otw|gas|siap|amin|aamiin|nggak|ngga|gak|no|yes)\b[\s.!?]*$",
    re.I,
)


"""
═══ NAMA ORANG LAIN ═══

Yaya, soal montase suara: "jangan yang terikat sama orang takutnya trigering
di kemudian hari."

Di sini alasannya lebih kuat lagi. `kenangan.ts` IKUT GIT, dan repo GitHub-nya
saat ini publik. Kalimat Olen soal pertengkarannya dengan teman sekolah, hari
ini terasa sekadar cerita; empat tahun lagi ia jadi catatan permanen tentang
anak-anak yang tidak pernah dimintai pendapat.

Nama tidak ditebak dari daftar yang saya karang — ia DITURUNKAN dari
percakapannya sendiri: kata yang berkali-kali muncul dengan huruf besar di
TENGAH kalimat, dan bukan kata umum. Nama orang berperilaku begitu; kata biasa
tidak.

Yang kena tidak dibuang diam-diam. Ia dipisahkan ke bagian tersendiri di
halaman pemilih, lengkap dengan nama yang terdeteksi, supaya Yaya yang
memutuskan — bukan saya, dan bukan tanpa dia tahu.
"""

UMUM = set("""
aku gw gua gue kamu km lu lo dia kita kami mereka saya anda ini itu yang dan
atau tapi kalau kalo karena soalnya makanya jadi udah sudah belum blm nggak
ngga gak ga tidak ya iya oke ok nanti sekarang dulu besok kemarin hari malam
pagi siang sore aja saja banget bgt sih deh dong kok gitu gini juga masih
lagi terus sama untuk buat dari ke di pada akan bisa harus mau pengen ingin
ada punya kasih bikin buat orang anak teman temen semua tiap setiap apa siapa
kapan mana bagaimana kenapa mengapa berapa wkwk haha hehe astaga anjir yaudah
sabar makasih maaf tolong please sorry thanks god allah ya ampun
senin selasa rabu kamis jumat sabtu minggu januari februari maret april mei
juni juli agustus september oktober november desember
""".split())


#
# Kata yang biasanya diikuti nama orang. Ini tanda yang BEKERJA di korpus ini,
# sedangkan huruf besar tidak.
#
# TANPA re.I, dan teksnya dikecilkan dulu. Dengan `re.I`, kelas [a-z] ikut
# cocok dengan huruf besar — dan yang keluar "HAL", "KAYAK", "GEMINI" sebagai
# nama orang. Bendera yang kelihatan tidak berbahaya itu diam-diam membatalkan
# maksud kelas hurufnya.
SEBELUM_NAMA = re.compile(
    r"\b(?:sama|sm|ama|ke|si|bareng)\s+([a-zà-ÿ']{3,})"
)


def nama_orang(pesan):
    """
    Menemukan nama orang lain di percakapan.

    ── Percobaan pertama gagal, dan gagalnya diam ──

    Aturannya dulu: "kata yang berkali-kali muncul berhuruf besar di tengah
    kalimat". Itu aturan yang benar untuk tulisan yang rapi, dan salah total
    di sini — Olen mengetik nama temannya huruf kecil semua ("clares",
    "jazzlyn"), atau kapital semua waktu sedang kesal. Hasilnya: dari 30
    kandidat, cuma 1 yang tertangkap, padahal beberapa jelas menyebut nama.

    Kegagalan seperti ini berbahaya karena TIDAK terlihat seperti kegagalan.
    Skripnya jalan, angkanya keluar, lapornya rapi. Yang ketahuan cuma kalau
    hasilnya dibaca dan dibandingkan dengan apa yang mata lihat sendiri.

    Yang dipakai sekarang tanda yang memang ada di teksnya: kata yang muncul
    sesudah "sama", "ke", "si", "bareng" — posisi tempat orang menaruh nama —
    dan cukup sering sehingga bukan salah ketik, tapi tidak terlalu sering
    sehingga jadi kata umum.
    """
    from collections import Counter
    setelah = Counter()
    semua = Counter()
    for p in pesan:
        for k in re.findall(r"[A-Za-zÀ-ÿ']+", p["isi"]):
            semua[k.lower()] += 1
        for k in SEBELUM_NAMA.findall(p["isi"].lower()):
            if k not in UMUM:
                setelah[k] += 1

    nama = set()
    for k, n in setelah.items():
        if len(k) < 3 or k in UMUM:
            continue
        # Dua syarat, dan yang kedua yang menentukan.
        #
        # Jumlah saja tidak cukup: "kayak" juga sering muncul sesudah "sama".
        # Bedanya, nama orang HAMPIR SELALU muncul di posisi itu, sedangkan
        # kata biasa muncul di mana-mana. Jadi yang dipakai perbandingannya —
        # berapa bagian dari kemunculannya yang ada di posisi nama.
        if n >= 3 and semua[k] < 600 and n / max(semua[k], 1) >= 0.2:
            nama.add(k)

    # tetap ambil yang berhuruf besar di tengah kalimat — aturan lama masih
    # menangkap sebagian, dan dua tanda lebih baik daripada satu
    besar = Counter()
    for p in pesan:
        kata = re.findall(r"[A-Za-zÀ-ÿ']+", p["isi"])
        for k in kata[1:]:
            if len(k) >= 3 and k[0].isupper() and not k.isupper() and k.lower() not in UMUM:
                besar[k.lower()] += 1
    nama |= {k for k, n in besar.items() if n >= 3}
    return nama


def baca():
    pesan = []
    for folder in SUMBER:
        f = os.path.join(folder, "_chat.txt")
        if not os.path.exists(f):
            continue
        for raw in open(f, encoding="utf-8", errors="replace"):
            s = BERSIH.sub("", raw).rstrip("\n")
            m = BARIS.match(s)
            if not m:
                continue
            tgl, jam, siapa, isi = m.groups()
            pesan.append({"tgl": tgl, "jam": jam, "siapa": siapa.strip(), "isi": isi.strip()})
    return pesan


def skor(t: str):
    """Nilai kedalaman kalimat, plus daftar alasan kenapa ia lolos."""
    n = 0
    alasan = []
    for pola, bobot in TANDA_DALAM:
        if re.search(pola, t, re.I):
            n += bobot
            alasan.append(pola.split("|")[0].strip("\\b()"))
    # kalimat yang lebih panjang biasanya menjelaskan, bukan menjawab
    if len(t) > 70:
        n += 2
    if len(t) > 120:
        n += 1
    # tiap sapaan ke Yaya menarik kalimatnya menjauh dari "tentang Olen"
    n -= 3 * len(LAWAN_BICARA.findall(t))
    return n, alasan


def main():
    pesan = baca()
    if not pesan:
        print("Tidak ada _chat.txt yang terbaca.")
        return

    NAMA = nama_orang(pesan)
    print(f"nama orang terdeteksi dari percakapan: {len(NAMA)}")

    kandidat = []
    for i, p in enumerate(pesan):
        if OLEN not in p["siapa"]:
            continue
        t = p["isi"]
        if "<attached:" in t or "omitted" in t.lower():
            continue
        if not (25 <= len(t) <= 200):
            continue
        if DANGKAL.match(t):
            continue
        if UCAPAN.search(t):          # saringan 3 — dibuang keras
            continue
        if MENYEBUT.search(t):        # saringan 4 — dibuang keras
            continue
        if not AKU.search(t):         # harus tentang dirinya
            continue
        n, alasan = skor(t)
        if n < 6:                     # saringan 1 — terlalu dangkal
            continue
        sekitar = [
            f'{"Olen" if OLEN in q["siapa"] else "Yaya"}: {q["isi"][:80]}'
            for q in pesan[max(0, i - 2) : i + 3]
            if q is not p and "<attached:" not in q["isi"]
        ]
        kena = sorted({w for w in re.findall(r"[A-Za-zÀ-ÿ']+", t) if w.lower() in NAMA})
        kandidat.append(
            {"tgl": p["tgl"], "jam": p["jam"], "teks": t, "skor": n,
             "alasan": alasan, "sekitar": sekitar, "nama": kena}
        )

    # urut menurut tanggal supaya Yaya membacanya sebagai perjalanan,
    # bukan sebagai peringkat — peringkat membuat orang memilih yang teratas
    def kunci(k):
        d, m, y = k["tgl"].split("/")
        return (y, m, d, k["jam"])

    kandidat.sort(key=kunci)

    with open(os.path.join(ROOT, "scripts", "_kalimat.json"), "w", encoding="utf-8") as fh:
        json.dump(kandidat, fh, ensure_ascii=False, indent=1)

    aman = [k for k in kandidat if not k["nama"]]
    bernama = [k for k in kandidat if k["nama"]]
    tulis_halaman(aman, bernama)
    print(f"kandidat lolos saringan: {len(kandidat)}")
    print(f"  aman                 : {len(aman)}")
    print(f"  menyebut nama orang  : {len(bernama)}  (dipisah, bukan dibuang)")
    print(f"ditulis: scripts/_kalimat.json")
    print(f"         {os.path.join(INDUK, 'PILIH-KALIMAT.html')}")


HTML = """<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pilih kalimat Olen</title>
<style>
 :root{--bg:#0E2233;--panel:#16304A;--garis:#25455F;--teks:#EAF3FA;--redup:#8FB0C8;--biru:#6FC6EC;--hijau:#6FD3A4}
 *{box-sizing:border-box}
 body{margin:0;background:var(--bg);color:var(--teks);font:15px/1.6 "Segoe UI",system-ui,sans-serif}
 header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--garis);padding:16px 22px}
 h1{margin:0 0 4px;font-size:1.1rem}
 .sub{margin:0;color:var(--redup);font-size:.85rem;max-width:70ch}
 main{padding:16px 22px 30px;max-width:840px}
 .tahun{margin:26px 0 8px;font-size:.72rem;letter-spacing:.22em;color:var(--redup)}
 .k{border:1px solid var(--garis);border-radius:10px;padding:12px 14px;margin-bottom:10px;cursor:pointer}
 .k:hover{background:rgba(255,255,255,.04)}
 .k[data-p="1"]{border-color:var(--hijau);background:rgba(111,211,164,.12)}
 .t{font-size:1rem}
 .m{margin-top:7px;font-size:.75rem;color:var(--redup);display:flex;gap:12px;flex-wrap:wrap}
 .ktx{margin-top:8px;font-size:.75rem;color:var(--redup);border-left:2px solid var(--garis);padding-left:9px;display:none}
 .k.buka .ktx{display:block}
 .hasil{position:sticky;bottom:0;background:var(--panel);border-top:1px solid var(--garis);padding:12px 22px}
 textarea{width:100%;height:110px;background:var(--bg);color:var(--teks);border:1px solid var(--garis);border-radius:8px;padding:9px;font:13px/1.5 ui-monospace,Consolas,monospace}
 .alat{margin-top:7px;display:flex;gap:8px;align-items:center}
 button{background:var(--biru);color:#08283A;border:none;border-radius:999px;padding:6px 15px;font:inherit;font-weight:600;cursor:pointer}
 button.k2{background:transparent;color:var(--redup);border:1px solid var(--garis);font-weight:400}
 .jml{color:var(--redup);font-size:.8rem}
</style></head><body>
<header>
 <h1>Pilih kalimat Olen</h1>
 <p class="sub">__JML__ kandidat, sudah disaring: bukan ucapan terima kasih, tidak menyebut kakaknya, dan mengaku sesuatu tentang dirinya sendiri. Urut menurut tanggal, bukan peringkat. Klik untuk memilih; klik tulisan <em>konteks</em> untuk melihat percakapan sekitarnya.</p>
</header>
<main id="d"></main>
<div style="max-width:840px;padding:0 22px 30px">
 <details>
  <summary style="cursor:pointer;color:var(--redup);font-size:.85rem;padding:10px 0">
   __JMLNAMA__ kandidat lain menyebut nama orang lain — dipisahkan, bukan dibuang
  </summary>
  <p style="color:var(--redup);font-size:.82rem;max-width:70ch;line-height:1.6">
   Kalimat-kalimat ini lolos semua saringan lain, tapi di dalamnya ada nama
   teman atau saudara. Berkas <code>kenangan.ts</code> ikut git dan repo-nya
   sekarang publik: hari ini kalimat ini terasa sekadar cerita, beberapa tahun
   lagi ia jadi catatan permanen tentang orang yang tidak pernah dimintai
   pendapat. Nama-namanya tidak saya karang — ia diturunkan dari kata yang
   berkali-kali muncul berhuruf besar di tengah kalimat.
   Boleh dipilih, tapi putuskan sadar-sadar.
  </p>
  <div id="dn"></div>
 </details>
</div>
<div class="hasil">
 <textarea id="o" readonly></textarea>
 <div class="alat"><button id="s">Salin</button><button class="k2" id="b">Hapus pilihan</button><span class="jml" id="j"></span></div>
</div>
<script>
const AMAN=__DATA__;const BERNAMA=__NAMA__;
const K=AMAN.concat(BERNAMA);
const d=document.getElementById('d');const o=document.getElementById('o');const j=document.getElementById('j');
const KUNCI='pilih-kalimat-olen';let pilih={};try{pilih=JSON.parse(localStorage.getItem(KUNCI)||'{}')}catch(e){}
/* Kunci pilihan dari ISI kalimatnya, bukan dari nomor urut.
   Nomor urut berubah tiap kali daftarnya dibuat ulang — dan waktu itu terjadi,
   tanda yang tersimpan pindah diam-diam ke kalimat lain. Sudah terjadi sekali
   di sini: 12 kalimat terpilih padahal cuma dua yang pernah diklik. */
function kunciDari(k){return k.tgl+'|'+k.teks}
function kartu(k,i,wadah,pakaiTahun){
 if(pakaiTahun){const y='20'+k.tgl.split('/')[2];
  if(y!==kartu.th){const h=document.createElement('div');h.className='tahun';h.textContent=y;wadah.appendChild(h);kartu.th=y}}
 const e=document.createElement('div');e.className='k';e.dataset.p=pilih[kunciDari(k)]?'1':'';
 const nm=(k.nama&&k.nama.length)?'<span style="color:#E8A87C">menyebut: '+k.nama.join(', ')+'</span>':'';
 e.innerHTML='<div class="t">'+k.teks.replace(/</g,'&lt;')+'</div>'+
   '<div class="m"><span>'+k.tgl+' '+k.jam+'</span><span>nilai '+k.skor+'</span>'+nm+
   '<span class="tk" style="cursor:pointer;text-decoration:underline">konteks</span></div>'+
   '<div class="ktx">'+k.sekitar.map(s=>s.replace(/</g,'&lt;')).join('<br>')+'</div>';
 e.addEventListener('click',ev=>{
   if(ev.target.classList.contains('tk')){e.classList.toggle('buka');return}
   const id=kunciDari(k);
   pilih[id]=!pilih[id];if(!pilih[id])delete pilih[id];
   e.dataset.p=pilih[id]?'1':'';simpan()});
 wadah.appendChild(e)}
kartu.th=null;
AMAN.forEach((k,i)=>kartu(k,i,d,true));
const dn=document.getElementById('dn');
BERNAMA.forEach((k,i)=>kartu(k,AMAN.length+i,dn,false));
function simpan(){try{localStorage.setItem(KUNCI,JSON.stringify(pilih))}catch(e){}tulis()}
function tulis(){
 const dipilih=K.filter(k=>pilih[kunciDari(k)]);
 o.value=dipilih.length?dipilih.map(k=>k.tgl+'  |  '+k.teks).join('\\n'):'(belum ada yang dipilih)';
 j.textContent=dipilih.length+' dipilih';}
document.getElementById('s').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(o.value)}catch(e){o.select();document.execCommand('copy')}});
document.getElementById('b').addEventListener('click',()=>{pilih={};document.querySelectorAll('.k').forEach(e=>e.dataset.p='');simpan()});
tulis();
</script></body></html>
"""


def tulis_halaman(aman, bernama):
    h = HTML.replace("__DATA__", json.dumps(aman, ensure_ascii=False))
    h = h.replace("__NAMA__", json.dumps(bernama, ensure_ascii=False))
    h = h.replace("__JML__", str(len(aman)))
    h = h.replace("__JMLNAMA__", str(len(bernama)))
    with open(os.path.join(INDUK, "PILIH-KALIMAT.html"), "w", encoding="utf-8") as fh:
        fh.write(h)


if __name__ == "__main__":
    main()

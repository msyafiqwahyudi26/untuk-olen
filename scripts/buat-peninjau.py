#!/usr/bin/env python3
"""
Membuat TINJAU-SUARA.html — halaman untuk menandai potongan sambil mendengarkan.

═══ Kenapa alat ini ada ═══

Tiga hal yang Yaya minta tidak bisa diputuskan dari sini: mana yang menyebut
Jovan, mana yang menyebut Weli, mana momen "kamu harus bangga sama aku". Semua
diucapkan DI DALAM audio, tidak tertulis di percakapan, dan transkripsi
otomatis diblokir proxy. Jadi memang harus telinga Yaya.

Yang bisa diperbaiki adalah CARA bertanyanya. Minta "catat detiknya" berarti
ia mendengarkan sambil menghitung waktu, lalu mengetik angka, lalu saya
mencocokkan angka itu ke nama berkas. Tiga langkah, tiga kesempatan meleset,
dan harus diulang tiap kali montasenya dibangun ulang.

Halaman ini memampatkannya jadi satu: ia mendengarkan, potongan yang sedang
berbunyi menyala sendiri, dan ia menekan satu tombol. Hasilnya keluar sebagai
teks siap tempel yang sudah berisi nama berkasnya.

Dijalankan ULANG tiap kali montase dibangun ulang — waktunya ikut berubah,
dan peta yang meleset lebih berbahaya daripada tidak ada peta.

Jalankan:  python3 scripts/buat-peninjau.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDUK = os.path.dirname(ROOT)

BABAK_NAMA = {
    "pembuka": "Pembuka",
    "harian": "Sehari-hari",
    "keluh": "Keluh",
    "sedih": "Sedih",
    "pulih": "Pulih",
    "penutup": "Penutup",
}

HTML = """<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tinjau suara Olen</title>
<style>
  :root {
    --bg:#0E2233; --panel:#16304A; --garis:#25455F; --teks:#EAF3FA;
    --redup:#8FB0C8; --biru:#6FC6EC; --merah:#E8746A; --hijau:#6FD3A4;
  }
  * { box-sizing:border-box; }
  body {
    margin:0; background:var(--bg); color:var(--teks);
    font:15px/1.55 "Segoe UI",system-ui,sans-serif;
  }
  header {
    position:sticky; top:0; z-index:5; background:var(--bg);
    border-bottom:1px solid var(--garis); padding:18px 22px 14px;
  }
  h1 { margin:0 0 4px; font-size:1.15rem; font-weight:600; letter-spacing:.01em; }
  .sub { margin:0 0 12px; color:var(--redup); font-size:.85rem; }
  audio { width:100%; }
  .bantuan {
    margin-top:10px; font-size:.78rem; color:var(--redup);
    display:flex; flex-wrap:wrap; gap:14px;
  }
  kbd {
    background:var(--panel); border:1px solid var(--garis); border-radius:4px;
    padding:1px 6px; font:inherit; font-size:.78rem;
  }
  main { padding:14px 22px 40px; max-width:900px; }
  .babak {
    margin:22px 0 6px; font-size:.72rem; letter-spacing:.22em;
    text-transform:uppercase; color:var(--redup);
  }
  .baris {
    display:grid; grid-template-columns:64px 1fr auto; gap:12px; align-items:center;
    padding:7px 10px; border-radius:8px; border:1px solid transparent;
    cursor:pointer;
  }
  .baris:hover { background:rgba(255,255,255,.04); }
  .baris.main { background:rgba(111,198,236,.14); border-color:var(--biru); }
  .waktu { color:var(--redup); font-variant-numeric:tabular-nums; font-size:.85rem; }
  .nama { font-size:.84rem; color:var(--redup); word-break:break-all; }
  .suasana { font-size:.72rem; color:var(--teks); opacity:.75; }
  .aksi { display:flex; gap:6px; }
  .aksi button {
    background:transparent; color:var(--redup); border:1px solid var(--garis);
    border-radius:999px; padding:3px 11px; font:inherit; font-size:.75rem; cursor:pointer;
  }
  .aksi button:hover { border-color:var(--redup); color:var(--teks); }
  .baris[data-tanda="buang"] { background:rgba(232,116,106,.14); border-color:var(--merah); }
  .baris[data-tanda="buang"] .aksi .buang { background:var(--merah); color:#2A0E0B; border-color:var(--merah); }
  .baris[data-tanda="utuh"] { background:rgba(111,211,164,.13); border-color:var(--hijau); }
  .baris[data-tanda="utuh"] .aksi .utuh { background:var(--hijau); color:#08301F; border-color:var(--hijau); }
  .hasil {
    position:sticky; bottom:0; background:var(--panel);
    border-top:1px solid var(--garis); padding:14px 22px;
  }
  .hasil h2 { margin:0 0 8px; font-size:.75rem; letter-spacing:.2em; text-transform:uppercase; color:var(--redup); }
  textarea {
    width:100%; height:120px; background:var(--bg); color:var(--teks);
    border:1px solid var(--garis); border-radius:8px; padding:10px;
    font:13px/1.5 ui-monospace,Consolas,monospace; resize:vertical;
  }
  .hasil .alat { margin-top:8px; display:flex; gap:8px; }
  .hasil button {
    background:var(--biru); color:#08283A; border:none; border-radius:999px;
    padding:7px 16px; font:inherit; font-weight:600; cursor:pointer;
  }
  .hasil button.kedua { background:transparent; color:var(--redup); border:1px solid var(--garis); font-weight:400; }
</style>
</head>
<body>

<header>
  <h1>Tinjau suara Olen</h1>
  <p class="sub">__RINGKAS__ · dengarkan, lalu tandai potongan yang perlu dibuang atau dibuat utuh</p>
  <audio id="au" controls preload="metadata" src="__AUDIO__"></audio>
  <div class="bantuan">
    <span><kbd>spasi</kbd> putar / jeda</span>
    <span><kbd>B</kbd> buang yang sedang berbunyi</span>
    <span><kbd>U</kbd> jadikan utuh</span>
    <span><kbd>0</kbd> batalkan tanda</span>
    <span>klik baris mana pun untuk melompat ke situ</span>
  </div>
</header>

<main id="daftar"></main>

<div class="hasil">
  <h2>Hasil — salin dan kirim ke Claude</h2>
  <textarea id="keluar" readonly></textarea>
  <div class="alat">
    <button id="salin">Salin</button>
    <button class="kedua" id="bersih">Hapus semua tanda</button>
  </div>
</div>

<script>
const KLIP = __MANIFES__;
const BABAK = __BABAK__;
const au = document.getElementById('au');
const daftar = document.getElementById('daftar');
const keluar = document.getElementById('keluar');
const KUNCI = 'tinjau-suara-olen';

let tanda = {};
try { tanda = JSON.parse(localStorage.getItem(KUNCI) || '{}'); } catch (e) { tanda = {}; }

let babakLalu = null;
KLIP.forEach((k, i) => {
  if (k.babak !== babakLalu) {
    const h = document.createElement('div');
    h.className = 'babak';
    h.textContent = BABAK[k.babak] || k.babak;
    daftar.appendChild(h);
    babakLalu = k.babak;
  }
  const b = document.createElement('div');
  b.className = 'baris';
  b.id = 'k' + i;
  b.dataset.tanda = tanda[k.file] || '';
  const m = Math.floor(k.at / 60), d = (k.at % 60).toFixed(1).padStart(4, '0');
  b.innerHTML =
    '<span class="waktu">' + m + ':' + d + '</span>' +
    '<span><span class="suasana">' + k.mood + '</span> · <span class="nama">' + k.file + '</span></span>' +
    '<span class="aksi">' +
      '<button class="buang">buang</button>' +
      '<button class="utuh">utuh</button>' +
    '</span>';
  b.addEventListener('click', (ev) => {
    if (ev.target.tagName === 'BUTTON') return;
    au.currentTime = k.at + 0.05;
    au.play();
  });
  b.querySelector('.buang').addEventListener('click', () => setel(i, 'buang'));
  b.querySelector('.utuh').addEventListener('click', () => setel(i, 'utuh'));
  daftar.appendChild(b);
});

function setel(i, nilai) {
  const k = KLIP[i];
  tanda[k.file] = (tanda[k.file] === nilai) ? '' : nilai;
  if (!tanda[k.file]) delete tanda[k.file];
  document.getElementById('k' + i).dataset.tanda = tanda[k.file] || '';
  try { localStorage.setItem(KUNCI, JSON.stringify(tanda)); } catch (e) {}
  tulis();
}

/* Potongan mana yang sedang berbunyi: yang `at`-nya terakhir dilewati. */
function sekarang() {
  const t = au.currentTime;
  let n = -1;
  for (let i = 0; i < KLIP.length; i++) if (KLIP[i].at <= t + 0.02) n = i; else break;
  return n;
}

let aktifLalu = -1;
au.addEventListener('timeupdate', () => {
  const n = sekarang();
  if (n === aktifLalu) return;
  if (aktifLalu >= 0) document.getElementById('k' + aktifLalu).classList.remove('main');
  aktifLalu = n;
  if (n >= 0) {
    const el = document.getElementById('k' + n);
    el.classList.add('main');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA') return;
  const n = sekarang();
  if (e.code === 'Space') { e.preventDefault(); au.paused ? au.play() : au.pause(); }
  else if (e.key.toLowerCase() === 'b' && n >= 0) setel(n, 'buang');
  else if (e.key.toLowerCase() === 'u' && n >= 0) setel(n, 'utuh');
  else if (e.key === '0' && n >= 0) { delete tanda[KLIP[n].file];
    document.getElementById('k' + n).dataset.tanda = '';
    try { localStorage.setItem(KUNCI, JSON.stringify(tanda)); } catch (er) {}
    tulis(); }
});

function tulis() {
  const buang = KLIP.filter(k => tanda[k.file] === 'buang');
  const utuh  = KLIP.filter(k => tanda[k.file] === 'utuh');
  let t = '';
  if (buang.length) t += 'BUANG:\\n' + buang.map(k => '  ' + k.file).join('\\n') + '\\n';
  if (utuh.length)  t += (t ? '\\n' : '') + 'UTUH:\\n' + utuh.map(k => '  ' + k.file).join('\\n') + '\\n';
  keluar.value = t || '(belum ada yang ditandai)';
}

document.getElementById('salin').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(keluar.value); }
  catch (e) { keluar.select(); document.execCommand('copy'); }
});
document.getElementById('bersih').addEventListener('click', () => {
  tanda = {};
  try { localStorage.removeItem(KUNCI); } catch (e) {}
  KLIP.forEach((k, i) => { document.getElementById('k' + i).dataset.tanda = ''; });
  tulis();
});

tulis();
</script>
</body>
</html>
"""


def main():
    manifes = os.path.join(ROOT, "public", "audio", "voice-of-olen.json")
    with open(manifes, encoding="utf-8") as fh:
        klip = json.load(fh)

    total = max(k["at"] for k in klip)
    ringkas = f"{len(klip)} potongan · ± {int(total // 60)} menit {int(total % 60)} detik"

    html = (
        HTML.replace("__MANIFES__", json.dumps(klip, ensure_ascii=False))
        .replace("__BABAK__", json.dumps(BABAK_NAMA, ensure_ascii=False))
        .replace("__RINGKAS__", ringkas)
        # Jalur relatif dari folder Kerja/ ke berkas audionya. Sengaja relatif
        # supaya halaman ini bisa dibuka langsung sebagai berkas, tanpa server.
        .replace("__AUDIO__", "untuk-olen/public/audio/voice-of-olen.m4a")
    )

    keluar = os.path.join(INDUK, "TINJAU-SUARA.html")
    with open(keluar, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"ditulis: {keluar}")
    print(f"         {ringkas}")


if __name__ == "__main__":
    main()

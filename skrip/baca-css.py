"""
Pembaca CSS yang membaca aturan EFEKTIF, bukan aturan pertama.

Ditulis 1 September 2026 sesudah alat periksa sekali-pakai salah baca EMPAT
kali dalam satu hari, dan tiap kali dengan cara yang sama: membaca blok
pertama sebuah selektor padahal yang berlaku blok terakhir, atau membaca
blok @media pertama padahal ada dua dengan syarat yang sama.

Dua jebakan yang wajib ditangani, dan keduanya sudah pernah menggigit:

  1. Sebuah selektor bisa muncul berkali-kali. Yang berlaku gabungan
     semuanya, dengan yang belakangan menang PER PROPERTI.
  2. Sebuah syarat @media bisa muncul berkali-kali juga. Semuanya berlaku,
     jadi semuanya harus dibaca, bukan cuma yang pertama.

Dan satu jebakan regex: pola `([^{},]*)\\{` yang MEMAKAN tanda `}` pemisah
membuat setiap aturan kedua terlewat, karena finditer tidak boleh tumpang
tindih. Di sini pemisahnya tidak dimakan; sisa selektor sebelumnya dibuang
dengan rfind("}").
"""
import re
import sys

ATURAN = re.compile(r"([^{}@]+)\{([^{}]*)\}")


def _dek(teks, sel):
    d = {}
    for m in ATURAN.finditer(teks):
        raw = m.group(1)
        raw = raw[raw.rfind("}") + 1 :]
        for s in raw.split(","):
            if s.strip() != sel:
                continue
            for x in m.group(2).split(";"):
                if ":" in x:
                    k, v = x.split(":", 1)
                    d[k.strip()] = v.strip()
    return d


def blokMedia(css, syarat):
    """SEMUA isi @media dengan syarat ini, digabung berurutan."""
    keluar = []
    i = 0
    while True:
        i = css.find(syarat, i)
        if i < 0:
            break
        j = css.index("{", i) + 1
        d = 1
        k = j
        while d:
            if css[k] == "{":
                d += 1
            elif css[k] == "}":
                d -= 1
            k += 1
        keluar.append(css[j : k - 1])
        i = k
    return "".join(keluar)


def efektif(css, sel, media=None):
    """Deklarasi yang benar-benar berlaku. `media` = syarat @media, mis.
    '@media (max-width:719px)'. Tanpa itu, hanya aturan tingkat atas."""
    if media:
        return _dek(blokMedia(css, media), sel)
    luar = re.sub(r"@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}", "", css)
    return _dek(luar, sel)


if __name__ == "__main__":
    css = open(sys.argv[1]).read()
    sel = sys.argv[2]
    media = sys.argv[3] if len(sys.argv) > 3 else None
    for k, v in sorted(efektif(css, sel, media).items()):
        print(f"  {k}: {v}")

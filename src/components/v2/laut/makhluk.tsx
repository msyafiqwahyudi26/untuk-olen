/**
 * ═══ MAKHLUK LAUT, 2D ═══
 *
 * Aset di `assets/` semuanya mesh three.js dan tidak bisa dibawa ke sini.
 * Ini gambar baru, dan sengaja SILUET, bukan ilustrasi berdetail.
 *
 * Bukan karena lebih mudah — karena lebih benar. Di dalam air, cahaya habis
 * dari atas ke bawah: begitu turun beberapa puluh meter, yang tersisa dari
 * apa pun memang tinggal bentuknya. Menggambar sisik dan mata yang tajam lalu
 * menggelapkannya di kedalaman berarti menggambar sesuatu yang tidak akan
 * pernah terlihat.
 *
 * Karena itu semuanya memakai `currentColor`: warnanya ditentukan induknya,
 * dan induknya menurunkannya dari `kedalaman.ts`. Tidak ada satu pun warna
 * yang dipatok di berkas ini — kecuali ubur-ubur, dan itu memang beda jenis:
 * ia tidak memantulkan cahaya, ia membuatnya.
 *
 *
 * ── KENAPA BENTUKNYA DIGAMBAR ULANG 31 AGUSTUS ──
 *
 * Versi pertama dinilai "vektor ikannya masih aneh", dan penilaian itu benar.
 * Sebabnya bisa disebut satu per satu, dan semuanya soal proporsi, bukan
 * detail:
 *
 *   - Lumba-lumbanya tidak punya moncong. Tanpa moncong yang menonjol, siluet
 *     lumba-lumba jatuh jadi siluet ikan gemuk mana pun.
 *   - Badannya paling tebal di tengah. Pada lumba-lumba sungguhan bagian
 *     tertebal ada tepat di belakang kepala, sekitar sepertiga depan, lalu
 *     menirus panjang ke ekor. Tebal di tengah membuatnya terbaca seperti
 *     balon.
 *   - Ekornya cuma tonjolan. Ekor lumba-lumba dilihat dari samping berbentuk
 *     bulan sabit dengan DUA cuping, dan itu bagian yang paling dikenali
 *     mata.
 *   - Siripnya menempel tanpa arah. Sirip punggung lumba-lumba menyapu ke
 *     BELAKANG; yang tegak lurus terbaca sebagai hiu.
 *
 * Sekarang badan, sirip punggung, sirip dada, dan ekor digambar sebagai empat
 * bentuk terpisah. Itu jauh lebih mudah dijaga benar daripada satu garis
 * panjang yang harus melakukan semuanya sekaligus — dan kalau satu bagian
 * salah, cuma bagian itu yang perlu diperbaiki.
 */

/* ═══ LUMBA-LUMBA ═══ menghadap kanan, moncong di x ≈ 252 */
export function LumbaLumba({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 115" className={className} aria-hidden fill="currentColor">
      {/* badan: moncong lancip → dahi membulat → punggung melengkung →
          menirus panjang ke pangkal ekor */}
      <path
        d="M252 60
           C240 52 232 48 222 45
           C210 36 196 30 176 29
           C146 27 112 33 84 44
           C66 51 52 57 40 62
           L30 66 L32 72
           C50 78 66 83 86 87
           C116 96 150 97 178 92
           C200 88 218 80 230 72
           C238 68 246 64 252 60 Z"
      />
      {/* sirip punggung — menyapu ke belakang, bukan tegak */}
      <path d="M132 32 C124 16 110 6 96 2 C104 14 106 24 104 38 Z" />
      {/* sirip dada */}
      <path d="M202 86 C188 100 172 108 156 110 C168 100 176 92 180 82 Z" opacity=".82" />
      {/* ekor bulan sabit, dua cuping */}
      <path
        d="M30 62
           C22 52 12 44 0 38
           C10 50 20 58 28 66
           C20 74 10 82 0 90
           C12 84 22 76 30 68 Z"
      />
    </svg>
  );
}

/* ═══ PAUS ═══ kepala tumpul, sirip dada panjang, ekor lebar */
export function Paus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 145" className={className} aria-hidden fill="currentColor">
      <path
        d="M332 70
           C332 54 314 40 286 33
           C240 22 168 28 106 48
           C76 58 52 66 36 74
           C52 84 76 92 106 100
           C168 120 240 126 286 115
           C314 108 332 94 332 70 Z"
      />
      {/* punuk punggung, kecil dan jauh ke belakang */}
      <path d="M126 44 C118 32 106 26 94 24 C102 32 106 38 106 48 Z" opacity=".9" />
      {/* sirip dada — pada paus bungkuk panjangnya hampir sepertiga badan,
          dan justru itu yang membuatnya langsung dikenali */}
      <path d="M252 108 C228 130 196 143 166 144 C192 128 214 113 228 96 Z" opacity=".82" />
      {/* ekor */}
      <path
        d="M34 72
           C24 60 12 50 0 42
           C10 56 20 66 28 76
           C20 88 10 98 0 108
           C12 100 24 90 34 80 Z"
      />
    </svg>
  );
}

/* ═══ TERUMBU KARANG ═══ bercabang, tumbuh dari dasar bingkai */
export function Terumbu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden fill="currentColor">
      <path d="M70 140c-4-30-2-54 6-72 4-9 4-18 0-27 9 4 15 12 17 24 3-14 9-24 19-30-4 12-4 23 1 33 6-8 14-12 24-13-9 8-14 17-15 28-1 12 2 23 9 33-14-4-24-2-30 6-4 6-6 12-6 18z" />
      <path d="M52 140c-8-22-12-40-10-54 1-10-1-19-6-27 10 3 17 10 21 21 2-11 7-19 15-24-4 11-4 21 0 30 5 11 6 29 4 54z" opacity=".78" />
      <path d="M104 140c2-18 6-31 12-39 4-6 5-12 3-19 7 4 11 10 12 19 2-9 6-15 13-19-3 9-3 17 0 24 3 8 3 20 1 34z" opacity=".62" />
    </svg>
  );
}

/* ═══ KARANG MEJA ═══ bentuk kedua supaya dasar dangkalnya tidak terbaca
   sebagai satu bentuk yang ditempel berulang kali */
export function KarangMeja({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 110" className={className} aria-hidden fill="currentColor">
      <path d="M78 110c-2-16-2-28 0-36-14-2-26-8-36-18 18 4 30 4 36 0-8-8-12-16-12-24 8 8 16 12 24 12 2-10 6-18 12-24 4 8 6 16 6 24 10-2 20-6 30-14-4 12-10 20-18 26 10 2 22 0 36-6-12 14-26 22-42 24 2 8 2 20 0 36z" />
      <path d="M40 110c-4-14-6-25-4-33-10-2-18-6-24-14 12 4 20 4 26 2-6-6-8-12-8-20 6 6 12 10 18 12 2 12 2 30-2 53z" opacity=".7" />
    </svg>
  );
}

/**
 * ═══ RUMPUT LAUT ═══
 *
 * Ditambahkan karena laut dangkalnya dinilai kosong. Yang kurang di sana
 * bukan makhluk baru — Yaya minta hewannya jangan banyak-banyak — melainkan
 * sesuatu yang BERGERAK PELAN dan menutup dasar bingkai.
 *
 * Helainya digambar sebagai garis tebal berujung bulat, bukan bidang
 * berlekuk. Alasannya bisa dilihat: garis punya satu titik tumpu di pangkal,
 * jadi ia bisa dilenggokkan dengan satu putaran di `transform-origin` dan
 * hasilnya terbaca seperti terbawa arus. Bidang berlekuk harus dilenggokkan
 * per titik, dan hasilnya kaku persis di bagian yang paling diperhatikan
 * mata.
 */
export function Rumput({ className }: { className?: string }) {
  const helai = [
    { d: "M20 110C18 78 22 52 34 30", w: 7, o: 0.9, t: 0 },
    { d: "M36 110C34 84 34 56 44 34", w: 5.5, o: 0.72, t: 0.4 },
    { d: "M52 110C52 82 48 54 40 28", w: 6, o: 0.85, t: 0.9 },
    { d: "M66 110C68 80 74 54 88 34", w: 5, o: 0.66, t: 0.2 },
    { d: "M82 110C84 86 90 60 102 40", w: 6.5, o: 0.8, t: 1.3 },
    { d: "M98 110C98 78 94 52 86 32", w: 4.5, o: 0.6, t: 0.7 },
  ];
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      {helai.map((h, i) => (
        <path
          key={i}
          d={h.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={h.w}
          strokeLinecap="round"
          opacity={h.o}
          className="rumput-helai"
          style={{ animationDelay: `${h.t}s` }}
        />
      ))}
    </svg>
  );
}

/**
 * ═══ UBUR-UBUR ═══
 *
 * Satu-satunya yang membawa warnanya sendiri, dan bentuk yang sudah dinilai
 * "sangat bagus" — jadi TIDAK diubah waktu yang lain digambar ulang.
 *
 * Denyutnya TIDAK simetris, dan itu hal terpenting di bentuk ini: payungnya
 * mengatup cepat lalu mengembang pelan, kira-kira 3 : 7. Dengan sinus biasa —
 * mengatup dan mengembang sama cepat — yang terbaca adalah benda yang
 * BERNAPAS, bukan berenang. Catatan yang sama ada di `assets/UburUbur.tsx`
 * versi 3D; alasannya tidak berubah cuma karena dimensinya berkurang.
 */
export function UburUbur({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} aria-hidden>
      <defs>
        <radialGradient id="pijarUbur" cx="50%" cy="34%" r="62%">
          <stop offset="0%" stopColor="#EAF6FF" stopOpacity=".95" />
          <stop offset="45%" stopColor="#9FD8F2" stopOpacity=".55" />
          <stop offset="100%" stopColor="#4FA3D8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo — inilah cahayanya, bukan hiasan di sekelilingnya */}
      <ellipse cx="60" cy="58" rx="56" ry="50" fill="url(#pijarUbur)" />

      {/* payung */}
      <path
        d="M14 66c0-26 21-46 46-46s46 20 46 46c0 8-3 13-8 12-6-2-9-8-15-8s-9 7-16 7-10-7-16-7-9 6-15 8c-5 1-8-4-8-12z"
        fill="#CFEBFB"
        opacity=".82"
      />
      <path
        d="M28 58c2-16 15-28 32-28s30 12 32 28c-8-8-19-13-32-13s-24 5-32 13z"
        fill="#FFFFFF"
        opacity=".5"
      />

      {/* juntaian — panjangnya berbeda-beda supaya tidak terbaca seperti sisir */}
      {[
        { d: "M32 78c-4 22 3 38-2 58s-6 34-1 46", o: 0.62 },
        { d: "M44 80c-3 26 4 40-1 58s-4 30 1 44", o: 0.72 },
        { d: "M60 82c0 30 6 44 1 62s-3 32 2 46", o: 0.8 },
        { d: "M76 80c3 26-4 40 1 58s4 30-1 44", o: 0.72 },
        { d: "M88 78c4 22-3 38 2 58s6 34 1 46", o: 0.62 },
      ].map((t, i) => (
        <path
          key={i}
          d={t.d}
          fill="none"
          stroke="#CFEBFB"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity={t.o}
          className="ubur-juntai"
          style={{ animationDelay: `${i * 0.22}s` }}
        />
      ))}
    </svg>
  );
}

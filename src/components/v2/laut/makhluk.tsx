/**
 * ═══ MAKHLUK LAUT, 2D ═══
 *
 * Aset di `assets/` semuanya mesh three.js dan tidak bisa dibawa ke sini.
 * Ini gambar baru, dan sengaja SILUET, bukan ilustrasi berdetail.
 *
 * Bukan karena lebih mudah — karena lebih benar. Di dalam air, cahaya habis
 * dari bawah ke atas: begitu turun beberapa puluh meter, yang tersisa dari
 * apa pun memang tinggal bentuknya. Menggambar sisik dan mata yang tajam lalu
 * menggelapkannya di kedalaman berarti menggambar sesuatu yang tidak akan
 * pernah terlihat. Siluet yang digelapkan tetap terbaca sebagai siluet.
 *
 * Karena itu semuanya memakai `currentColor`: warnanya ditentukan induknya,
 * dan induknya menurunkannya dari `kedalaman.ts`. Tidak ada satu pun warna
 * yang dipatok di berkas ini.
 *
 * Ubur-ubur satu-satunya yang punya warnanya sendiri, dan itu memang beda
 * jenis: ia tidak memantulkan cahaya, ia membuatnya.
 */

/* Lumba-lumba, menghadap kanan. Punggung melengkung, sirip punggung di
   sepertiga belakang, ekor bercabang mendatar. */
export function LumbaLumba({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 90" className={className} aria-hidden fill="currentColor">
      <path d="M8 52c14-22 44-38 78-38 22 0 38 6 50 16 6-9 14-15 22-17-3 9-4 17-2 24 8 6 14 13 18 20-8-2-16-2-24 1-14 12-34 19-56 19-30 0-58-9-78-25z" />
      <path d="M92 16c3-11 9-19 17-24-2 10-2 18 1 25z" opacity=".85" />
      <path d="M120 72c8 10 10 18 8 25-7-4-14-11-19-20z" opacity=".85" />
    </svg>
  );
}

/* Paus. Bukan pausnya yang di pantai — ini dilihat dari samping dan jauh,
   jadi yang penting cuma proporsi: kepala tumpul, badan panjang, sirip ekor
   lebar. */
export function Paus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 120" className={className} aria-hidden fill="currentColor">
      <path d="M12 66C12 38 56 18 118 18c56 0 104 16 132 34 12-12 26-20 42-24-8 14-12 26-11 38 1 12 5 23 11 34-16-4-30-12-42-24-28 18-76 34-132 34C56 110 12 92 12 66z" />
      <path d="M120 96c14 14 20 25 18 34-12-5-24-16-33-30z" opacity=".8" />
      <path d="M148 30c-6-14-6-24-1-31 8 7 14 18 17 31z" opacity=".7" />
    </svg>
  );
}

/* Terumbu karang bercabang. Tumbuh dari dasar bingkai ke atas. */
export function Terumbu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden fill="currentColor">
      <path d="M70 140c-4-30-2-54 6-72 4-9 4-18 0-27 9 4 15 12 17 24 3-14 9-24 19-30-4 12-4 23 1 33 6-8 14-12 24-13-9 8-14 17-15 28-1 12 2 23 9 33-14-4-24-2-30 6-4 6-6 12-6 18z" />
      <path d="M52 140c-8-22-12-40-10-54 1-10-1-19-6-27 10 3 17 10 21 21 2-11 7-19 15-24-4 11-4 21 0 30 5 11 6 29 4 54z" opacity=".78" />
      <path d="M104 140c2-18 6-31 12-39 4-6 5-12 3-19 7 4 11 10 12 19 2-9 6-15 13-19-3 9-3 17 0 24 3 8 3 20 1 34z" opacity=".62" />
    </svg>
  );
}

/**
 * Ubur-ubur. Satu-satunya yang membawa warnanya sendiri.
 *
 * Denyutnya TIDAK simetris, dan itu hal terpenting di bentuk ini: payungnya
 * mengatup cepat lalu mengembang pelan, kira-kira 3 : 7. Dengan sinus biasa —
 * mengatup dan mengembang sama cepat — yang terbaca adalah benda yang
 * BERNAPAS, bukan yang berenang. Catatan yang sama ada di
 * `assets/UburUbur.tsx` versi 3D; alasannya tidak berubah cuma karena
 * dimensinya berkurang.
 *
 * Perbandingan itu di sini diwujudkan lewat `cubic-bezier` yang berat
 * sebelah pada animasi `denyut` di turunan.css, bukan lewat keyframe yang
 * jaraknya diatur satu-satu.
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
        { x: 32, d: "M32 78c-4 22 3 38-2 58s-6 34-1 46", o: 0.62 },
        { x: 44, d: "M44 80c-3 26 4 40-1 58s-4 30 1 44", o: 0.72 },
        { x: 60, d: "M60 82c0 30 6 44 1 62s-3 32 2 46", o: 0.8 },
        { x: 76, d: "M76 80c3 26-4 40 1 58s4 30-1 44", o: 0.72 },
        { x: 88, d: "M88 78c4 22-3 38 2 58s6 34 1 46", o: 0.62 },
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

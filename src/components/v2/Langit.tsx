"use client";

import { useEffect, useRef, useState } from "react";
import { gradienLangit, type Waktu } from "./waktu";

/**
 * ═══ LANGIT YANG MENYILANG ═══
 *
 * Langit digambar sebagai gradien CSS di belakang canvas (canvas-nya
 * transparan — lihat catatan di OpeningScene.tsx tentang kenapa langit 3D
 * selalu gagal di sini).
 *
 * Masalahnya: gradien CSS TIDAK bisa dianimasikan. `background-image` bukan
 * properti yang bisa di-transition; mengubahnya berarti langit berganti dalam
 * satu frame. Sementara laut, pasir, dan lampu di dalam canvas bergeser halus
 * selama 1,5 detik. Hasilnya justru lebih buruk daripada kalau semuanya
 * melompat: langitnya sudah malam sementara lautnya masih siang.
 *
 * Jalan keluarnya: DUA lapis. Lapis bawah memegang langit lama, lapis atas
 * memegang langit baru dan opacity-nya dinaikkan dari 0 ke 1. Opacity memang
 * bisa dianimasikan. Setelah selesai, lapis atas turun jadi lapis bawah dan
 * yang atas dikosongkan, siap untuk peralihan berikutnya.
 *
 * Durasi transisinya sengaja disamakan dengan laju lerp di dalam canvas
 * (± 1,6 detik) supaya keduanya sampai bersamaan.
 */

export const DURASI_TRANSISI = 1600;

export default function Langit({ waktu }: { waktu: Waktu }) {
  const [bawah, setBawah] = useState<Waktu>(waktu);
  const [atas, setAtas] = useState<Waktu | null>(null);
  const [tampak, setTampak] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (waktu === bawah && !atas) return;
    if (timer.current) window.clearTimeout(timer.current);

    // pasang langit baru di lapis atas dengan opacity 0 …
    setAtas(waktu);
    setTampak(false);

    // … lalu naikkan di frame berikutnya, supaya transisinya benar-benar
    // berjalan. Kalau opacity 0 dan 1 diset di frame yang sama, browser
    // menggabungkannya dan tidak ada yang teranimasi.
    const mulai = requestAnimationFrame(() =>
      requestAnimationFrame(() => setTampak(true))
    );

    timer.current = window.setTimeout(() => {
      setBawah(waktu);
      setAtas(null);
      setTampak(false);
    }, DURASI_TRANSISI + 60);

    return () => {
      cancelAnimationFrame(mulai);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [waktu, bawah, atas]);

  return (
    <div className="lg" aria-hidden>
      <div className="lg-lapis" style={{ background: gradienLangit(bawah) }} />
      {atas && (
        <div
          className="lg-lapis lg-atas"
          style={{
            background: gradienLangit(atas),
            opacity: tampak ? 1 : 0,
            transitionDuration: `${DURASI_TRANSISI}ms`,
          }}
        />
      )}
    </div>
  );
}

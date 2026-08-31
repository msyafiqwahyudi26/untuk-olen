import type { Metadata } from "next";
import "./v2/v2.css";
import Opening from "@/components/v2/Opening";

export const metadata: Metadata = {
  title: "Len",
  robots: { index: false, follow: false },
};

/**
 * ═══ PINTU DEPAN ═══
 *
 * Layar pembuka: pantai 3D, empat waktu, montase suara Olen.
 *
 * Sampai 31 Agustus alamat ini masih menyajikan versi pertama, sementara
 * layar yang sudah dinilai 85% selesai bersembunyi di `/v2`. Akibatnya siapa
 * pun yang membuka alamatnya — termasuk Olen nanti — mendarat di versi lama
 * tanpa tahu ada yang lebih baru, sebab tidak ada satu pun tautan menuju ke
 * sana. Yang tersaji di akar adalah satu-satunya yang benar-benar dilihat
 * orang; layar terbaik yang harus diketik alamatnya sama saja belum ada.
 *
 * Isi layarnya sendiri tetap tinggal di `src/components/v2/`. Yang berpindah
 * hanya alamatnya. `/v2` masih bekerja dan mengalihkan ke sini, supaya
 * catatan di HANDOVER.md dan kebiasaan sesi sebelumnya tidak patah.
 * Versi pertama pindah ke `/v1` dan tetap bisa dibuka.
 */
export default function Beranda() {
  return (
    <main className="v2">
      <Opening />
    </main>
  );
}

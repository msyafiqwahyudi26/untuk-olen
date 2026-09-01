import type { Metadata } from "next";
import Galeri from "./Galeri";
import "./aset.css";

export const metadata: Metadata = {
  title: "Aset 3D untuk Olen",
  robots: { index: false, follow: false },
};

/**
 * Halaman kerja, bukan bagian dari cerita.
 *
 * Setiap aset 3D dipajang sendirian di atas panggung putar dengan lantai
 * netral. Gunanya satu: menilai bentuk sebuah model TANPA gangguan. Di dalam
 * scene, sebuah benda bisa terlihat salah karena sepuluh sebab — sudut
 * kamera, air yang memotongnya, benda lain yang menimpanya, warna latar.
 * Di sini cuma ada modelnya.
 *
 * Alur kerjanya: perbaiki di sini sampai bentuknya benar, baru pasang ke
 * scene. Bukan sebaliknya.
 */
export default function AsetPage() {
  return <Galeri />;
}

import type { Metadata } from "next";
import { BASIS } from "@/lib/basis";
import Gembok from "./Gembok";

export const metadata: Metadata = {
  title: "Len",
  robots: { index: false, follow: false },
};

/**
 * Halaman pintu. Satu-satunya yang boleh dibuka tanpa tiket.
 *
 * `ke` menyimpan alamat yang tadi hendak dibuka, supaya sesudah PIN benar
 * Olen mendarat di sana dan bukan di beranda. Nilainya datang dari URL, jadi
 * TIDAK boleh dipercaya begitu saja: alamat mutlak seperti
 * `https://situs-lain.example` akan berubah jadi lemparan ke luar. Hanya
 * jalur yang dimulai satu garis miring yang diterima.
 */
export default async function Masuk({
  searchParams,
}: {
  searchParams: Promise<{ ke?: string }>;
}) {
  const { ke } = await searchParams;
  const aman = ke && /^\/(?!\/)/.test(ke) ? ke : "/";
  return <Gembok ke={`${BASIS}${aman}`} />;
}

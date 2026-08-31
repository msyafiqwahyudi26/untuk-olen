import type { Metadata } from "next";
import "./v2.css";
import Opening from "@/components/v2/Opening";

export const metadata: Metadata = {
  title: "Memories of Olen",
  robots: { index: false, follow: false },
};

/**
 * v2 — sedang dibangun satu layar demi satu layar.
 * Sekarang baru layar pembuka: pantai siang, biru muda, gaya ilustrasi.
 * Perjalanan berikutnya: pantai → langit biru → luar angkasa.
 */
export default function V2() {
  return (
    <main className="v2">
      <Opening />
    </main>
  );
}

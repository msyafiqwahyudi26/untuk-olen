import { redirect } from "next/navigation";

/**
 * Layar pembuka pindah ke akar (`/`). Alamat ini dipertahankan sebagai
 * pengalihan, bukan dihapus: HANDOVER.md, AGENTS.md, dan catatan sesi-sesi
 * sebelumnya menyebut `/v2` puluhan kali, dan tautan yang mati akan terbaca
 * seolah layarnya yang hilang, bukan sekadar pindah.
 *
 * `redirect()` sudah memperhitungkan basePath, jadi tujuannya ditulis `/`
 * bukan `/len`.
 */
export default function V2() {
  redirect("/");
}

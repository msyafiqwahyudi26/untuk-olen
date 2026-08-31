import { getThings, getMoments, getShifts, getQuotes, getStars, getStarLinks, getNotes } from "@/lib/db";
import { HERO, CLOSING } from "../../../content/story";
import Scene from "@/components/Scene";
import { Hero, Things, Moments, Shifts, Quotes, Sky, Dawn } from "@/components/Chapters";

/* dibaca dari SQLite tiap request, supaya catatan yang baru ditulis langsung muncul */
export const dynamic = "force-dynamic";

/**
 * ═══ VERSI PERTAMA ═══
 *
 * Dulu ini yang tersaji di akar. Sekarang akar diisi layar pembuka v2, dan
 * versi ini pindah ke sini.
 *
 * TIDAK dibuang, dan itu disengaja. Tiga alasan:
 *
 * 1. Isinya nyata — 10 momen, 18 kutipan, 13 bintang — dan sebagian akan
 *    dipakai ulang di layar-layar v2 yang belum dibangun.
 * 2. `NoteSpace` dan tabel `notes` di sini adalah rangka ruang tulis Olen
 *    yang menurut HANDOVER harus DIPAKAI LAGI, bukan dibangun ulang, untuk
 *    layar jurnal ke arah langit.
 * 3. Pilihan kutipannya pernah dinilai "jelek banget" dan belum dibongkar
 *    ulang. Membandingkan yang baru dengan yang lama jadi mustahil kalau
 *    yang lama sudah tidak bisa dibuka.
 */
export default function V1() {
  const things = getThings();
  const moments = getMoments();
  const shifts = getShifts();
  const quotes = getQuotes();
  const stars = getStars();
  const links = getStarLinks();
  const notes = getNotes();

  return (
    <>
      <Scene />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero name={HERO.name} lines={HERO.lines} cue={HERO.cue} />
        <Things items={things} />
        <Moments items={moments} />
        <Shifts items={shifts} />
        <Quotes items={quotes} />
        <Sky stars={stars} links={links} />
        <Dawn closing={CLOSING} notes={notes} />
      </main>
    </>
  );
}

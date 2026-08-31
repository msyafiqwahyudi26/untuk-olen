import { getThings, getMoments, getShifts, getQuotes, getStars, getStarLinks, getNotes } from "@/lib/db";
import { HERO, CLOSING } from "../../content/story";
import Scene from "@/components/Scene";
import { Hero, Things, Moments, Shifts, Quotes, Sky, Dawn } from "@/components/Chapters";

/* dibaca dari SQLite tiap request, supaya catatan yang baru ditulis langsung muncul */
export const dynamic = "force-dynamic";

export default function Page() {
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

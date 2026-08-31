"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import Constellation from "./Constellation";
import NoteSpace from "./NoteSpace";
import type { ThingRow, MomentRow, ShiftRow, QuoteRow, StarRow, NoteRow } from "@/lib/db";

/* ─────────────────── kerangka bab ─────────────────── */

function Chapter({
  id,
  eyebrow,
  title,
  lede,
  children,
  narrow,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <section
      id={id}
      style={{ padding: "clamp(7rem,17vh,12rem) 0", position: "relative" }}
    >
      <div style={{ width: "min(1080px, 88vw)", margin: "0 auto" }}>
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: "1.1rem" }}>
            {eyebrow}
          </div>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="chapter-title" style={{ marginBottom: lede ? "1.4rem" : "3rem", maxWidth: "16ch" }}>
            {title}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={170}>
            <p className="lede" style={{ marginBottom: "clamp(3rem,7vh,5rem)" }}>
              {lede}
            </p>
          </Reveal>
        )}
        <div style={narrow ? { maxWidth: 720 } : undefined}>{children}</div>
      </div>
    </section>
  );
}

/* ─────────────────── pembuka ─────────────────── */

export function Hero({ name, lines, cue }: { name: string; lines: string[]; cue: string }) {
  /* Sengaja tanpa state: animasinya murni CSS, jadi pembuka tetap terbaca
     walau JavaScript gagal dimuat atau animasi dimatikan di sistem. */
  return (
    <header
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div style={{ width: "min(1080px, 88vw)", margin: "0 auto" }}>
        <h1
          className="serif fade-in run"
          style={{
            fontSize: "clamp(4.5rem, 21vw, 15rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.045em",
            fontWeight: 400,
            animationDelay: "150ms",
            animationDuration: "1.8s",
          }}
        >
          {name}
        </h1>
        <div style={{ maxWidth: "46ch", marginTop: "clamp(2rem,5vh,3.4rem)" }}>
          {lines.map((l, i) => (
            <p
              key={i}
              className="fade-in run"
              style={{
                color: i === 0 ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: i === 0 ? "clamp(1.05rem,2.2vw,1.3rem)" : "clamp(.9rem,1.7vw,1.02rem)",
                lineHeight: 1.8,
                marginTop: i === 0 ? 0 : "1rem",
                animationDelay: `${650 + i * 300}ms`,
              }}
            >
              {l}
            </p>
          ))}
        </div>
      </div>

      <div
        className="fade-in run"
        style={{
          position: "absolute",
          bottom: "3.2rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          animationDelay: "1600ms",
        }}
      >
        <div style={{ fontSize: ".64rem", letterSpacing: ".3em", textTransform: "uppercase", color: "var(--text-dim)" }}>
          {cue}
        </div>
        <div
          style={{
            width: 1,
            height: 42,
            margin: "14px auto 0",
            background: "linear-gradient(rgba(244,228,176,.6), transparent)",
            animation: "cueDrift 3.4s ease-in-out infinite",
          }}
        />
      </div>
    </header>
  );
}

/* ─────────────────── bab 1 — garis pantai ─────────────────── */

export function Things({ items }: { items: ThingRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Chapter
      id="menempel"
      eyebrow="Garis pantai"
      title="Yang menempel"
      lede="Orang biasanya dikenal dari hal besar. Kamu enggak. Kamu dikenal dari hal-hal ini — yang kelihatannya kecil, tapi konsisten selama tiga tahun."
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {items.map((t, i) => {
          const on = open === t.key;
          return (
            <Reveal as="li" key={t.key} delay={i * 55}>
              <div
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  paddingLeft: `min(${(t.x * 24).toFixed(1)}%, 180px)`,
                }}
              >
                <button
                  onClick={() => setOpen(on ? null : t.key)}
                  aria-expanded={on}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "1.2rem",
                    padding: "1.35rem 0",
                    background: "none",
                    border: "none",
                    color: "inherit",
                    textAlign: "left",
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  <span
                    style={{
                      fontSize: ".62rem",
                      letterSpacing: ".18em",
                      color: on ? "var(--star-gold)" : "var(--text-dim)",
                      minWidth: "2ch",
                      transition: "color .4s",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="serif"
                    style={{
                      fontSize: "clamp(1.15rem,2.6vw,1.6rem)",
                      color: on ? "var(--star-gold)" : "var(--text-primary)",
                      transition: "color .4s var(--ease)",
                      flex: 1,
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      fontSize: ".8rem",
                      color: "var(--text-dim)",
                      transform: on ? "rotate(45deg)" : "none",
                      transition: "transform .5s var(--ease)",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: on ? "1fr" : "0fr",
                    transition: "grid-template-rows .6s var(--ease)",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <p
                      style={{
                        paddingLeft: "calc(2ch + 1.2rem)",
                        paddingBottom: "1.6rem",
                        maxWidth: "56ch",
                        color: "var(--text-muted)",
                        fontSize: ".93rem",
                        lineHeight: 1.85,
                        opacity: on ? 1 : 0,
                        transition: "opacity .5s var(--ease)",
                      }}
                    >
                      {t.body}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Chapter>
  );
}

/* ─────────────────── bab 2 — turun ─────────────────── */

export function Moments({ items }: { items: MomentRow[] }) {
  return (
    <Chapter
      id="lewati"
      eyebrow="Turun"
      title="Yang sudah kamu lewati"
      lede="Nggak ada yang bisa lihat dirinya sendiri tumbuh — terlalu dekat. Jadi ini dicatat dari luar, apa adanya, dengan tanggalnya."
    >
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: "0 0 0 clamp(1.4rem, 4vw, 2.6rem)",
          position: "relative",
          borderLeft: "1px solid rgba(244,228,176,0.16)",
          maxWidth: 760,
        }}
      >
        {items.map((m, i) => (
          <Reveal as="li" key={m.key} delay={40} className="relative">
            <div style={{ paddingBottom: "clamp(3rem,7vh,4.5rem)", position: "relative" }}>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "calc(-1 * clamp(1.4rem, 4vw, 2.6rem) - 3.5px)",
                  top: ".55rem",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--star-gold)",
                  boxShadow: "0 0 10px rgba(244,228,176,.6)",
                }}
              />
              <div className="eyebrow" style={{ marginBottom: ".7rem", opacity: 0.5 }}>
                {m.date}
              </div>
              <h3
                className="serif"
                style={{ fontSize: "clamp(1.25rem,2.9vw,1.75rem)", lineHeight: 1.25, marginBottom: ".8rem" }}
              >
                {m.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: ".95rem", lineHeight: 1.85, maxWidth: "54ch" }}>
                {m.body}
              </p>

              {m.said && (
                <p
                  className="serif"
                  style={{
                    marginTop: "1.2rem",
                    paddingLeft: "1.1rem",
                    borderLeft: "1px solid rgba(244,228,176,0.28)",
                    fontStyle: "italic",
                    fontSize: "1rem",
                    color: "rgba(244,228,176,0.82)",
                    maxWidth: "48ch",
                  }}
                >
                  “{m.said}”
                </p>
              )}

              {m.photo && (
                <figure style={{ margin: "1.6rem 0 0", maxWidth: 330 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/memori/${m.photo}`}
                    alt={m.title}
                    loading="lazy"
                    className="gc"
                    style={{ width: "100%", borderRadius: "var(--r-md)", display: "block" }}
                  />
                </figure>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </Chapter>
  );
}

/* ─────────────────── bab 3 — dasar ─────────────────── */

export function Shifts({ items }: { items: ShiftRow[] }) {
  return (
    <Chapter
      id="berubah"
      eyebrow="Dasar"
      title="Yang berubah"
      lede="Perubahan jarang terasa waktu sedang terjadi. Baru kelihatan kalau dua titiknya ditaruh bersebelahan."
    >
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {items.map((s, i) => (
          <Reveal key={i} delay={i * 70}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "clamp(1rem,3vw,2.4rem)",
                alignItems: "center",
                padding: "clamp(1.5rem,3.5vh,2.2rem) 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
              className="shift-row"
            >
              <p style={{ color: "var(--text-dim)", fontSize: ".92rem", lineHeight: 1.7 }}>{s.then_text}</p>
              <span
                aria-hidden
                style={{ color: "rgba(244,228,176,0.4)", fontSize: ".9rem", letterSpacing: ".1em" }}
              >
                →
              </span>
              <p
                className="serif"
                style={{ color: "var(--text-primary)", fontSize: "1.02rem", lineHeight: 1.65 }}
              >
                {s.now_text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Chapter>
  );
}

/* ─────────────────── bab 4 — naik ─────────────────── */

export function Quotes({ items }: { items: QuoteRow[] }) {
  return (
    <Chapter
      id="kalimat"
      eyebrow="Naik"
      title="Kalimatmu sendiri"
      lede="Semua ini kamu yang ketik. Cuma dirapikan ejaannya, nggak ada yang ditambahin."
    >
      <div style={{ columnGap: "clamp(1.2rem,3vw,2.6rem)" }} className="quote-cols">
        {items.map((q, i) => {
          const heavy = q.weight === "heavy";
          return (
            <Reveal key={i} delay={(i % 4) * 60}>
              <figure
                className="tilt-wrap"
                style={{ breakInside: "avoid", marginBottom: "clamp(1.2rem,3vw,2rem)" }}
              >
                <div
                  className={heavy ? "gc-hi tilt" : "tilt"}
                  style={{
                    borderRadius: "var(--r-lg)",
                    padding: heavy ? "clamp(1.5rem,3.4vw,2.1rem)" : "1.1rem 0",
                    borderTop: heavy ? undefined : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <blockquote
                    className="serif"
                    style={{
                      fontSize: heavy ? "clamp(1.1rem,2.4vw,1.35rem)" : "clamp(.98rem,2vw,1.06rem)",
                      lineHeight: heavy ? 1.6 : 1.7,
                      color: heavy ? "var(--text-primary)" : "rgba(200,225,245,0.78)",
                      fontStyle: heavy ? "normal" : "italic",
                    }}
                  >
                    {q.text}
                  </blockquote>
                  <figcaption
                    style={{
                      marginTop: heavy ? "1.2rem" : ".8rem",
                      fontSize: ".64rem",
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: heavy ? "rgba(244,228,176,0.6)" : "var(--text-dim)",
                    }}
                  >
                    {q.date}
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </Chapter>
  );
}

/* ─────────────────── bab 5 — langit ─────────────────── */

export function Sky({ stars, links }: { stars: StarRow[]; links: { a: string; b: string }[] }) {
  return (
    <Chapter
      id="langit"
      eyebrow="Langit"
      title="Yang nggak hilang"
      lede="Tiga belas hal yang disimpan di atas. Ada yang berfoto, ada yang cuma percakapan, dan tiga yang bersuara — bintang bercincin itu bisa didengar. Sentuh salah satu."
    >
      <Reveal>
        <Constellation stars={stars} links={links} />
      </Reveal>
    </Chapter>
  );
}

/* ─────────────────── penutup — fajar ─────────────────── */

export function Dawn({
  closing,
  notes,
}: {
  closing: { title: string; paragraphs: string[]; noteInvite: string; sign: string };
  notes: NoteRow[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <footer ref={ref} style={{ padding: "clamp(7rem,17vh,12rem) 0 clamp(5rem,10vh,8rem)" }}>
      <div style={{ width: "min(680px, 88vw)", margin: "0 auto" }}>
        <Reveal>
          <div className="eyebrow" style={{ marginBottom: "1.2rem" }}>
            Fajar
          </div>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="chapter-title" style={{ marginBottom: "2.4rem" }}>
            {closing.title}
          </h2>
        </Reveal>

        {closing.paragraphs.map((p, i) => (
          <Reveal key={i} delay={140 + i * 80}>
            <p
              className={i === closing.paragraphs.length - 1 ? "serif" : undefined}
              style={{
                fontSize:
                  i === closing.paragraphs.length - 1 ? "clamp(1.2rem,3vw,1.6rem)" : "clamp(.97rem,1.9vw,1.06rem)",
                lineHeight: i === closing.paragraphs.length - 1 ? 1.5 : 1.9,
                color: i === closing.paragraphs.length - 1 ? "var(--star-gold)" : "var(--text-muted)",
                marginBottom: "1.5rem",
                fontStyle: i === closing.paragraphs.length - 1 ? "italic" : "normal",
              }}
            >
              {p}
            </p>
          </Reveal>
        ))}

        <Reveal delay={200}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "clamp(3rem,7vh,4.5rem) 0 2.2rem" }} />
          <p style={{ fontSize: ".9rem", color: "var(--text-muted)", marginBottom: "1.6rem" }}>
            {closing.noteInvite}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <NoteSpace initial={notes} />
        </Reveal>

        <Reveal delay={320}>
          <p
            className="serif"
            style={{
              marginTop: "clamp(4rem,9vh,6rem)",
              fontSize: ".92rem",
              fontStyle: "italic",
              color: "var(--text-dim)",
            }}
          >
            {closing.sign}
          </p>
        </Reveal>
      </div>
    </footer>
  );
}

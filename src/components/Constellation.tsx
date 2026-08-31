"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StarRow } from "@/lib/db";
import { aset } from "@/lib/basis";

type Props = { stars: StarRow[]; links: { a: string; b: string }[] };

/**
 * Peta bintang. Bukan hiasan — tiap bintang adalah satu hal yang disimpan.
 * SVG (bukan WebGL) supaya bisa diklik, dibaca screen reader, dan ringan di HP.
 */
export default function Constellation({ stars, links }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number; r: number }>();
    stars.forEach((s) => {
      m.set(s.key, {
        x: 50 + s.ra * 44,
        y: 78 - s.dec * 62,
        r: 0.9 + s.mag * 0.85,
      });
    });
    return m;
  }, [stars]);

  /* garis digambar satu per satu saat peta masuk layar */
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        links.forEach((_, i) => setTimeout(() => setDrawn((d) => Math.max(d, i + 1)), 260 + i * 110));
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [links]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeStar = stars.find((s) => s.key === active) ?? null;
  const isLinked = (l: { a: string; b: string }) => active && (l.a === active || l.b === active);

  return (
    <div ref={wrap} className="relative w-full">
      <svg
        viewBox="0 0 100 84"
        className="w-full"
        style={{ overflow: "visible" }}
        role="group"
        aria-label="Peta bintang memori"
      >
        {links.map((l, i) => {
          const a = pos.get(l.a);
          const b = pos.get(l.b);
          if (!a || !b) return null;
          const on = i < drawn;
          return (
            <line
              key={`${l.a}-${l.b}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isLinked(l) ? "rgba(244,228,176,0.62)" : "rgba(244,228,176,0.20)"}
              strokeWidth={isLinked(l) ? 0.28 : 0.14}
              strokeDasharray="220"
              strokeDashoffset={on ? 0 : 220}
              style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1), stroke .45s, stroke-width .45s" }}
            />
          );
        })}

        {stars.map((s) => {
          const p = pos.get(s.key)!;
          const on = active === s.key;
          return (
            <g
              key={s.key}
              onClick={() => setActive(on ? null : s.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(on ? null : s.key);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={on}
              aria-label={s.title}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <circle cx={p.x} cy={p.y} r={p.r * 3.6} fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={p.r * (on ? 2.6 : 2.1)}
                fill={on ? "rgba(244,228,176,0.16)" : "rgba(244,228,176,0.05)"}
                style={{ transition: "all .45s cubic-bezier(.22,1,.36,1)" }}
              />
              {/* bintang bersuara dapat cincin tipis — penanda bahwa ada yang bisa didengar */}
              {s.audio && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r * 1.9}
                  fill="none"
                  stroke="rgba(244,228,176,0.45)"
                  strokeWidth={0.12}
                  style={{ animation: "breathe 4.5s ease-in-out infinite" }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.r * (on ? 1.15 : 1)}
                fill={on ? "#F4E4B0" : s.photo || s.audio ? "#EDF4FF" : "rgba(220,235,255,0.62)"}
                style={{ transition: "all .45s cubic-bezier(.22,1,.36,1)" }}
              />
              <circle cx={p.x - p.r * 0.28} cy={p.y - p.r * 0.28} r={p.r * 0.38} fill="rgba(255,255,255,0.92)" />
              <text
                x={p.x}
                y={p.y + p.r + 3.2}
                textAnchor="middle"
                fontSize="1.85"
                fontFamily="Outfit, sans-serif"
                fill={on ? "rgba(244,228,176,0.92)" : "rgba(200,225,245,0.34)"}
                style={{ pointerEvents: "none", transition: "fill .4s" }}
              >
                {s.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* panel isi bintang */}
      <div
        className="mt-8 md:mt-4 md:absolute md:right-0 md:bottom-0 md:w-[340px]"
        style={{ minHeight: activeStar ? undefined : 0 }}
      >
        {activeStar ? (
          <figure
            key={activeStar.key}
            className="gc-hi overflow-hidden"
            style={{ borderRadius: "var(--r-lg)", animation: "fadeInScale .5s cubic-bezier(.22,1,.36,1) both" }}
          >
            {activeStar.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aset(`/memori/${activeStar.photo}`)}
                alt={activeStar.title}
                className="block w-full"
                style={{ maxHeight: 260, objectFit: "cover" }}
                loading="lazy"
              />
            ) : null}
            <figcaption style={{ padding: "18px 20px 20px" }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                {activeStar.date}
              </div>
              <h4 className="serif" style={{ fontSize: "1.08rem", marginBottom: 8, lineHeight: 1.35 }}>
                {activeStar.title}
              </h4>
              <p style={{ fontSize: ".86rem", lineHeight: 1.75, color: "var(--text-muted)" }}>{activeStar.body}</p>

              {activeStar.audio && (
                <audio
                  key={activeStar.audio}
                  controls
                  preload="none"
                  style={{ width: "100%", marginTop: 16, height: 34 }}
                >
                  {/* .m4a dulu supaya Safari/iOS ikut jalan, .opus untuk sisanya */}
                  <source src={aset(`/memori/vn/${activeStar.audio}.m4a`)} type="audio/mp4" />
                  <source src={aset(`/memori/vn/${activeStar.audio}.opus`)} type="audio/ogg; codecs=opus" />
                </audio>
              )}

              <button
                onClick={() => setActive(null)}
                style={{
                  marginTop: 16,
                  fontSize: ".66rem",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                tutup
              </button>
            </figcaption>
          </figure>
        ) : (
          <p
            className="md:text-right"
            style={{ fontSize: ".72rem", letterSpacing: ".16em", color: "var(--text-dim)" }}
          >
            sentuh salah satu bintang
          </p>
        )}
      </div>
    </div>
  );
}

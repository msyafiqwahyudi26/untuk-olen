"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import World from "./World";
import { journey } from "@/lib/journey";

/**
 * Latar 3D yang menempel di layar. Semua teks mengalir di atasnya.
 * Scroll halaman → journey.target → kamera bergerak menyusuri pantai.
 */
export default function Scene() {
  const [quality, setQuality] = useState<"low" | "high" | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const smallScreen = window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    setQuality(smallScreen || cores <= 4 || mem <= 4 ? "low" : "high");
  }, []);

  /* scroll → progress */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      journey.set(max > 0 ? window.scrollY / max : 0);
    };
    const onPointer = (e: PointerEvent) => {
      journey.px = (e.clientX / window.innerWidth - 0.5) * 2;
      journey.py = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      journey.px = Math.max(-1, Math.min(1, e.gamma / 35));
      journey.py = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  if (reduced) return <StaticBackdrop />;
  if (!quality) return <StaticBackdrop />;

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={quality === "high" ? [1, 1.9] : [1, 1.4]}
        camera={{ position: [0, 2.4, 26], fov: 52, near: 0.1, far: 700 }}
        gl={{ antialias: quality === "high", powerPreference: "high-performance", alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <World quality={quality} />
      </Canvas>
      {/* scrim tipis — menjamin teks tetap terbaca tanpa menutupi pemandangan */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 80% at 50% 6%, rgba(1,6,16,0.10) 30%, rgba(1,6,16,0.62) 100%)," +
            "linear-gradient(180deg, rgba(1,6,16,0.34) 0%, rgba(1,6,16,0.18) 42%, rgba(1,6,16,0.40) 100%)",
        }}
      />
    </div>
  );
}

/** Cadangan statis: perangkat tanpa WebGL, atau pengguna yang mematikan animasi. */
function StaticBackdrop() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(180deg,#010610 0%,#020C1E 26%,#061428 48%,#0B1E3C 72%,#0E2848 100%)",
      }}
    />
  );
}

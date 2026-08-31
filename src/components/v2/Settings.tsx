"use client";

import { useEffect, useRef } from "react";
import { URUT, NAMA, type Waktu } from "./waktu";

/**
 * Panel pengaturan di pojok kanan atas.
 *
 * Isinya sengaja sedikit. Ini halaman untuk dibuka dan didengarkan, bukan
 * aplikasi untuk disetel — tiap tombol tambahan mengambil sedikit perhatian
 * dari hal yang sebenarnya ingin ditunjukkan. Yang ada di sini cuma yang
 * benar-benar dipakai: cara mendiamkan, cara mengatur tiap lapis suara, dan
 * cara memilih waktu.
 *
 * Bahasanya Inggris, mengikuti aturan tulisan di AGENTS.md.
 */

export type Pengaturan = {
  bisu: boolean;
  ombak: boolean;
  lagu: boolean;
  waktu: Waktu;
  /** true = ikut jam di komputer Olen; false = dipilih sendiri */
  waktuOtomatis: boolean;
};

export default function Settings({
  buka,
  onBuka,
  nilai,
  onUbah,
}: {
  buka: boolean;
  onBuka: (b: boolean) => void;
  nilai: Pengaturan;
  onUbah: (p: Partial<Pengaturan>) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // tutup kalau diklik di luar atau ditekan Esc — panel yang tidak bisa
  // ditutup dengan gerakan wajar akan terasa seperti tersangkut
  useEffect(() => {
    if (!buka) return;
    const luar = (e: PointerEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) onBuka(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onBuka(false);
    window.addEventListener("pointerdown", luar);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", luar);
      window.removeEventListener("keydown", esc);
    };
  }, [buka, onBuka]);

  return (
    <div className="st" ref={panel}>
      <button
        className={`ui-bulat z-atas st-buka ui-masuk tunda-6${buka ? " on" : ""}`}
        onClick={() => onBuka(!buka)}
        aria-expanded={buka}
        aria-label="Settings"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3.6v2.2M12 18.2v2.2M20.4 12h-2.2M5.8 12H3.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6M17.9 17.9l-1.6-1.6M7.7 7.7L6.1 6.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {buka && (
        <div className="ui-panel st-panel" role="dialog" aria-label="Settings">
          <p className="ui-panel-judul">Sound</p>

          <label className="ui-baris">
            <span>Everything</span>
            <input
              type="checkbox"
              checked={!nilai.bisu}
              onChange={(e) => onUbah({ bisu: !e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <label className={`ui-baris${nilai.bisu ? " mati" : ""}`}>
            <span>Waves</span>
            <input
              type="checkbox"
              checked={nilai.ombak}
              disabled={nilai.bisu}
              onChange={(e) => onUbah({ ombak: e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <label className={`ui-baris${nilai.bisu ? " mati" : ""}`}>
            <span>Music</span>
            <input
              type="checkbox"
              checked={nilai.lagu}
              disabled={nilai.bisu}
              onChange={(e) => onUbah({ lagu: e.target.checked })}
            />
            <span className="ui-sakelar" aria-hidden />
          </label>

          <p className="ui-panel-judul st-pisah">Light</p>

          <div className="ui-deret">
            {URUT.map((w) => (
              <button
                key={w}
                className={`ui-pilih${!nilai.waktuOtomatis && nilai.waktu === w ? " on" : ""}`}
                onClick={() => onUbah({ waktu: w, waktuOtomatis: false })}
              >
                {NAMA[w]}
              </button>
            ))}
            <button
              className={`ui-pilih ui-lebar${nilai.waktuOtomatis ? " on" : ""}`}
              onClick={() => onUbah({ waktuOtomatis: true })}
            >
              Follow the clock
            </button>
          </div>

          <p className="ui-catatan st-catatan">
            {nilai.waktuOtomatis
              ? `Right now it is ${NAMA[nilai.waktu].toLowerCase()} where you are.`
              : "Set by hand. Tap “Follow the clock” to let it drift again."}
          </p>
        </div>
      )}
    </div>
  );
}

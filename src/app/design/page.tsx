import type { Metadata } from "next";
import "./design.css";
import { URUT, NAMA, PALET, gradienLangit } from "@/components/v2/waktu";
import { RIAS, PANEL, latarZona, variabelTema, TINTA, type Zona } from "@/design/tema";
import { kontras, tumpuk } from "@/design/warna";

export const metadata: Metadata = {
  title: "Design system untuk Olen",
  robots: { index: false, follow: false },
};

/**
 * Rujukan hidup, bukan dokumentasi.
 *
 * Sama gunanya dengan /aset untuk model 3D: kalau sebuah kontrol terlihat
 * salah di sini, ia salah — tidak perlu membuka layar cerita untuk tahu. Dan
 * kalau palet waktu diubah, halaman ini yang pertama menunjukkan akibatnya.
 *
 * Semuanya dirender empat kali, satu per waktu, dengan langit dan pasir yang
 * sebenarnya di belakangnya. Itu bagian yang penting: kontrol yang dinilai di
 * atas latar abu-abu selalu terlihat baik-baik saja.
 */

const ZONA: { z: Zona; nama: string; apa: string }[] = [
  { z: "atas", nama: "z-atas", apa: "pojok atas · latar langit teratas" },
  { z: "aksi", nama: "z-aksi", apa: "tengah layar · latar langit tengah" },
  { z: "bawah", nama: "z-bawah", apa: "dasar layar · latar PASIR" },
];

const KACA_LAMA = 0.16;

function Ikon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path
        d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M15.4 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Design() {
  return (
    <main className="ds">
      <header className="ds-kepala">
        <p className="ds-kicker">untuk Olen</p>
        <h1>Design system</h1>
        <p className="ds-lede">
          Satu aturan yang menjelaskan hampir semua isi halaman ini:{" "}
          <strong>kalau sebuah angka bisa diturunkan dari angka lain, turunkan.</strong>{" "}
          Warna tombol tidak dipilih. Ia dihitung dari langit di belakangnya.
          Ukuran tidak ditebak. Ia diambil dari tangga yang sudah ada.
        </p>
      </header>

      {/* ─────────────────────────────────────────────────────────── */}
      <section className="ds-bab">
        <h2>Kenapa warna chrome tidak boleh dipatok</h2>
        <p className="ds-teks">
          Semua tombol di layar pembuka putih di atas kaca putih 16%. Itu benar
          waktu langitnya cuma satu. Sekarang langitnya empat, dan di pagi serta
          golden hour dasar layar hampir putih. Angka di bawah dihitung, bukan
          dikira-kira. Ambang untuk teks kecil adalah 4,5&nbsp;:&nbsp;1.
        </p>

        <div className="ds-tabel-bungkus">
          <table className="ds-tabel">
            <thead>
              <tr>
                <th>zona</th>
                <th>waktu</th>
                <th>latar</th>
                <th>sebelum</th>
                <th>sesudah</th>
                <th>kaca yang dipakai</th>
              </tr>
            </thead>
            <tbody>
              {ZONA.map(({ z, nama }) =>
                URUT.map((w) => {
                  const latar = latarZona(w, z);
                  const lama = kontras(TINTA, tumpuk(TINTA, KACA_LAMA, latar));
                  const r = RIAS[w][z];
                  return (
                    <tr key={`${z}-${w}`}>
                      <td><code>{nama}</code></td>
                      <td>{NAMA[w]}</td>
                      <td>
                        <span className="ds-chip" style={{ background: latar }} />
                        <code>{latar}</code>
                      </td>
                      <td className={lama < 4.5 ? "ds-buruk" : "ds-baik"}>{lama.toFixed(2)}</td>
                      <td className={r.rasio < 4.5 ? "ds-buruk" : "ds-baik"}>{r.rasio.toFixed(2)}</td>
                      <td><code>{r.kaca}</code></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="ds-teks ds-kecil">
          Perhatikan golden hour di panel settings: hitungannya berhenti di{" "}
          <code>{PANEL.sore.kaca}</code>, persis nilai yang dulu disetel dengan
          tangan sampai terasa pas. Yang berubah bukan hasilnya, melainkan
          bahwa sekarang ada alasannya.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      <section className="ds-bab">
        <h2>Kontrol di atas langitnya sendiri</h2>
        <p className="ds-teks">
          Tiap kotak adalah satu waktu, dengan langit dan pasir yang sebenarnya.
          Kontrol yang sama, warna yang berbeda, dan yang berbeda cuma kacanya,
          tulisannya tetap putih di keempatnya.
        </p>

        <div className="ds-langit-baris">
          {URUT.map((w) => (
            <figure
              key={w}
              className="ds-langit"
              style={{
                ...(variabelTema(w) as React.CSSProperties),
                backgroundImage: gradienLangit(w),
              }}
            >
              <div className="ds-pasir" style={{ background: PALET[w].pasir.dry }} />

              <div className="ds-slot ds-slot-atas">
                <button className="ui-pil z-atas ds-mini" type="button">
                  <Ikon />
                  <span>sound on</span>
                </button>
                <button className="ui-bulat z-atas" type="button" aria-label="Settings">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                    <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M12 3.6v2.2M12 18.2v2.2M20.4 12h-2.2M5.8 12H3.6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="ds-slot ds-slot-aksi">
                <p className="ui-kicker">Memories of</p>
                <button className="ui-pil ui-besar z-aksi" type="button">
                  The Memory of Voice
                </button>
              </div>

              <div className="ds-slot ds-slot-bawah">
                <button className="ui-pil z-bawah ds-mini" type="button">
                  keep going
                </button>
              </div>

              <figcaption>{NAMA[w]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      <section className="ds-bab">
        <h2>Panel</h2>
        <p className="ds-teks">
          Panel tidak ikut zona. Isinya teks kecil berbaris-baris yang dibaca
          lama, bukan satu kata sekilas, jadi ambangnya 7&nbsp;:&nbsp;1.
        </p>
        <div className="ds-langit-baris">
          {URUT.map((w) => (
            <figure
              key={w}
              className="ds-langit ds-langit-tinggi"
              style={{
                ...(variabelTema(w) as React.CSSProperties),
                backgroundImage: gradienLangit(w),
              }}
            >
              <div className="ui-panel ds-panel">
                <p className="ui-panel-judul">Sound</p>
                <label className="ui-baris">
                  <span>Everything</span>
                  <input type="checkbox" defaultChecked readOnly />
                  <span className="ui-sakelar" aria-hidden />
                </label>
                <label className="ui-baris mati">
                  <span>Waves</span>
                  <input type="checkbox" readOnly />
                  <span className="ui-sakelar" aria-hidden />
                </label>
                <p className="ui-panel-judul" style={{ marginTop: "1rem" }}>Light</p>
                <div className="ui-deret">
                  {URUT.map((x) => (
                    <button key={x} type="button" className={`ui-pilih${x === w ? " on" : ""}`}>
                      {NAMA[x]}
                    </button>
                  ))}
                </div>
                <p className="ui-catatan" style={{ marginTop: ".75rem" }}>
                  {PANEL[w].rasio.toFixed(2)} : 1 · {PANEL[w].kaca}
                </p>
              </div>
              <figcaption>{NAMA[w]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      <section className="ds-bab">
        <h2>Tulisan</h2>
        <p className="ds-teks">
          Dua huruf, empat peran. Fraunces hanya untuk nama dan judul; Outfit
          untuk sisanya. Tiap tulisan baru harus jadi salah satu dari empat
          peran ini. Kalau tidak ada yang cocok, itu tanda perannya belum
          jelas, bukan tanda perlu ukuran baru.
        </p>
        <div
          className="ds-huruf"
          style={{ ...(variabelTema("siang") as React.CSSProperties), backgroundImage: gradienLangit("siang") }}
        >
          <p className="ui-kicker">ui-kicker · label kecil, direnggangkan jauh</p>
          <h3 className="ui-nama ds-nama-kecil">Olen</h3>
          <p className="ds-tanda">ui-nama · dipakai sekali per layar</p>
          <h4 className="ui-judul">Judul bagian</h4>
          <p className="ds-tanda">ui-judul</p>
          <p className="ui-catatan">
            ui-catatan · kalimat pendek di bawah tombol, tidak pernah lebih dari dua baris
          </p>
        </div>
        <p className="ds-teks ds-kecil">
          Nama besar sengaja tidak ikut aturan kontras. Rasionya{" "}
          {kontras(TINTA, PALET.siang.langit[1]).toFixed(2)} : 1 di langit siang, dan itu
          dibiarkan: ukurannya 15rem, ia dibaca sebagai bentuk bukan sebagai
          teks. Aturan kontras ada untuk barang yang <em>dipakai</em>. Nama itu
          tidak dipakai, ia dilihat.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      <section className="ds-bab">
        <h2>Jarak, lengkung, tempo</h2>
        <p className="ds-teks">
          Semuanya kelipatan 4. Bukan karena angka bulat itu indah, tapi karena
          setengah piksel di batas elemen membuat garis 1px kadang tebal kadang
          tipis.
        </p>

        <div className="ds-baris-token">
          {[
            ["--j1", 4], ["--j2", 8], ["--j3", 12], ["--j4", 16],
            ["--j5", 24], ["--j6", 32], ["--j7", 48], ["--j8", 64],
          ].map(([nama, px]) => (
            <div key={nama as string} className="ds-token">
              <span className="ds-batang" style={{ width: `${px}px` }} />
              <code>{nama}</code>
              <small>{px}px</small>
            </div>
          ))}
        </div>

        <div className="ds-baris-token">
          {[["--r-kecil", 8], ["--r-sedang", 14], ["--r-besar", 22], ["--r-penuh", 999]].map(
            ([nama, px]) => (
              <div key={nama as string} className="ds-token">
                <span className="ds-kotak" style={{ borderRadius: `${px}px` }} />
                <code>{nama}</code>
                <small>{px === 999 ? "penuh" : `${px}px`}</small>
              </div>
            )
          )}
        </div>

        <p className="ds-teks ds-kecil">
          Satu lengkung gerak untuk semuanya:{" "}
          <code>cubic-bezier(0.22, 1, 0.36, 1)</code>, cepat di awal, berhenti
          pelan. Gerakan yang berhenti mendadak terasa seperti mesin; yang
          berhenti pelan terasa seperti benda yang punya berat. Tempo:{" "}
          <code>--d-cepat .25s</code>, <code>--d-sedang .45s</code>,{" "}
          <code>--d-masuk 1.4s</code>, <code>--d-waktu 1.6s</code>.
        </p>
      </section>

      <footer className="ds-kaki">
        <p>
          Angka di halaman ini tidak ditulis dua kali. Semuanya dibaca langsung
          dari <code>src/design/tema.ts</code> dan{" "}
          <code>src/components/v2/waktu.ts</code>. Kalau palet berubah, halaman
          ini ikut berubah, dan kalau ada yang jatuh di bawah ambang ia akan
          terlihat merah di tabel paling atas.
        </p>
        <p>
          Bisa juga diperiksa tanpa membuka browser:{" "}
          <code>npm run periksa:kontras</code>
        </p>
      </footer>
    </main>
  );
}

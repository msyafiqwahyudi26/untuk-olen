import { NextResponse } from "next/server";
import { JALUR_KUE, KUE_TIKET } from "@/lib/basis";
import { buatTiket, UMUR_TIKET_HARI } from "@/lib/tiket";
import { adaKunci, periksaKunci, rahasia, ubahKunci } from "@/lib/kunci";

/* node:sqlite dan node:crypto tidak ada di Edge. */
export const runtime = "nodejs";

function pasangTiket(res: NextResponse, tiket: string) {
  res.cookies.set(KUE_TIKET, tiket, {
    httpOnly: true,          // JavaScript halaman tidak perlu membacanya, jadi jangan diizinkan
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: JALUR_KUE,
    maxAge: UMUR_TIKET_HARI * 24 * 60 * 60,
  });
  return res;
}

/** POST — membuka dengan PIN. */
export async function POST(req: Request) {
  let pin = "";
  try {
    pin = String(((await req.json()) as { pin?: unknown }).pin ?? "");
  } catch {
    return NextResponse.json({ ok: false, pesan: "Permintaan tidak terbaca." }, { status: 400 });
  }

  if (!adaKunci()) {
    return NextResponse.json(
      { ok: false, pesan: "Kunci belum disiapkan. Hubungi yang membuatkan halaman ini." },
      { status: 503 },
    );
  }

  const hasil = await periksaKunci(pin);
  if (!hasil.ok) {
    /* Pesannya sengaja tidak menyebut apakah PIN-nya "hampir benar" atau
     * berapa angka yang cocok. Tidak ada yang berguna di situ selain untuk
     * yang sedang menebak. */
    return NextResponse.json(
      {
        ok: false,
        tungguDetik: hasil.tungguDetik,
        pesan: hasil.tungguDetik > 0 ? "Coba lagi sebentar." : "Bukan itu angkanya.",
      },
      { status: 401 },
    );
  }

  return pasangTiket(NextResponse.json({ ok: true }), await buatTiket(rahasia()));
}

/**
 * PATCH — mengganti PIN. Butuh yang lama, meski pintunya sudah terbuka:
 * perangkat yang tertinggal dalam keadaan terbuka tidak boleh cukup untuk
 * mengunci Olen dari kapsulnya sendiri.
 */
export async function PATCH(req: Request) {
  let lama = "";
  let baru = "";
  try {
    const b = (await req.json()) as { lama?: unknown; baru?: unknown };
    lama = String(b.lama ?? "");
    baru = String(b.baru ?? "");
  } catch {
    return NextResponse.json({ ok: false, pesan: "Permintaan tidak terbaca." }, { status: 400 });
  }

  if (!/^\d{4}$/.test(baru)) {
    return NextResponse.json({ ok: false, pesan: "PIN baru harus empat angka." }, { status: 400 });
  }

  const hasil = await ubahKunci(lama, baru);
  if (!hasil.ok) {
    return NextResponse.json(
      {
        ok: false,
        tungguDetik: hasil.tungguDetik,
        pesan: hasil.tungguDetik > 0 ? "Coba lagi sebentar." : "PIN lamanya bukan itu.",
      },
      { status: 401 },
    );
  }

  /* Tiket lama ditandatangani rahasia yang sama, jadi ia masih sah — tapi
   * mengganti PIN adalah saat yang tepat untuk memperbarui masa berlakunya. */
  return pasangTiket(NextResponse.json({ ok: true }), await buatTiket(rahasia()));
}

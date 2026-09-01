import { NextResponse } from "next/server";
import { addAcara, getAcara, hapusAcara } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ═══ ACARA ═══
 *
 * Ulang tahun teman dan tanggal yang perlu diingat. Terpisah dari catatan,
 * karena keduanya hal yang berbeda: catatan sudah terjadi lalu ditulis; acara
 * akan atau selalu terjadi.
 *
 * Berbeda dari catatan, DELETE di sini benar-benar menghapus. Acara adalah
 * keterangan tanggal, bukan sesuatu yang pernah Olen rasakan, jadi jaminan
 * "tidak ada yang hilang" tidak berlaku di sini dan menyimpan sampah
 * selamanya bukan kebaikan.
 */

export async function GET() {
  return NextResponse.json(getAcara());
}

export async function POST(req: Request) {
  let d: {
    tanggal?: unknown;
    judul?: unknown;
    jenis?: unknown;
    tiapTahun?: unknown;
    jam?: unknown;
    tempat?: unknown;
  };
  try {
    d = (await req.json()) as typeof d;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const a = addAcara(
    typeof d.tanggal === "string" ? d.tanggal : "",
    typeof d.judul === "string" ? d.judul : "",
    typeof d.jenis === "string" ? d.jenis : "acara",
    d.tiapTahun === true,
    d.jam,
    d.tempat,
  );
  return a
    ? NextResponse.json(a, { status: 201 })
    : NextResponse.json({ error: "tanggal atau judul tidak sah" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "id" }, { status: 400 });
  hapusAcara(id);
  return NextResponse.json({ ok: true });
}

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ═══ UNGGAH FOTO MOMEN ═══
 *
 * Foto yang Olen tempelkan ke catatan hariannya.
 *
 *
 * ── NAMA BERKASNYA DIBUAT DI SINI, BUKAN DIPAKAI DARI PENGUNGGAH ──
 *
 * Nama asli dari peramban tidak pernah dipakai, sekalipun sesudah
 * dibersihkan. Alasannya dua:
 *
 *   Keamanan. Nama seperti "../../data/olen.db" atau "..%2f..%2fx" adalah
 *   nama berkas yang sah menurut peramban, dan tiap pembersih buatan sendiri
 *   selalu ketinggalan satu bentuk yang belum terpikirkan. Nama acak tidak
 *   punya bentuk untuk ketinggalan.
 *
 *   Ketenangan. Dua foto bernama "IMG_0001.jpg" dari dua hari berbeda akan
 *   saling menimpa, dan yang hilang adalah foto Olen.
 *
 *
 * ── KENAPA JENISNYA DITENTUKAN DARI ISI, BUKAN DARI YANG DILAPORKAN ──
 *
 * `file.type` datang dari peramban dan bisa ditulis apa saja. Yang dipakai
 * di sini beberapa bita pertama berkasnya sendiri, yang tidak bisa dibohongi
 * tanpa benar-benar mengubah isinya. Kalau tidak dikenali, ditolak.
 */

const BATAS = 8 * 1024 * 1024; // 8 MB per berkas
const FOLDER = path.join(process.cwd(), "public", "momen");

/** Mengenali jenis gambar dari beberapa bita pertamanya. */
function jenisDariIsi(b: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "png";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP")
    return "webp";
  if (b.subarray(0, 6).toString("ascii") === "GIF89a" || b.subarray(0, 6).toString("ascii") === "GIF87a")
    return "gif";
  return null;
}

export async function POST(req: Request) {
  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const masuk = data.getAll("foto").filter((f): f is File => f instanceof File);
  if (!masuk.length) return NextResponse.json({ error: "tidak ada berkas" }, { status: 400 });
  if (masuk.length > 6) return NextResponse.json({ error: "maksimal 6 foto" }, { status: 400 });

  await mkdir(FOLDER, { recursive: true });

  const hasil: string[] = [];
  for (const f of masuk) {
    if (f.size > BATAS) {
      return NextResponse.json(
        { error: `${Math.round(f.size / 1024 / 1024)} MB kebesaran, batasnya 8 MB` },
        { status: 413 },
      );
    }
    const isi = Buffer.from(await f.arrayBuffer());
    const jenis = jenisDariIsi(isi);
    if (!jenis) {
      return NextResponse.json({ error: "cuma gambar yang bisa ditempel" }, { status: 415 });
    }
    const nama = `${randomBytes(9).toString("hex")}.${jenis}`;
    await writeFile(path.join(FOLDER, nama), isi);
    hasil.push(nama);
  }

  return NextResponse.json({ foto: hasil }, { status: 201 });
}

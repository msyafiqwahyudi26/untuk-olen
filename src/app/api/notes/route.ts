import { NextResponse } from "next/server";
import {
  addNote,
  getNotes,
  getTerhapus,
  hapusNote,
  pulihNote,
  tandaiPenting,
  ubahNote,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ═══ CATATAN OLEN ═══
 *
 * Satu hal berlaku di seluruh berkas ini: TIDAK ADA satu pun jalan yang
 * benar-benar menghapus tulisan. DELETE di sini berarti menyembunyikan, dan
 * isinya tetap tersimpan di `note_revisi`. Alasannya ada di db.ts.
 *
 * Kalau kelak ada yang menambahkan penghapusan sungguhan, itu bukan fitur
 * baru melainkan pencabutan jaminan — bicarakan dulu dengan pemiliknya.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  /* ?terhapus=1 mengembalikan yang sudah disembunyikan, untuk layar pulihkan. */
  if (url.searchParams.get("terhapus") === "1") {
    return NextResponse.json(getTerhapus());
  }
  return NextResponse.json(getNotes());
}

export async function POST(req: Request) {
  let body = "";
  let mood: string | null = null;
  let judul: string | null = null;
  let subjudul: string | null = null;
  let foto: unknown = null;
  try {
    const json = (await req.json()) as {
      body?: unknown;
      mood?: unknown;
      judul?: unknown;
      subjudul?: unknown;
      foto?: unknown;
    };
    body = typeof json.body === "string" ? json.body : "";
    mood = typeof json.mood === "string" ? json.mood : null;
    judul = typeof json.judul === "string" ? json.judul : null;
    subjudul = typeof json.subjudul === "string" ? json.subjudul : null;
    /* Diteruskan mentah. Yang menyaring nama berkasnya `bersihFoto` di
       db.ts, dan itu satu-satunya tempat. Menyaring di sini juga berarti
       dua penyaring yang bisa berbeda, dan yang lebih longgar yang menang. */
    foto = json.foto ?? null;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  /* addNote sendiri yang menyaring moodnya terhadap daftar yang sah; di sini
     cukup diteruskan. Menyaring di dua tempat berarti dua tempat yang bisa
     berbeda. */
  const note = addNote(body, mood, judul, subjudul, foto);
  if (!note) return NextResponse.json({ error: "kosong" }, { status: 400 });
  return NextResponse.json(note, { status: 201 });
}

/**
 * PATCH menangani tiga hal: mengubah isi, menandai penting, dan memulihkan
 * yang sudah disembunyikan. Ketiganya perubahan pada catatan yang SUDAH ADA,
 * jadi satu jalan cukup — dibedakan oleh medan mana yang dikirim.
 */
export async function PATCH(req: Request) {
  let d: {
    id?: unknown;
    body?: unknown;
    mood?: unknown;
    penting?: unknown;
    pulih?: unknown;
    judul?: unknown;
    subjudul?: unknown;
    foto?: unknown;
  };
  try {
    d = (await req.json()) as typeof d;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const id = typeof d.id === "number" ? d.id : Number(d.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "id" }, { status: 400 });

  if (d.pulih === true) {
    const n = pulihNote(id);
    return n ? NextResponse.json(n) : NextResponse.json({ error: "tidak ada" }, { status: 404 });
  }

  if (typeof d.penting === "boolean") {
    const n = tandaiPenting(id, d.penting);
    return n ? NextResponse.json(n) : NextResponse.json({ error: "tidak ada" }, { status: 404 });
  }

  if (typeof d.body === "string") {
    const n = ubahNote(
      id,
      d.body,
      typeof d.mood === "string" ? d.mood : null,
      typeof d.judul === "string" ? d.judul : null,
      typeof d.subjudul === "string" ? d.subjudul : null,
      d.foto ?? null,
    );
    return n
      ? NextResponse.json(n)
      : NextResponse.json({ error: "kosong atau tidak ada" }, { status: 400 });
  }

  return NextResponse.json({ error: "tidak ada yang diubah" }, { status: 400 });
}

/** Menyembunyikan, BUKAN menghapus. Lihat catatan di kepala berkas. */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "id" }, { status: 400 });
  const n = hapusNote(id);
  return n ? NextResponse.json(n) : NextResponse.json({ error: "tidak ada" }, { status: 404 });
}

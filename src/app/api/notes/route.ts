import { NextResponse } from "next/server";
import { addNote, getNotes } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getNotes());
}

export async function POST(req: Request) {
  let body = "";
  let mood: string | null = null;
  try {
    const json = (await req.json()) as { body?: unknown; mood?: unknown };
    body = typeof json.body === "string" ? json.body : "";
    mood = typeof json.mood === "string" ? json.mood : null;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  /* addNote sendiri yang menyaring moodnya terhadap daftar yang sah; di sini
     cukup diteruskan. Menyaring di dua tempat berarti dua tempat yang bisa
     berbeda. */
  const note = addNote(body, mood);
  if (!note) return NextResponse.json({ error: "kosong" }, { status: 400 });
  return NextResponse.json(note, { status: 201 });
}

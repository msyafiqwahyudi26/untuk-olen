import { NextResponse } from "next/server";
import { addNote, getNotes } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getNotes());
}

export async function POST(req: Request) {
  let body = "";
  try {
    const json = (await req.json()) as { body?: unknown };
    body = typeof json.body === "string" ? json.body : "";
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const note = addNote(body);
  if (!note) return NextResponse.json({ error: "kosong" }, { status: 400 });
  return NextResponse.json(note, { status: 201 });
}

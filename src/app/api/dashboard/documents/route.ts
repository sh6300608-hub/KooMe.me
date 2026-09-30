import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "").trim().slice(0, 120);

    if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Files must be between 1 byte and 10 MB." }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

    const key = `${user.id}/${crypto.randomUUID()}`;
    const root = path.resolve(process.env.PRIVATE_STORAGE_DIR || "/tmp/koomi-documents");
    const destination = path.join(root, key);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await file.arrayBuffer()));

    const document = await db.document.create({
      data: { userId: user.id, name: file.name.slice(0, 240), key, mimeType: file.type, size: file.size, folder: folder || null },
    });
    await db.activityLog.create({ data: { userId: user.id, action: "document.uploaded", entity: "Document", entityId: document.id } });

    return NextResponse.json({ document }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

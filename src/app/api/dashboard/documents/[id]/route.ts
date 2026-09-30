import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireOwner();
    const { id } = await params;
    const document = await db.document.findFirst({ where: { id, userId: user.id } });
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

    const root = path.resolve(process.env.PRIVATE_STORAGE_DIR || "/tmp/koomi-documents");
    await unlink(path.join(root, document.key)).catch(() => undefined);
    await db.document.delete({ where: { id } });
    await db.activityLog.create({ data: { userId: user.id, action: "document.deleted", entity: "Document", entityId: id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}

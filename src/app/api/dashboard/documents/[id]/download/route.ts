import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireOwner();
    const { id } = await params;
    const document = await db.document.findFirst({ where: { id, userId: user.id } });
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });

    const root = path.resolve(process.env.PRIVATE_STORAGE_DIR || "/tmp/koomi-documents");
    const bytes = await readFile(path.join(root, document.key));
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.name.replace(/[\r\n"]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Document unavailable." }, { status: 404 });
  }
}

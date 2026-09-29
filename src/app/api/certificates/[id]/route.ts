import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
function payload(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? "").trim(), organization: String(body.organization ?? "").trim(),
    date: body.date ? new Date(String(body.date)) : null, credentialId: String(body.credentialId ?? "").trim() || null,
    verificationUrl: String(body.verificationUrl ?? "").trim() || null, assetUrl: String(body.assetUrl ?? "").trim() || null,
    featured: Boolean(body.featured), skills: String(body.skills ?? "").trim() || null,
    status: ["DRAFT", "PREVIEW", "PUBLISHED"].includes(String(body.status)) ? String(body.status) as "DRAFT" | "PREVIEW" | "PUBLISHED" : "DRAFT",
  };
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner(); const { id } = await params;
  const existing = await db.certificate.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  try { const data = payload(await request.json()); if (!data.title || !data.organization) return NextResponse.json({ error: "Title and organization are required." }, { status: 400 }); return NextResponse.json({ certificate: await db.certificate.update({ where: { id }, data }) }); }
  catch { return NextResponse.json({ error: "Invalid certificate data." }, { status: 400 }); }
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner(); const { id } = await params;
  const existing = await db.certificate.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  await db.certificate.delete({ where: { id } }); return NextResponse.json({ ok: true });
}

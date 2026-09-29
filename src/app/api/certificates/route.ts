import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

function payload(body: Record<string, unknown>) {
  return {
    title: String(body.title ?? "").trim(),
    organization: String(body.organization ?? "").trim(),
    date: body.date ? new Date(String(body.date)) : null,
    credentialId: String(body.credentialId ?? "").trim() || null,
    verificationUrl: String(body.verificationUrl ?? "").trim() || null,
    assetUrl: String(body.assetUrl ?? "").trim() || null,
    featured: Boolean(body.featured),
    skills: String(body.skills ?? "").trim() || null,
    status: ["DRAFT", "PREVIEW", "PUBLISHED"].includes(String(body.status)) ? String(body.status) as "DRAFT" | "PREVIEW" | "PUBLISHED" : "DRAFT",
  };
}
export async function GET() {
  const user = await requireOwner();
  return NextResponse.json({ certificates: await db.certificate.findMany({ where: { userId: user.id }, orderBy: [{ featured: "desc" }, { date: "desc" }] }) });
}
export async function POST(request: Request) {
  const user = await requireOwner();
  try {
    const data = payload(await request.json());
    if (!data.title || !data.organization) return NextResponse.json({ error: "Title and organization are required." }, { status: 400 });
    return NextResponse.json({ certificate: await db.certificate.create({ data: { ...data, userId: user.id } }) }, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid certificate data." }, { status: 400 }); }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  degree: z.string().trim().min(1).max(180),
  institution: z.string().trim().min(1).max(180),
  board: z.string().trim().max(180).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  score: z.string().trim().max(80).optional().nullable(),
  subjects: z.string().trim().max(3000).optional().nullable(),
  achievements: z.string().trim().max(3000).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  documentUrl: z.string().url().max(1000).optional().nullable(),
  featured: z.coerce.boolean().default(false),
  status: z.enum(["DRAFT", "PREVIEW", "PUBLISHED"]).default("DRAFT"),
});

function dates(data: z.infer<typeof schema>) {
  return {
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    board: data.board || null,
    score: data.score || null,
    subjects: data.subjects || null,
    achievements: data.achievements || null,
    description: data.description || null,
    documentUrl: data.documentUrl || null,
  };
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid education data." }, { status: 400 });
  const existing = await db.education.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Education record not found." }, { status: 404 });
  const education = await db.education.update({ where: { id }, data: dates(parsed.data) });
  await db.activityLog.create({ data: { userId: user.id, action: "education.updated", entity: "Education", entityId: id } });
  return NextResponse.json({ education });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const existing = await db.education.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Education record not found." }, { status: 404 });
  await db.education.delete({ where: { id } });
  await db.activityLog.create({ data: { userId: user.id, action: "education.deleted", entity: "Education", entityId: id } });
  return NextResponse.json({ ok: true });
}
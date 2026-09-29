import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryId: z.string().min(1),
  proficiency: z.coerce.number().int().min(0).max(100),
  featured: z.coerce.boolean(),
  published: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const parsed = skillSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid skill data." }, { status: 400 });

  const existing = await db.skill.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Skill not found." }, { status: 404 });

  const skill = await db.skill.update({ where: { id }, data: parsed.data, include: { category: true } });
  await db.activityLog.create({ data: { userId: user.id, action: "skill.updated", entity: "Skill", entityId: id } });
  return NextResponse.json({ skill });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const existing = await db.skill.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Skill not found." }, { status: 404 });

  await db.skill.delete({ where: { id } });
  await db.activityLog.create({ data: { userId: user.id, action: "skill.deleted", entity: "Skill", entityId: id } });
  return NextResponse.json({ ok: true });
}

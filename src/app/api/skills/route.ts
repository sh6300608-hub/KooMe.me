import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryId: z.string().min(1),
  proficiency: z.coerce.number().int().min(0).max(100),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});

export async function POST(request: Request) {
  const user = await requireOwner();
  const parsed = skillSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid skill data." }, { status: 400 });

  const category = await db.skillCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: "Skill category not found." }, { status: 400 });

  const skill = await db.skill.create({ data: { userId: user.id, ...parsed.data }, include: { category: true } });
  await db.activityLog.create({ data: { userId: user.id, action: "skill.created", entity: "Skill", entityId: skill.id } });
  return NextResponse.json({ skill }, { status: 201 });
}

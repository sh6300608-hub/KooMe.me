import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/owner";
import { db } from "@/lib/db";

const goalSchema = z.object({
  title: z.string().trim().min(1).max(160),
  category: z.enum(["CAREER", "SKILL", "PROJECT", "AMBITION"]),
  progress: z.coerce.number().int().min(0).max(100),
  targetDate: z.string().optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
});

export async function POST(request: Request) {
  const user = await requireOwner();
  const body = await request.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid goal data." }, { status: 400 });

  const goal = await db.futureGoal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      category: parsed.data.category,
      progress: parsed.data.progress,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      notes: parsed.data.notes || null,
      visibility: parsed.data.visibility,
    },
  });

  await db.activityLog.create({ data: { userId: user.id, action: "goal.created", entity: "FutureGoal", entityId: goal.id } });
  return NextResponse.json({ goal }, { status: 201 });
}
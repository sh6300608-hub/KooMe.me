import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(160),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["DRAFT", "PREVIEW", "PUBLISHED"]),
  data: z.record(z.string(), z.unknown()).default({}),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid resume data." }, { status: 400 });

  const existing = await db.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const duplicate = await db.resume.findFirst({ where: { slug: parsed.data.slug, id: { not: id } } });
  if (duplicate) return NextResponse.json({ error: "That resume slug is already in use." }, { status: 409 });

  const resume = await db.$transaction(async (tx) => {
    const latest = await tx.resumeVersion.findFirst({ where: { resumeId: id }, orderBy: { version: "desc" } });
    const version = (latest?.version ?? 0) + 1;
    const nextVersion = await tx.resumeVersion.create({
      data: { resumeId: id, version, data: parsed.data.data },
    });
    return tx.resume.update({
      where: { id },
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description || null,
        status: parsed.data.status,
        currentVersionId: nextVersion.id,
      },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
  });

  await db.activityLog.create({
    data: { userId: user.id, action: "resume.updated", entity: "Resume", entityId: id },
  });
  return NextResponse.json({ resume });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireOwner();
  const { id } = await params;
  const existing = await db.resume.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  await db.resume.delete({ where: { id } });
  await db.activityLog.create({
    data: { userId: user.id, action: "resume.deleted", entity: "Resume", entityId: id },
  });
  return NextResponse.json({ ok: true });
}

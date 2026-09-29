import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(160),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["DRAFT", "PREVIEW", "PUBLISHED"]).default("DRAFT"),
  data: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  const user = await requireOwner();
  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const user = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid resume data." }, { status: 400 });
  const input = parsed.data;
  const exists = await db.resume.findUnique({ where: { slug: input.slug } });
  if (exists) return NextResponse.json({ error: "That resume slug is already in use." }, { status: 409 });

  const resume = await db.$transaction(async (tx) => {
    const created = await tx.resume.create({
      data: { userId: user.id, slug: input.slug, name: input.name, description: input.description || null, status: input.status },
    });
    const version = await tx.resumeVersion.create({
      data: { resumeId: created.id, version: 1, data: input.data },
    });
    return tx.resume.update({
      where: { id: created.id },
      data: { currentVersionId: version.id },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
  });
  return NextResponse.json({ resume }, { status: 201 });
}
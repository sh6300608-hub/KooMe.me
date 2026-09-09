import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { publishEntity } from "@/lib/publish";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireOwner();
    const { id } = await params;
    const project = await db.project.findFirst({ where: { id, userId: user.id }, include: { media: true, skills: { include: { skill: true } } } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const nextVersion = (await db.publishedVersion.count({ where: { entity: "Project", entityId: id } })) + 1;
    const snapshot = await publishEntity("Project", id, project, user.id, nextVersion);
    await db.project.update({ where: { id }, data: { status: "PUBLISHED" } });
    return NextResponse.json({ ok: true, version: snapshot.version });
  } catch { return NextResponse.json({ error: "Unable to publish project" }, { status: 500 }); }
}

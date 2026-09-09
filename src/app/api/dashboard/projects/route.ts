import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { projectInput } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    const parsed = projectInput.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
    const data = parsed.data;
    const exists = await db.project.findUnique({ where: { slug: data.slug } });
    if (exists) return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    const project = await db.project.create({ data: { ...data, githubUrl: data.githubUrl || null, liveUrl: data.liveUrl || null, userId: user.id } });
    await db.activityLog.create({ data: { userId: user.id, action: "CREATE", entity: "Project", entityId: project.id } });
    return NextResponse.json({ id: project.id }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message) ? 401 : 500;
    return NextResponse.json({ error: "Unable to create project" }, { status });
  }
}

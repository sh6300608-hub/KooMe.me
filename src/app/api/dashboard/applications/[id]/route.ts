import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { z } from "zod";

const input = z.object({
  company: z.string().min(1).max(200),
  jobTitle: z.string().min(1).max(200),
  status: z.string().min(1).max(60),
  jobUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  applicationDate: z.string().optional(),
  followUpDate: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireOwner();
    const { id } = await params;
    const parsed = input.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid application data" }, { status: 400 });
    const existing = await db.application.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    const row = await db.application.update({
      where: { id },
      data: {
        ...parsed.data,
        jobUrl: parsed.data.jobUrl || null,
        location: parsed.data.location || null,
        notes: parsed.data.notes || null,
        applicationDate: parsed.data.applicationDate ? new Date(parsed.data.applicationDate) : null,
        followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
      },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Unable to update application" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireOwner();
    const { id } = await params;
    const existing = await db.application.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    await db.application.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete application" }, { status: 500 });
  }
}

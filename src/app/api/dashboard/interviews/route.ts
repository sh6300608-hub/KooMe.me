import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { z } from "zod";

const input = z.object({ company: z.string().min(1).max(200), role: z.string().min(1).max(200), dateTime: z.coerce.date(), round: z.string().max(100).optional(), type: z.string().max(100).optional(), meetingLink: z.string().url().optional().or(z.literal("")), prepNotes: z.string().max(10000).optional() });
export async function GET() { const user = await requireOwner(); return NextResponse.json(await db.interview.findMany({ where: { userId: user.id }, orderBy: { dateTime: "asc" } })); }
export async function POST(request: Request) { try { const user = await requireOwner(); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid interview data" }, { status: 400 }); const row = await db.interview.create({ data: { ...parsed.data, meetingLink: parsed.data.meetingLink || null, userId: user.id } }); return NextResponse.json(row, { status: 201 }); } catch { return NextResponse.json({ error: "Unable to create interview" }, { status: 500 }); } }

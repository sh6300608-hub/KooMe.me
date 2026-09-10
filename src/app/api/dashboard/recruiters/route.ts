import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { z } from "zod";

const input = z.object({ name: z.string().min(1).max(200), company: z.string().max(200).optional(), role: z.string().max(200).optional(), location: z.string().max(200).optional(), notes: z.string().max(5000).optional(), priority: z.coerce.number().int().min(0).max(5).default(0) });

export async function GET() { const user = await requireOwner(); return NextResponse.json(await db.recruiter.findMany({ where: { userId: user.id }, orderBy: { priority: "desc" } })); }
export async function POST(request: Request) { try { const user = await requireOwner(); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid recruiter data" }, { status: 400 }); const row = await db.recruiter.create({ data: { ...parsed.data, userId: user.id } }); return NextResponse.json(row, { status: 201 }); } catch { return NextResponse.json({ error: "Unable to create recruiter" }, { status: 500 }); } }

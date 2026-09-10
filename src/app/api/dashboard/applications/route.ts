import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { z } from "zod";

const input = z.object({ company: z.string().min(1).max(200), jobTitle: z.string().min(1).max(200), status: z.string().min(1).max(60).default("APPLIED"), jobUrl: z.string().url().optional().or(z.literal("")), location: z.string().max(200).optional(), notes: z.string().max(5000).optional() });

export async function GET() { const user = await requireOwner(); return NextResponse.json(await db.application.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })); }
export async function POST(request: Request) { try { const user = await requireOwner(); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid application data" }, { status: 400 }); const row = await db.application.create({ data: { ...parsed.data, jobUrl: parsed.data.jobUrl || null, userId: user.id } }); return NextResponse.json(row, { status: 201 }); } catch { return NextResponse.json({ error: "Unable to create application" }, { status: 500 }); } }

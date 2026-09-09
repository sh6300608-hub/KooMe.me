import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string().trim().min(1).max(80),
  page: z.string().trim().max(500).optional(),
  projectId: z.string().cuid().optional(),
  sessionId: z.string().trim().max(128).optional(),
  device: z.string().trim().max(40).optional(),
  browser: z.string().trim().max(80).optional(),
  referrer: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    await db.analyticsEvent.create({ data: parsed.data });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 });
  }
}

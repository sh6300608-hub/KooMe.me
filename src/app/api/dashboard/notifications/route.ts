import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  action: z.enum(["read", "unread", "read-all"]),
  id: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    if (parsed.data.action === "read-all") {
      await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    } else {
      if (!parsed.data.id) return NextResponse.json({ error: "Notification id is required." }, { status: 400 });
      await db.notification.updateMany({
        where: { id: parsed.data.id, userId: user.id },
        data: { read: parsed.data.action === "read" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

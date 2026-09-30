import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  action: z.enum(["revoke", "revoke-others", "revoke-all"]),
  sessionId: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    if (parsed.data.action === "revoke") {
      if (!parsed.data.sessionId) return NextResponse.json({ error: "Session id is required." }, { status: 400 });
      await db.session.deleteMany({ where: { id: parsed.data.sessionId, userId: user.id } });
    } else if (parsed.data.action === "revoke-others") {
      const current = await getCurrentSessionToken(request);
      if (current) {
        await db.session.deleteMany({ where: { userId: user.id, sessionToken: { not: current } } });
      }
    } else {
      await db.session.deleteMany({ where: { userId: user.id } });
    }

    await db.securityEvent.create({
      data: {
        userId: user.id,
        event: parsed.data.action === "revoke" ? "SESSION_REVOKED" : "SESSIONS_REVOKED",
        success: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}

async function getCurrentSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const names = ["authjs.session-token", "__Secure-authjs.session-token"];
  for (const name of names) {
    const part = cookie.split(";").map((value) => value.trim()).find((value) => value.startsWith(name + "="));
    if (part) return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

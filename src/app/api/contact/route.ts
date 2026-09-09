import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactInput } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactInput.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    const message = await db.contactMessage.create({ data: { ...parsed.data, company: parsed.data.company || null, role: parsed.data.role || null } });
    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit message" }, { status: 500 });
  }
}

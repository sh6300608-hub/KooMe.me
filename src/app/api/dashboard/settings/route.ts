import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

const schema = z.object({
  siteTitle: z.string().trim().max(120),
  tagline: z.string().trim().max(240),
  location: z.string().trim().max(120),
  contactEmail: z.string().trim().email().or(z.literal("")),
  githubUrl: z.string().trim().url().or(z.literal("")),
  linkedinUrl: z.string().trim().url().or(z.literal("")),
  publicResumePath: z.string().trim().regex(/^\/resume\/[a-z0-9-]+$/).or(z.literal("")),
  analyticsEnabled: z.boolean(),
});

export async function PUT(request: Request) {
  try {
    const user = await requireOwner();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings", issues: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await db.siteSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, settings: parsed.data },
      update: { settings: parsed.data },
    });

    return NextResponse.json({ settings: settings.settings });
  } catch {
    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }
}

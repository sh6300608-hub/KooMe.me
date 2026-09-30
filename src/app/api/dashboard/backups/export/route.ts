import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireOwner();
  const [
    profile, projects, skills, certificates, education, achievements, goals, resumes,
    messages, recruiters, applications, interviews, documents, attendance, notifications,
    activities, securityEvents, backups, siteSettings,
  ] = await Promise.all([
    db.profile.findUnique({ where: { userId: user.id }, include: { photos: true } }),
    db.project.findMany({ where: { userId: user.id }, include: { media: true, skills: true } }),
    db.skill.findMany({ where: { userId: user.id } }),
    db.certificate.findMany({ where: { userId: user.id } }),
    db.education.findMany({ where: { userId: user.id } }),
    db.achievement.findMany({ where: { userId: user.id } }),
    db.futureGoal.findMany({ where: { userId: user.id } }),
    db.resume.findMany({ where: { userId: user.id }, include: { versions: true } }),
    db.contactMessage.findMany({ where: { userId: user.id } }),
    db.recruiter.findMany({ where: { userId: user.id } }),
    db.application.findMany({ where: { userId: user.id } }),
    db.interview.findMany({ where: { userId: user.id } }),
    db.document.findMany({ where: { userId: user.id } }),
    db.attendance.findMany({ where: { userId: user.id } }),
    db.notification.findMany({ where: { userId: user.id } }),
    db.activityLog.findMany({ where: { userId: user.id } }),
    db.securityEvent.findMany({ where: { userId: user.id } }),
    db.backup.findMany({ where: { userId: user.id } }),
    db.siteSettings.findUnique({ where: { userId: user.id } }),
  ]);

  const payload = {
    format: "koomi-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    data: {
      profile, projects, skills, certificates, education, achievements, goals, resumes,
      messages, recruiters, applications, interviews, documents, attendance, notifications,
      activities, securityEvents, backups, siteSettings,
    },
  };

  const body = JSON.stringify(payload, null, 2);
  await db.backup.create({ data: { userId: user.id, key: `export-${Date.now()}`, size: Buffer.byteLength(body) } });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="koomi-backup-${new Date().toISOString().slice(0,10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}

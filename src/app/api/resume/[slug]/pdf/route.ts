import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { db } from "@/lib/db";

type ResumeData = {
  headline?: string;
  summary?: string;
  email?: string;
  location?: string;
  links?: { label?: string; url?: string }[];
  experience?: { title?: string; company?: string; period?: string; description?: string }[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resume = await db.resume.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, user: { include: { profile: true } } },
  });

  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  const version = resume.currentVersionId
    ? await db.resumeVersion.findUnique({ where: { id: resume.currentVersionId } })
    : resume.versions[0];
  const data = (version?.data ?? {}) as ResumeData;
  const profile = resume.user.profile;
  const projects = await db.project.findMany({
    where: { userId: resume.userId, status: "PUBLISHED" },
    include: { skills: { include: { skill: true } } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 6,
  });
  const skills = await db.skill.findMany({
    where: { userId: resume.userId, published: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: 18,
  });
  const education = await db.education.findMany({
    where: { userId: resume.userId, status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { startDate: "desc" }],
    take: 3,
  });
  const certificates = await db.certificate.findMany({
    where: { userId: resume.userId, status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { date: "desc" }],
    take: 4,
  });

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: resume.name, Author: resume.user.name } });
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const name = text(resume.user.name) || "Resume";
  const headline = text(data.headline) || text(profile?.headline) || "Software Developer";
  doc.fontSize(28).fillColor("#111827").font("Helvetica-Bold").text(name);
  doc.moveDown(0.25).fontSize(13).fillColor("#4f6fd8").font("Helvetica").text(headline);
  doc.moveDown(0.35).fontSize(9).fillColor("#5f6b7a").text(
    [text(data.email), text(data.location) || text(profile?.location), ...(data.links ?? []).map((x) => text(x.url)).filter(Boolean)].filter(Boolean).join("  ·  "),
  );

  const section = (title: string) => {
    doc.moveDown(1).fontSize(11).fillColor("#111827").font("Helvetica-Bold").text(title);
    doc.moveDown(0.25).strokeColor("#d8dee8").moveTo(48, doc.y).lineTo(547, doc.y).stroke();
    doc.moveDown(0.45);
  };

  const paragraph = (value: string) => {
    if (value) doc.fontSize(9.5).fillColor("#374151").font("Helvetica").text(value, { lineGap: 2 });
  };

  const summary = text(data.summary) || text(profile?.bio) || text(resume.description);
  if (summary) { section("PROFILE"); paragraph(summary); }

  if (data.experience?.length) {
    section("EXPERIENCE");
    for (const item of data.experience) {
      const title = text(item.title) || "Experience";
      const meta = [text(item.company), text(item.period)].filter(Boolean).join(" · ");
      doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(title);
      if (meta) doc.moveDown(0.15).fontSize(9).fillColor("#667085").font("Helvetica").text(meta);
      if (text(item.description)) { doc.moveDown(0.2); paragraph(text(item.description)); }
      doc.moveDown(0.55);
    }
  }

  if (projects.length) {
    section("SELECTED PROJECTS");
    for (const project of projects) {
      doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(project.name);
      doc.moveDown(0.15); paragraph(project.description);
      const tags = project.skills.map((x) => x.skill.name).slice(0, 8).join(" · ");
      if (tags) doc.moveDown(0.15).fontSize(8.5).fillColor("#667085").text(tags);
      doc.moveDown(0.5);
    }
  }

  if (skills.length) {
    section("SKILLS");
    paragraph(skills.map((skill) => skill.name).join("  ·  "));
  }

  if (education.length) {
    section("EDUCATION");
    for (const item of education) {
      doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(item.degree);
      doc.moveDown(0.15).fontSize(9).fillColor("#667085").font("Helvetica").text(
        [item.institution, item.score].filter(Boolean).join(" · "),
      );
      if (item.description) { doc.moveDown(0.15); paragraph(item.description); }
      doc.moveDown(0.45);
    }
  }

  if (certificates.length) {
    section("CREDENTIALS");
    for (const certificate of certificates) {
      doc.fontSize(9.5).fillColor("#111827").font("Helvetica-Bold").text(certificate.title);
      doc.moveDown(0.1).fontSize(8.5).fillColor("#667085").font("Helvetica").text(
        [certificate.organization, certificate.date?.getFullYear()].filter(Boolean).join(" · "),
      );
      doc.moveDown(0.35);
    }
  }

  doc.end();
  const pdf = await done;

  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

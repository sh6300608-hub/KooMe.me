import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

type ResumeData = {
  name?: string;
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

export default async function ResumePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resume = await db.resume.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { versions: { orderBy: { version: "desc" } }, user: { include: { profile: true } } },
  });

  if (!resume) notFound();

  const version = resume.currentVersionId
    ? resume.versions.find((item) => item.id === resume.currentVersionId)
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

  const name = text(data.name) || text(resume.user.name) || "Resume";
  const headline = text(data.headline) || text(profile?.headline) || "Software Developer";
  const summary = text(data.summary) || text(profile?.bio) || text(resume.description);

  return (
    <>
      <SiteNav />
      <main className="container resume-page">
        <div className="resume-toolbar">
          <Link href="/" className="btn btn-secondary">Back to KooMi</Link>
          <a className="btn btn-primary" href={`/api/resume/${resume.slug}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
        </div>

        <article className="surface resume-sheet">
          <header className="resume-header">
            <div>
              <p className="eyebrow">CURRICULUM VITAE</p>
              <h1>{name}</h1>
              <p className="resume-headline">{headline}</p>
            </div>
            <div className="resume-contact">
              {text(data.email) && <a href={`mailto:${data.email}`}>{data.email}</a>}
              {text(data.location) || text(profile?.location) ? <span>{text(data.location) || text(profile?.location)}</span> : null}
              {data.links?.filter((item) => text(item.url)).map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{text(item.label) || item.url}</a>
              ))}
            </div>
          </header>

          {summary && <section className="resume-section"><h2>Profile</h2><p>{summary}</p></section>}

          {data.experience?.length ? (
            <section className="resume-section">
              <h2>Experience</h2>
              <div className="resume-items">
                {data.experience.map((item, index) => (
                  <div className="resume-item" key={`${item.company ?? "experience"}-${index}`}>
                    <div><h3>{text(item.title) || "Experience"}</h3><p className="muted">{text(item.company)}{text(item.period) ? ` · ${item.period}` : ""}</p></div>
                    {text(item.description) && <p>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {projects.length > 0 && (
            <section className="resume-section">
              <h2>Selected projects</h2>
              <div className="resume-items">
                {projects.map((project) => (
                  <div className="resume-item" key={project.id}>
                    <div className="resume-item-title"><h3>{project.name}</h3><span className="muted">{project.liveUrl ? "Live project" : "Project"}</span></div>
                    <p>{project.description}</p>
                    {project.skills.length > 0 && <div className="tag-row">{project.skills.slice(0, 6).map((item) => <span className="tag" key={item.skillId}>{item.skill.name}</span>)}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="resume-section">
              <h2>Skills</h2>
              <div className="tag-row">{skills.map((skill) => <span className="tag" key={skill.id}>{skill.name}</span>)}</div>
            </section>
          )}

          {education.length > 0 && (
            <section className="resume-section">
              <h2>Education</h2>
              <div className="resume-items">
                {education.map((item) => (
                  <div className="resume-item" key={item.id}>
                    <h3>{item.degree}</h3>
                    <p className="muted">{item.institution}{item.score ? ` · ${item.score}` : ""}</p>
                    {item.description && <p>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="resume-section">
              <h2>Credentials</h2>
              <div className="resume-credentials">
                {certificates.map((certificate) => <div key={certificate.id}><strong>{certificate.title}</strong><span className="muted">{certificate.organization}{certificate.date ? ` · ${certificate.date.getFullYear()}` : ""}</span></div>)}
              </div>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

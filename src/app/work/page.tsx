import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await db.project.findMany({ where: { status: "PUBLISHED" }, include: { media: true, skills: { include: { skill: true } } }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] });
  return <><SiteNav /><main className="container page-shell">
    <section className="page-hero"><p className="eyebrow">SELECTED WORK</p><h1>Projects</h1><p className="lead">A curated set of shipped work, technical experiments and practical problem-solving.</p></section>
    <div className="project-grid">
      {projects.map((p, index) => <Link key={p.id} href={`/work/${p.slug}`} className="surface project-card">
        <div className="project-index">0{index + 1}</div><div className="project-heading"><h2>{p.name}</h2>{p.featured && <span className="tag">Featured</span>}</div>
        <p className="muted project-description">{p.description}</p><div className="tag-row">{p.skills.map(s => <span key={s.skillId} className="tag">{s.skill.name}</span>)}</div><span className="project-link">View project <span aria-hidden="true">↗</span></span>
      </Link>)}
    </div>
    {!projects.length && <div className="surface empty-state"><h2>No published projects yet</h2><p className="muted">Draft work remains private until it is explicitly published.</p></div>}
  </main><SiteFooter /></>;
}

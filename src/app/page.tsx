import Link from "next/link";
import { db } from "@/lib/db";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero3DLoader } from "@/components/hero-3d-loader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, projects, skills, certificates, education] = await Promise.all([
    db.profile.findFirst({ where: { published: true } }),
    db.project.findMany({ where: { status: "PUBLISHED" }, include: { skills: { include: { skill: true } } }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }], take: 4 }),
    db.skill.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }], take: 12 }),
    db.certificate.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { date: "desc" }], take: 4 }),
    db.education.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { startDate: "desc" }], take: 2 }),
  ]);
  return <main>
    <SiteNav />
    <section className="container hero">
      <div>
        <p className="eyebrow">Software · Systems · Growth</p>
        <h1>Hussain<span className="accent-text">.</span></h1>
        <p className="hero-copy">{profile?.bio ?? "Computer Science and Engineering student building practical software, strengthening core engineering skills, and preparing for meaningful opportunities."}</p>
        <div className="hero-actions"><Link className="btn btn-primary" href="/work">Explore my work ↗</Link><Link className="btn btn-secondary" href="/resume/software-developer">View resume</Link></div>
        <div className="hero-tags">{["Java", "Python", "SQL", "Data Structures & Algorithms"].map(x => <span className="tag" key={x}>{x}</span>)}</div>
      </div>
      <div className="hero-visual"><Hero3DLoader /><span className="hero-note">Interactive 3D · cursor responsive · performance aware</span></div>
    </section>
    <section className="container section"><div className="section-head"><div><p className="eyebrow">01 / About</p><h2>Learning by building.</h2></div><Link className="btn btn-secondary" href="/about">Read more ↗</Link></div><div className="surface card"><p className="page-lede no-margin">{profile?.workStyle ?? "A focused software-development journey grounded in computer science fundamentals, problem solving and learning new technologies."}</p></div></section>
    <section className="container section"><div className="section-head"><div><p className="eyebrow">02 / Selected work</p><h2>Projects with a purpose.</h2></div><Link className="btn btn-secondary" href="/work">All projects ↗</Link></div><div className="grid grid-2">{projects.map(p=><Link href={`/work/${p.slug}`} key={p.id} className="surface card card-link"><p className="eyebrow">{p.featured ? "Featured project" : "Project"}</p><h3>{p.name}</h3><p className="muted">{p.description}</p><div className="tag-row">{p.skills.slice(0,4).map(s=><span className="tag" key={s.skillId}>{s.skill.name}</span>)}</div></Link>)}{!projects.length&&<div className="surface card"><h3>No published projects yet.</h3><p className="muted">Projects added in the workspace will appear here after publishing.</p></div>}</div></section>
    <section className="container section"><div className="section-head"><div><p className="eyebrow">03 / Skills</p><h2>Core toolkit.</h2></div><Link className="btn btn-secondary" href="/skills">View skills ↗</Link></div><div className="grid grid-3">{skills.map(s=><article className="surface card" key={s.id}><div className="skill-head"><strong>{s.name}</strong><span className="muted">{s.proficiency}%</span></div><div className="progress skill-progress"><span style={{ width:`${Math.min(100,Math.max(0,s.proficiency))}%` }}/></div></article>)}{!skills.length&&<p className="muted">No published skills yet.</p>}</div></section>
    <section className="container section"><div className="section-head"><div><p className="eyebrow">04 / Credentials</p><h2>Proof of learning.</h2></div><Link className="btn btn-secondary" href="/certificates">All credentials ↗</Link></div><div className="grid grid-2">{certificates.map(c=><article className="surface card" key={c.id}><p className="muted no-top">{c.organization}</p><h3>{c.title}</h3>{c.date&&<p className="muted">{new Date(c.date).toLocaleDateString()}</p>}</article>)}{!certificates.length&&<p className="muted">No published credentials yet.</p>}</div></section>
    <section className="container section"><div className="section-head"><div><p className="eyebrow">05 / Education</p><h2>Computer Science foundation.</h2></div><Link className="btn btn-secondary" href="/education">Education ↗</Link></div>{education.map(e=><article className="surface card" key={e.id}><p className="muted no-top">{e.institution}</p><h3>{e.degree}</h3><p className="muted">{e.score ?? "Current program"}</p></article>)}{!education.length&&<p className="muted">No published education yet.</p>}</section>
    <section className="container section"><div className="surface card cta-panel"><div><p className="eyebrow">06 / Next chapter</p><h2>Open to meaningful opportunities.</h2><p className="muted no-margin">Explore the resume or get in touch about software engineering opportunities and collaboration.</p></div><div className="hero-actions no-top"><Link className="btn btn-primary" href="/contact">Contact</Link><Link className="btn btn-secondary" href="/resume/software-developer">Resume</Link></div></div></section>
    <SiteFooter />
  </main>;
}

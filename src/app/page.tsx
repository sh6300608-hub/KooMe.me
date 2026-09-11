import Link from "next/link";
import { db } from "@/lib/db";
import ContactForm from "@/components/contact-form";

export const dynamic = "force-dynamic";

const sections = [
  ["About", "about"],
  ["My Work", "work"],
  ["Skills", "skills"],
  ["Certificates", "certificates"],
  ["Education", "education"],
  ["Goals", "goals"],
  ["Contact", "contact"],
] as const;

export default async function Home() {
  const [profile, projects, skills, certificates, education] = await Promise.all([
    db.profile.findFirst({ where: { published: true } }),
    db.project.findMany({ where: { status: "PUBLISHED" }, include: { skills: { include: { skill: true } } }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }], take: 4 }),
    db.skill.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }], take: 12 }),
    db.certificate.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { date: "desc" }], take: 4 }),
    db.education.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { startDate: "desc" }], take: 2 }),
  ]);

  return (
    <main>
      <nav className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", position: "sticky", top: 0, zIndex: 10, background: "rgba(7,11,18,.88)", backdropFilter: "blur(14px)" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-.04em" }}>KooMi<span style={{ color: "var(--accent)" }}>.</span></Link>
        <div style={{ display: "flex", gap: 18, fontSize: 13 }}>{sections.slice(0, 4).map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}<Link href="/dashboard">Workspace</Link></div>
      </nav>

      <section className="container" style={{ minHeight: "78vh", display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 60, alignItems: "center" }}>
        <div>
          <p style={{ color: "var(--accent)", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12 }}>Software • Systems • Growth</p>
          <h1 style={{ fontSize: "clamp(56px,9vw,108px)", lineHeight: .9, margin: "20px 0" }}>{profile?.headline ?? "Hussain"}<span style={{ color: "var(--accent)" }}>.</span></h1>
          <p className="muted" style={{ fontSize: 20, maxWidth: 620, lineHeight: 1.6 }}>{profile?.bio ?? "Aspiring Software Developer building practical, thoughtful digital systems with a focus on learning, reliability, and clean engineering."}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}><a href="#work" style={{ background: "var(--accent)", padding: "13px 18px", borderRadius: 10, fontWeight: 600 }}>View My Work</a><Link href="/resume/software-developer" style={{ border: "1px solid var(--border)", padding: "13px 18px", borderRadius: 10 }}>View Resume</Link></div>
        </div>
        <div className="surface" style={{ height: 440, display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}><div style={{ width: 210, height: 210, borderRadius: "50%", border: "1px solid #315b93", boxShadow: "0 0 100px rgba(59,130,246,.18)" }} /><span className="muted" style={{ position: "absolute", bottom: 24, fontSize: 12 }}>Interactive 3D layer initializes progressively</span></div>
      </section>

      <section id="about" className="container" style={{ padding: "100px 0" }}><p className="muted">01 / ABOUT</p><h2 style={{ fontSize: 48 }}>{profile?.headline ?? "Building toward software that matters."}</h2><p className="muted" style={{ maxWidth: 760, fontSize: 18, lineHeight: 1.8 }}>{profile?.workStyle ?? "This portfolio separates published professional content from private career data."}</p></section>

      <section id="work" className="container" style={{ padding: "60px 0" }}><p className="muted">02 / MY WORK</p><div style={{ display: "grid", gap: 16, marginTop: 18 }}>{projects.map((project) => <article className="surface" key={project.id} style={{ padding: 28 }}><p className="muted" style={{ margin: 0 }}>{project.featured ? "FEATURED" : "PROJECT"}</p><h3>{project.name}</h3><p className="muted">{project.description}</p><Link href={`/work/${project.slug}`}>View case study ↗</Link></article>)}{projects.length === 0 && <p className="muted">Selected work will appear here when projects are published.</p>}</div></section>

      <section id="skills" className="container" style={{ padding: "80px 0" }}><p className="muted">03 / SKILLS</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>{skills.map((skill) => <span key={skill.id} className="surface" style={{ padding: "10px 14px" }}>{skill.name}</span>)}{skills.length === 0 && <p className="muted">Published skills will appear here.</p>}</div></section>

      <section id="certificates" className="container" style={{ padding: "80px 0" }}><p className="muted">04 / CREDENTIALS</p><div style={{ display: "grid", gap: 12, marginTop: 18 }}>{certificates.map((item) => <article className="surface" key={item.id} style={{ padding: 20 }}><h3 style={{ margin: 0 }}>{item.title}</h3><p className="muted">{item.organization}{item.date ? ` · ${item.date.toLocaleDateString()}` : ""}</p></article>)}{certificates.length === 0 && <p className="muted">Published credentials will appear here.</p>}</div></section>

      <section id="education" className="container" style={{ padding: "80px 0" }}><p className="muted">05 / EDUCATION</p><div style={{ display: "grid", gap: 12, marginTop: 18 }}>{education.map((item) => <article className="surface" key={item.id} style={{ padding: 20 }}><p className="muted" style={{ margin: 0 }}>{item.institution}</p><h3>{item.degree}</h3><p className="muted">{item.startDate?.getFullYear() ?? ""}{item.endDate ? ` – ${item.endDate.getFullYear()}` : " – Present"}{item.score ? ` · ${item.score}` : ""}</p></article>)}{education.length === 0 && <p className="muted">Published education records will appear here.</p>}</div></section>

      <section id="goals" className="container" style={{ padding: "80px 0" }}><p className="muted">06 / FUTURE</p><h2>Future goals</h2><p className="muted">Public goals are managed separately from private career planning.</p><Link href="/goals">Explore published goals ↗</Link></section>

      <section id="contact" className="container" style={{ padding: "100px 0" }}><div className="surface" style={{ padding: 36 }}><p className="muted">07 / CONTACT</p><h2 style={{ fontSize: 48 }}>Let’s build something useful.</h2><ContactForm /></div></section>
      <footer className="container" style={{ padding: "30px 0 60px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}><span className="muted">© KooMi</span><span className="muted">Professional portfolio · Private career workspace</span></footer>
    </main>
  );
}

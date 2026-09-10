import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await db.skill.findMany({ where: { published: true }, include: { category: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }] });
  return <main className="container" style={{ padding: "90px 0" }}><p className="muted">SKILLS</p><h1>Skills</h1><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 30 }}>{skills.map((skill) => <article className="surface" key={skill.id} style={{ padding: 22 }}><h2 style={{ marginTop: 0 }}>{skill.name}</h2><p className="muted">{skill.category?.name ?? "Skill"} · {skill.proficiency}%</p></article>)}</div>{skills.length === 0 && <p className="muted">No published skills yet.</p>}</main>;
}

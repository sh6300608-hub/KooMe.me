import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { SkillManager } from "@/components/dashboard/skill-manager";

export default async function SkillsPage() {
  const user = await requireOwner();
  const [skills, categories] = await Promise.all([
    db.skill.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),
    db.skillCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Skills</h1>
      <p className="mt-2 mb-8 text-slate-400">Manage capabilities, proficiency, featured status, and public visibility.</p>
      <SkillManager initialSkills={skills} categories={categories} />
    </div>
  );
}

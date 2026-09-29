import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { EducationManager } from "@/components/dashboard/education-manager";

export default async function EducationPage() {
  const user = await requireOwner();
  const rows = await db.education.findMany({
    where: { userId: user.id },
    orderBy: [{ featured: "desc" }, { startDate: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Education</h1>
      <p className="mt-2 mb-8 text-slate-400">Manage academic history, scores, achievements, documents, and public publishing.</p>
      <EducationManager initialEducation={rows.map((row) => ({
        ...row,
        startDate: row.startDate?.toISOString() ?? null,
        endDate: row.endDate?.toISOString() ?? null,
      }))} />
    </div>
  );
}

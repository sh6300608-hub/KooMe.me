import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { GoalManager } from "@/components/dashboard/goal-manager";

export default async function GoalsPage() {
  const user = await requireOwner();
  const rows = await db.futureGoal.findMany({
    where: { userId: user.id },
    orderBy: [{ targetDate: "asc" }, { progress: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Future Goals</h1>
      <p className="mt-2 mb-8 text-slate-400">Track career, skill, project, and ambition goals. Private is the default.</p>
      <GoalManager initialGoals={rows.map((row) => ({ ...row, targetDate: row.targetDate?.toISOString() ?? null }))} />
    </div>
  );
}
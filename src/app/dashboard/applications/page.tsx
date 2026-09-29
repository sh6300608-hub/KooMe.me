import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { ApplicationManager } from "@/components/dashboard/application-manager";

export default async function ApplicationsPage() {
  const user = await requireOwner();
  const rows = await db.application.findMany({
    where: { userId: user.id },
    include: { interviews: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Applications</h1>
      <p className="mt-2 mb-8 text-slate-400">Track applications, follow-ups, interviews, and recruiting notes in one private pipeline.</p>
      <ApplicationManager initialApplications={rows.map((row) => ({
        ...row,
        applicationDate: row.applicationDate?.toISOString() ?? null,
        followUpDate: row.followUpDate?.toISOString() ?? null,
      }))} />
    </div>
  );
}

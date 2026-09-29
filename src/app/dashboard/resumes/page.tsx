import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { ResumeManager } from "@/components/dashboard/resume-manager";

export default async function ResumesPage() {
  const user = await requireOwner();
  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Resumes</h1>
      <p className="mt-2 mb-8 text-slate-400">Create versioned resume records and control which one is publicly published.</p>
      <ResumeManager initialResumes={resumes.map((r) => ({ id: r.id, slug: r.slug, name: r.name, description: r.description, status: r.status, version: r.versions[0]?.version ?? 0 }))} />
    </div>
  );
}
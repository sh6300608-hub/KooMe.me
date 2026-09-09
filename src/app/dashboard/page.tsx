import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export default async function DashboardPage() {
  const user = await requireOwner();
  const [projects, messages, resumes, applications, interviews, attendance] = await Promise.all([
    db.project.count({ where: { userId: user.id } }),
    db.contactMessage.count({ where: { userId: user.id, read: false, archived: false } }),
    db.resume.count({ where: { userId: user.id } }),
    db.application.count({ where: { userId: user.id } }),
    db.interview.count({ where: { userId: user.id } }),
    db.attendance.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 }),
  ]);

  const present = attendance.filter((entry) => entry.status === "PRESENT").length;
  const attendancePercent = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const cards = [
    ["Projects", String(projects)],
    ["Unread messages", String(messages)],
    ["Resumes", String(resumes)],
    ["Applications", String(applications)],
    ["Interviews", String(interviews)],
    ["Attendance", `${attendancePercent}%`],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <p className="text-sm text-blue-400">Private workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Good morning, {user.name ?? "Hussain"}.</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Your portfolio, applications, interviews and career records in one place.</p>
      </header>
      <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-medium">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400" href="/dashboard/work/new">Add project</a>
          <a className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800" href="/dashboard/certificates/new">Add certificate</a>
          <a className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800" href="/dashboard/resumes/new">Update resume</a>
          <a className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800" href="/dashboard/attendance">Mark attendance</a>
        </div>
      </section>
    </div>
  );
}

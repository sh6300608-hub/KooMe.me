import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export default async function DashboardOverviewPage() {
  const user = await requireOwner();
  const [projects, certificates, resumes, messages, applications, interviews, attendance, activities] = await Promise.all([
    db.project.count({ where: { userId: user.id } }),
    db.certificate.count({ where: { userId: user.id } }),
    db.resume.count({ where: { userId: user.id } }),
    db.contactMessage.count({ where: { userId: user.id, read: false, archived: false } }),
    db.application.count({ where: { userId: user.id } }),
    db.interview.count({ where: { userId: user.id } }),
    db.attendance.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 }),
    db.activityLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const present = attendance.filter((x) => x.status === "PRESENT").length;
  const attendancePct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const metrics = [["Projects", projects], ["Certificates", certificates], ["Resumes", resumes], ["Unread messages", messages], ["Applications", applications], ["Interviews", interviews], ["Attendance", `${attendancePct}%`]] as const;
  return <div className="mx-auto max-w-7xl space-y-8">
    <header><p className="text-sm text-blue-400">PRIVATE WORKSPACE</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you, {user.name ?? "Hussain"}.</h1><p className="mt-2 text-slate-400">Your career records, portfolio and recruiting workflow in one private place.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Portfolio metrics">{metrics.map(([label,value]) => <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></article>)}</section>
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h2 className="text-lg font-medium">Quick actions</h2><div className="mt-5 flex flex-wrap gap-3">{[["Add project","/dashboard/work/new"],["Add certificate","/dashboard/certificates/new"],["Update resume","/dashboard/resumes/new"],["Mark attendance","/dashboard/attendance"]].map(([label,href],i)=><a key={href} href={href} className={`rounded-lg px-4 py-2 text-sm font-medium ${i===0?"bg-blue-500 text-white hover:bg-blue-400":"border border-slate-700 hover:bg-slate-800"}`}>{label}</a>)}</div></div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"><h2 className="text-lg font-medium">Recent activity</h2>{activities.length===0?<p className="mt-4 text-sm text-slate-500">No activity yet.</p>:<ul className="mt-4 space-y-3">{activities.map((a)=><li key={a.id} className="border-b border-slate-800 pb-3 text-sm"><span className="text-slate-200">{a.action}</span><span className="ml-2 text-slate-500">{a.entity ?? "workspace"}</span></li>)}</ul>}</div>
    </section>
  </div>;
}

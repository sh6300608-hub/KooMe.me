import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import Link from "next/link";

export default async function WorkPage() {
  const user = await requireOwner();
  const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] });
  return <div className="mx-auto max-w-6xl"><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-blue-400">CONTENT</p><h1 className="mt-1 text-3xl font-semibold">My Work</h1></div><Link href="/dashboard/work/new" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium">Add project</Link></div><div className="mt-8 grid gap-4">{projects.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500">No projects yet. Add your first project when you have real work to publish.</div> : projects.map((project)=><article key={project.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-medium">{project.name}</h2><p className="mt-1 text-sm text-slate-400">/{project.slug}</p></div><span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">{project.status}</span></div><p className="mt-4 max-w-3xl text-slate-400">{project.description}</p><div className="mt-5 flex gap-3"><Link href={`/dashboard/work/${project.id}`} className="text-sm text-blue-400 hover:text-blue-300">Edit project →</Link>{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-white">GitHub ↗</a>}</div></article>)}</div></div>;
}

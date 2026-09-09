import { requireOwner } from "@/lib/owner";
import ProjectForm from "@/components/project-form";

export default async function NewProjectPage() { await requireOwner(); return <div className="mx-auto max-w-3xl"><h1 className="text-3xl font-semibold">New project</h1><p className="mt-2 text-slate-400">Create a draft first. Publishing is an explicit action.</p><div className="mt-8"><ProjectForm /></div></div>; }

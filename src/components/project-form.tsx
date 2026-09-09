"use client";
import { useState } from "react";

export default function ProjectForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.featured = form.get("featured") === "on" ? "true" : "false";
    const response = await fetch("/api/dashboard/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) { setError((await response.json()).error ?? "Unable to save project"); setSaving(false); return; }
    window.location.href = "/dashboard/work";
  }
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
    {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
    <div className="grid gap-5 sm:grid-cols-2"><Field name="name" label="Project name" required /><Field name="slug" label="URL slug" required /></div>
    <Field name="description" label="Description" required textarea />
    <div className="grid gap-5 sm:grid-cols-2"><Field name="problem" label="Problem" textarea /><Field name="solution" label="Solution" textarea /></div>
    <Field name="features" label="Features" textarea /><Field name="contribution" label="Your contribution" textarea />
    <div className="grid gap-5 sm:grid-cols-2"><Field name="impact" label="Results / impact" textarea /><Field name="challenges" label="Challenges" textarea /></div>
    <Field name="lessons" label="Lessons learned" textarea />
    <div className="grid gap-5 sm:grid-cols-2"><Field name="githubUrl" label="GitHub URL" type="url" /><Field name="liveUrl" label="Live demo URL" type="url" /></div>
    <label className="flex items-center gap-3 text-sm text-slate-300"><input name="featured" type="checkbox" className="size-4" /> Feature this project</label>
    <button disabled={saving} className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Save draft"}</button>
  </form>;
}
function Field({name,label,type="text",required=false,textarea=false}:{name:string;label:string;type?:string;required?:boolean;textarea?:boolean}) { const common={name,required,className:"mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-blue-500"}; return <label className="block text-sm text-slate-300">{label}{textarea?<textarea {...common} rows={4}/>:<input {...common} type={type}/>}</label>; }

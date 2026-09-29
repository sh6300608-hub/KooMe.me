"use client";

import { FormEvent, useState } from "react";

type Resume = { id: string; slug: string; name: string; description: string | null; status: "DRAFT" | "PREVIEW" | "PUBLISHED"; version: number };

export function ResumeManager({ initialResumes }: { initialResumes: Resume[] }) {
  const [rows, setRows] = useState(initialResumes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: String(form.get("slug") || ""),
          name: String(form.get("name") || ""),
          description: String(form.get("description") || "") || null,
          status: "DRAFT",
          data: {},
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create resume.");
      setRows((current) => [...current, {
        id: data.resume.id,
        slug: data.resume.slug,
        name: data.resume.name,
        description: data.resume.description,
        status: data.resume.status,
        version: 1,
      }].sort((a, b) => a.name.localeCompare(b.name)));
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create resume.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this resume and its versions?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete resume.");
      setRows((current) => current.filter((resume) => resume.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete resume.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
    <form onSubmit={create} className="surface space-y-4 p-6">
      <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Resume record</p><h2 className="mt-2 text-xl font-semibold">Create a version</h2></div>
      <label className="grid gap-2 text-sm">Name<input name="name" required maxLength={160} placeholder="Software Developer" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
      <label className="grid gap-2 text-sm">Public slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} placeholder="software-developer" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
      <label className="grid gap-2 text-sm">Description<textarea name="description" maxLength={1000} rows={3} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="btn btn-primary" type="submit">{busy ? "Working…" : "Create resume"}</button>
    </form>
    <div className="grid gap-4">
      {rows.length === 0 ? <div className="surface border-dashed p-10 text-center text-slate-500">No resumes yet.</div> : rows.map((resume) => (
        <article key={resume.id} className="surface flex flex-wrap items-center justify-between gap-4 p-6">
          <div><h3 className="text-lg font-semibold">{resume.name}</h3><p className="mt-1 text-sm text-slate-400">/{resume.slug} · version {resume.version} · {resume.status}</p>{resume.description && <p className="mt-2 text-sm text-slate-500">{resume.description}</p>}</div>
          <div className="flex gap-2">
            {resume.status === "PUBLISHED" && <a className="btn text-sm" href={`/resume/${resume.slug}`} target="_blank" rel="noreferrer">Open public resume ↗</a>}
            <button className="btn text-sm text-red-300" disabled={busy} onClick={() => remove(resume.id)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  </div>;
}

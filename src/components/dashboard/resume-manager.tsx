"use client";

import { FormEvent, useState } from "react";

type Resume = {
  id: string; slug: string; name: string; description: string | null;
  status: "DRAFT" | "PREVIEW" | "PUBLISHED"; version: number;
  data?: Record<string, unknown>;
};

type ResumeEditor = {
  headline: string; summary: string; email: string; location: string;
  github: string; linkedin: string;
  experience: string;
};

function editorData(resume?: Resume): ResumeEditor {
  const data = (resume?.data ?? {}) as Record<string, unknown>;
  const experience = Array.isArray(data.experience)
    ? data.experience.map((item) => {
        const x = item as Record<string, unknown>;
        return [x.title, x.company, x.period, x.description].map((v) => typeof v === "string" ? v : "").join(" | ");
      }).join("\n")
    : "";
  const links = Array.isArray(data.links) ? data.links as Record<string, unknown>[] : [];
  const link = (label: string) => {
    const found = links.find((x) => x.label === label);
    return typeof found?.url === "string" ? found.url : "";
  };
  return {
    headline: typeof data.headline === "string" ? data.headline : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    email: typeof data.email === "string" ? data.email : "",
    location: typeof data.location === "string" ? data.location : "",
    github: link("GitHub"), linkedin: link("LinkedIn"), experience,
  };
}

function toData(form: FormData) {
  const experience = String(form.get("experience") || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [title = "", company = "", period = "", description = ""] = line.split("|").map((x) => x.trim());
    return { title, company, period, description };
  });
  return {
    headline: String(form.get("headline") || ""),
    summary: String(form.get("summary") || ""),
    email: String(form.get("email") || ""),
    location: String(form.get("location") || ""),
    links: [
      { label: "GitHub", url: String(form.get("github") || "") },
      { label: "LinkedIn", url: String(form.get("linkedin") || "") },
    ].filter((x) => x.url),
    experience,
  };
}

export function ResumeManager({ initialResumes }: { initialResumes: Resume[] }) {
  const [rows, setRows] = useState(initialResumes);
  const [editing, setEditing] = useState<Resume | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: String(form.get("slug") || ""), name: String(form.get("name") || ""), description: String(form.get("description") || "") || null, status: "DRAFT", data: {} }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create resume.");
      setRows((current) => [...current, { id: data.resume.id, slug: data.resume.slug, name: data.resume.name, description: data.resume.description, status: data.resume.status, version: 1, data: {} }].sort((a,b)=>a.name.localeCompare(b.name)));
      setEditing(data.resume); event.currentTarget.reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create resume."); }
    finally { setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/resumes/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: String(form.get("slug") || ""), name: String(form.get("name") || ""),
          description: String(form.get("description") || "") || null,
          status: String(form.get("status") || "DRAFT"), data: toData(form),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save resume.");
      const next = { ...data.resume, data: toData(form), version: data.resume.versions?.[0]?.version ?? editing.version + 1 };
      setRows((current) => current.map((row) => row.id === editing.id ? next : row));
      setEditing(next); setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save resume."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this resume and its versions?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not delete resume.");
      setRows((current) => current.filter((resume) => resume.id !== id)); if (editing?.id === id) setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete resume."); }
    finally { setBusy(false); }
  }

  const editor = editorData(editing ?? undefined);

  return <div className="grid gap-8 lg:grid-cols-[390px_1fr]">
    <div className="grid gap-4">
      <form onSubmit={create} className="surface space-y-4 p-6">
        <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Resume record</p><h2 className="mt-2 text-xl font-semibold">Create resume</h2></div>
        <label className="grid gap-2 text-sm">Name<input name="name" required maxLength={160} placeholder="Software Developer" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Public slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} placeholder="software-developer" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Description<textarea name="description" maxLength={1000} rows={3} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <button disabled={busy} className="btn btn-primary" type="submit">{busy ? "Working…" : "Create resume"}</button>
      </form>
      {rows.length > 0 && <div className="grid gap-3">{rows.map((resume) => <button key={resume.id} type="button" onClick={() => setEditing(resume)} className={`surface p-4 text-left transition ${editing?.id === resume.id ? "border-blue-500/60" : ""}`}><strong>{resume.name}</strong><span className="mt-1 block text-xs text-slate-500">/{resume.slug} · v{resume.version} · {resume.status}</span></button>)}</div>}
    </div>

    <form key={editing?.id ?? "empty"} onSubmit={save} className="surface space-y-5 p-6">
      {!editing ? <div className="py-12 text-center text-slate-500">Create or select a resume to edit its content.</div> : <>
        <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Resume builder</p><h2 className="mt-2 text-xl font-semibold">{editing.name}</h2><p className="mt-1 text-sm text-slate-500">Every save creates a new version. Published content is available at /resume/{editing.slug}.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">Name<input name="name" required maxLength={160} defaultValue={editing.name} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={editing.slug} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        </div>
        <label className="grid gap-2 text-sm">Description<textarea name="description" rows={2} defaultValue={editing.description ?? ""} maxLength={1000} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">Headline<input name="headline" defaultValue={editor.headline} maxLength={180} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">Location<input name="location" defaultValue={editor.location} maxLength={160} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">Email<input name="email" type="email" defaultValue={editor.email} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">Status<select name="status" defaultValue={editing.status} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"><option>DRAFT</option><option>PREVIEW</option><option>PUBLISHED</option></select></label>
        </div>
        <label className="grid gap-2 text-sm">Professional summary<textarea name="summary" rows={5} maxLength={4000} defaultValue={editor.summary} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">GitHub<input name="github" type="url" defaultValue={editor.github} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">LinkedIn<input name="linkedin" type="url" defaultValue={editor.linkedin} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        </div>
        <label className="grid gap-2 text-sm">Experience <span className="text-xs text-slate-500">One per line: Title | Company | Period | Description</span><textarea name="experience" rows={8} defaultValue={editor.experience} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs" /></label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-2"><button disabled={busy} className="btn btn-primary" type="submit">{busy ? "Saving…" : "Save new version"}</button><button type="button" className="btn" onClick={() => setEditing(null)}>Close</button><button type="button" disabled={busy} className="btn text-red-300" onClick={() => remove(editing.id)}>Delete resume</button>{editing.status === "PUBLISHED" && <a className="btn" href={`/resume/${editing.slug}`} target="_blank" rel="noreferrer">Open public ↗</a>}</div>
      </>}
    </form>
  </div>;
}

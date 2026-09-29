"use client";

import { FormEvent, useState } from "react";

type Education = {
  id: string;
  degree: string;
  institution: string;
  board: string | null;
  startDate: string | null;
  endDate: string | null;
  score: string | null;
  subjects: string | null;
  achievements: string | null;
  description: string | null;
  documentUrl: string | null;
  featured: boolean;
  status: "DRAFT" | "PREVIEW" | "PUBLISHED";
};

export function EducationManager({ initialEducation }: { initialEducation: Education[] }) {
  const [rows, setRows] = useState(initialEducation);
  const [editing, setEditing] = useState<Education | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      degree: String(form.get("degree") || ""),
      institution: String(form.get("institution") || ""),
      board: String(form.get("board") || "") || null,
      startDate: String(form.get("startDate") || "") || null,
      endDate: String(form.get("endDate") || "") || null,
      score: String(form.get("score") || "") || null,
      subjects: String(form.get("subjects") || "") || null,
      achievements: String(form.get("achievements") || "") || null,
      description: String(form.get("description") || "") || null,
      documentUrl: String(form.get("documentUrl") || "") || null,
      featured: form.get("featured") === "on",
      status: String(form.get("status") || "DRAFT"),
    };
    try {
      const response = await fetch(editing ? `/api/education/${editing.id}` : "/api/education", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save education.");
      const normalized = {
        ...data.education,
        startDate: data.education.startDate ? new Date(data.education.startDate).toISOString() : null,
        endDate: data.education.endDate ? new Date(data.education.endDate).toISOString() : null,
      };
      setRows((current) => editing ? current.map((row) => row.id === normalized.id ? normalized : row) : [normalized, ...current]);
      setEditing(null);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save education.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this education record?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/education/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete education.");
      setRows((current) => current.filter((row) => row.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete education.");
    } finally {
      setBusy(false);
    }
  }

  const dateValue = (value: string | null) => value ? value.slice(0, 10) : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form key={editing?.id ?? "new"} onSubmit={submit} className="surface space-y-4 p-6">
        <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Education editor</p><h2 className="mt-2 text-xl font-semibold">{editing ? "Edit education" : "Add education"}</h2></div>
        <label className="grid gap-2 text-sm">Degree / course<input name="degree" required maxLength={180} defaultValue={editing?.degree || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Institution<input name="institution" required maxLength={180} defaultValue={editing?.institution || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Board / university<input name="board" maxLength={180} defaultValue={editing?.board || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">Start<input name="startDate" type="date" defaultValue={dateValue(editing?.startDate ?? null)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">End<input name="endDate" type="date" defaultValue={dateValue(editing?.endDate ?? null)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        </div>
        <label className="grid gap-2 text-sm">Score / CGPA / percentage<input name="score" maxLength={80} defaultValue={editing?.score || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Subjects<textarea name="subjects" maxLength={3000} rows={2} defaultValue={editing?.subjects || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Achievements<textarea name="achievements" maxLength={3000} rows={2} defaultValue={editing?.achievements || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Description<textarea name="description" maxLength={4000} rows={3} defaultValue={editing?.description || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Document URL<input name="documentUrl" type="url" maxLength={1000} defaultValue={editing?.documentUrl || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid gap-2 text-sm"><label className="flex items-center gap-2"><input name="featured" type="checkbox" defaultChecked={editing?.featured ?? false} /> Featured</label><label className="flex items-center gap-2">Status<select name="status" defaultValue={editing?.status || "DRAFT"} className="ml-auto rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"><option>DRAFT</option><option>PREVIEW</option><option>PUBLISHED</option></select></label></div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2"><button disabled={busy} className="btn btn-primary" type="submit">{busy ? "Saving…" : editing ? "Save changes" : "Add education"}</button>{editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>}</div>
      </form>
      <div className="grid gap-4">
        {rows.length === 0 ? <div className="surface border-dashed p-10 text-center text-slate-500">No education records yet.</div> : rows.map((row) => (
          <article key={row.id} className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="text-lg font-semibold">{row.degree}</h3><p className="mt-1 text-sm text-slate-400">{row.institution}{row.board ? ` · ${row.board}` : ""}</p><p className="mt-2 text-xs text-slate-500">{dateValue(row.startDate)}{row.endDate ? ` – ${dateValue(row.endDate)}` : ""}{row.score ? ` · ${row.score}` : ""} · {row.status}{row.featured ? " · Featured" : ""}</p></div>
              <div className="flex gap-2"><button className="btn text-sm" onClick={() => setEditing(row)}>Edit</button><button className="btn text-sm text-red-300" onClick={() => remove(row.id)}>Delete</button></div>
            </div>
            {row.description && <p className="mt-4 text-sm text-slate-400">{row.description}</p>}
            {row.achievements && <p className="mt-3 text-sm text-slate-500">Achievements: {row.achievements}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}

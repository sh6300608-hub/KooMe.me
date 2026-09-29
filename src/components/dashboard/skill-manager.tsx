"use client";

import { FormEvent, useState } from "react";

type Category = { id: string; name: string };
type Skill = {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  proficiency: number;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export function SkillManager({ initialSkills, categories }: { initialSkills: Skill[]; categories: Category[] }) {
  const [skills, setSkills] = useState(initialSkills);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      categoryId: String(form.get("categoryId") || ""),
      proficiency: Number(form.get("proficiency") || 0),
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };

    try {
      const response = await fetch(editing ? `/api/skills/${editing.id}` : "/api/skills", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save skill.");
      if (editing) {
        setSkills((current) => current.map((item) => item.id === data.skill.id ? data.skill : item));
      } else {
        setSkills((current) => [data.skill, ...current]);
      }
      setEditing(null);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save skill.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this skill?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete skill.");
      setSkills((current) => current.filter((item) => item.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete skill.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form key={editing?.id ?? "new"} onSubmit={submit} className="surface space-y-4 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Skill editor</p>
          <h2 className="mt-2 text-xl font-semibold">{editing ? "Edit skill" : "Add a skill"}</h2>
        </div>
        <label className="grid gap-2 text-sm">Name<input name="name" required maxLength={120} defaultValue={editing?.name || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Category<select name="categoryId" required defaultValue={editing?.categoryId || categories[0]?.id} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Proficiency<input name="proficiency" type="number" min="0" max="100" defaultValue={editing?.proficiency ?? 0} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Sort order<input name="sortOrder" type="number" min="0" max="10000" defaultValue={editing?.sortOrder ?? 0} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid gap-2 text-sm">
          <label className="flex items-center gap-2"><input name="featured" type="checkbox" defaultChecked={editing?.featured ?? false} /> Featured</label>
          <label className="flex items-center gap-2"><input name="published" type="checkbox" defaultChecked={editing?.published ?? false} /> Published</label>
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2"><button disabled={busy || categories.length === 0} className="btn btn-primary" type="submit">{busy ? "Saving…" : editing ? "Save changes" : "Add skill"}</button>{editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>}</div>
      </form>

      <div className="grid gap-4">
        {skills.length === 0 ? <div className="surface border-dashed p-10 text-center text-slate-500">No skills yet.</div> : skills.map((skill) => (
          <article key={skill.id} className="surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="font-semibold">{skill.name}</h3><p className="mt-1 text-xs text-slate-500">{skill.category.name} · {skill.proficiency}% · {skill.published ? "Published" : "Draft"}{skill.featured ? " · Featured" : ""}</p></div>
              <div className="flex gap-2"><button className="btn text-sm" onClick={() => setEditing(skill)}>Edit</button><button className="btn text-sm text-red-300" onClick={() => remove(skill.id)}>Delete</button></div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(100, skill.proficiency))}%` }} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}

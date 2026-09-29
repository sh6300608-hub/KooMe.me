"use client";

import { FormEvent, useState } from "react";

type Goal = {
  id: string;
  title: string;
  category: "CAREER" | "SKILL" | "PROJECT" | "AMBITION";
  progress: number;
  targetDate: string | null;
  notes: string | null;
  visibility: "PUBLIC" | "PRIVATE";
};

const categories = ["CAREER", "SKILL", "PROJECT", "AMBITION"] as const;

export function GoalManager({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || "CAREER"),
      progress: Number(form.get("progress") || 0),
      targetDate: String(form.get("targetDate") || "") || null,
      notes: String(form.get("notes") || "") || null,
      visibility: String(form.get("visibility") || "PRIVATE"),
    };

    try {
      const response = await fetch(editing ? `/api/goals/${editing.id}` : "/api/goals", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save goal.");
      setGoals((current) => editing ? current.map((goal) => goal.id === data.goal.id ? data.goal : goal) : [data.goal, ...current]);
      setEditing(null);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goal.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this goal?")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete goal.");
      setGoals((current) => current.filter((goal) => goal.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete goal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="surface space-y-4 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Goal editor</p>
          <h2 className="mt-2 text-xl font-semibold">{editing ? "Edit goal" : "Add a goal"}</h2>
        </div>
        <label className="grid gap-2 text-sm">Title<input name="title" required maxLength={160} defaultValue={editing?.title || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Category<select name="category" defaultValue={editing?.category || "CAREER"} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Progress: {editing?.progress || 0}%<input name="progress" type="range" min="0" max="100" defaultValue={editing?.progress || 0} /></label>
        <label className="grid gap-2 text-sm">Target date<input name="targetDate" type="date" defaultValue={editing?.targetDate ? editing.targetDate.slice(0, 10) : ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Visibility<select name="visibility" defaultValue={editing?.visibility || "PRIVATE"} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"><option>PRIVATE</option><option>PUBLIC</option></select></label>
        <label className="grid gap-2 text-sm">Notes<textarea name="notes" maxLength={4000} rows={4} defaultValue={editing?.notes || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2"><button disabled={busy} className="btn btn-primary" type="submit">{busy ? "Saving…" : editing ? "Save changes" : "Add goal"}</button>{editing && <button type="button" className="btn" onClick={() => setEditing(null)}>Cancel</button>}</div>
      </form>

      <div className="grid gap-4">
        {goals.length === 0 ? <div className="surface border-dashed p-10 text-center text-slate-500">No goals yet.</div> : goals.map((goal) => (
          <article key={goal.id} className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="text-lg font-semibold">{goal.title}</h3><p className="mt-1 text-xs text-slate-500">{goal.category} · {goal.visibility}</p></div>
              <div className="flex gap-2"><button className="btn text-sm" onClick={() => setEditing(goal)}>Edit</button><button className="btn text-sm text-red-300" onClick={() => remove(goal.id)}>Delete</button></div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${goal.progress}%` }} /></div>
            <p className="mt-2 text-right text-xs text-slate-500">{goal.progress}%{goal.targetDate ? ` · Target ${new Date(goal.targetDate).toLocaleDateString()}` : ""}</p>
            {goal.notes && <p className="mt-4 text-sm text-slate-400">{goal.notes}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
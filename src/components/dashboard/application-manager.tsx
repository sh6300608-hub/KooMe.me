"use client";

import { FormEvent, useState } from "react";

type Application = {
  id: string;
  company: string;
  jobTitle: string;
  status: string;
  jobUrl: string | null;
  location: string | null;
  notes: string | null;
  applicationDate: string | null;
  followUpDate: string | null;
  interviews: { id: string }[];
};

const statuses = ["SAVED", "APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];

export function ApplicationManager({ initialApplications }: { initialApplications: Application[] }) {
  const [rows, setRows] = useState(initialApplications);
  const [editing, setEditing] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      company: String(form.get("company") || ""),
      jobTitle: String(form.get("jobTitle") || ""),
      status: String(form.get("status") || "APPLIED"),
      jobUrl: String(form.get("jobUrl") || ""),
      location: String(form.get("location") || ""),
      notes: String(form.get("notes") || ""),
      applicationDate: String(form.get("applicationDate") || ""),
      followUpDate: String(form.get("followUpDate") || ""),
    };
    try {
      const response = await fetch(editing ? `/api/dashboard/applications/${editing.id}` : "/api/dashboard/applications", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save application.");
      if (editing) setRows((current) => current.map((item) => item.id === data.id ? { ...data, interviews: item.interviews } : item));
      else setRows((current) => [{ ...data, interviews: [] }, ...current]);
      setEditing(null); event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save application.");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this application?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/dashboard/applications/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete application.");
      setRows((current) => current.filter((item) => item.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete application."); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form key={editing?.id ?? "new"} onSubmit={save} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Recruiting pipeline</p><h2 className="mt-2 text-xl font-semibold">{editing ? "Edit application" : "Add application"}</h2></div>
        <label className="grid gap-2 text-sm">Company<input name="company" required maxLength={200} defaultValue={editing?.company || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Role<input name="jobTitle" required maxLength={200} defaultValue={editing?.jobTitle || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Status<select name="status" defaultValue={editing?.status || "APPLIED"} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Job URL<input name="jobUrl" type="url" defaultValue={editing?.jobUrl || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <label className="grid gap-2 text-sm">Location<input name="location" maxLength={200} defaultValue={editing?.location || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">Applied<input name="applicationDate" type="date" defaultValue={editing?.applicationDate?.slice(0,10) || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
          <label className="grid gap-2 text-sm">Follow-up<input name="followUpDate" type="date" defaultValue={editing?.followUpDate?.slice(0,10) || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        </div>
        <label className="grid gap-2 text-sm">Notes<textarea name="notes" rows={4} maxLength={5000} defaultValue={editing?.notes || ""} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2"><button disabled={busy} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-400 disabled:opacity-50">{busy ? "Saving…" : editing ? "Save changes" : "Add application"}</button>{editing && <button type="button" className="rounded-lg border border-slate-700 px-4 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button>}</div>
      </form>

      <div className="grid gap-4">
        {rows.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-slate-500">No applications yet.</div> : rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h3 className="font-semibold">{row.company}</h3><p className="mt-1 text-sm text-slate-400">{row.jobTitle} · {row.location || "Location not set"}</p></div>
              <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs">{row.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span>Applied: {row.applicationDate ? new Date(row.applicationDate).toLocaleDateString() : "—"}</span><span>Interviews: {row.interviews.length}</span>{row.followUpDate && <span>Follow-up: {new Date(row.followUpDate).toLocaleDateString()}</span>}</div>
            {row.notes && <p className="mt-3 text-sm text-slate-500">{row.notes}</p>}
            <div className="mt-4 flex gap-2">{row.jobUrl && <a className="rounded-lg border border-slate-700 px-3 py-2 text-xs" href={row.jobUrl} target="_blank" rel="noreferrer">Job ↗</a>}<button className="rounded-lg border border-slate-700 px-3 py-2 text-xs" onClick={() => setEditing(row)}>Edit</button><button className="rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-300" disabled={busy} onClick={() => remove(row.id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}

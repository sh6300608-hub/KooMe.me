"use client";

import { useState } from "react";

type Settings = {
  siteTitle: string;
  tagline: string;
  location: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  publicResumePath: string;
  analyticsEnabled: boolean;
};

export function SettingsManager({ initialSettings }: { initialSettings: Settings }) {
  const [form, setForm] = useState(initialSettings);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setState("saving");
    try {
      const response = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(response.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={save} className="mt-8 grid gap-6">
      <section className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:grid-cols-2">
        <label className="grid gap-2 text-sm"><span className="text-slate-400">Site title</span><input value={form.siteTitle} onChange={(e) => update("siteTitle", e.target.value)} maxLength={120} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm"><span className="text-slate-400">Tagline</span><input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} maxLength={240} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm"><span className="text-slate-400">Location</span><input value={form.location} onChange={(e) => update("location", e.target.value)} maxLength={120} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm"><span className="text-slate-400">Contact email</span><input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm"><span className="text-slate-400">GitHub URL</span><input type="url" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm"><span className="text-slate-400">LinkedIn URL</span><input type="url" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
        <label className="grid gap-2 text-sm sm:col-span-2"><span className="text-slate-400">Public resume path</span><input value={form.publicResumePath} onChange={(e) => update("publicResumePath", e.target.value)} placeholder="/resume/software-developer" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-blue-400" /></label>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={form.analyticsEnabled} onChange={(e) => update("analyticsEnabled", e.target.checked)} className="mt-1 h-4 w-4 accent-blue-500" />
          <span><span className="font-medium">Enable privacy-conscious analytics</span><span className="mt-1 block text-slate-500">Controls portfolio analytics collection. No personal visitor identity is stored by this setting.</span></span>
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === "saving"} className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">{state === "saving" ? "Saving…" : "Save settings"}</button>
        {state === "saved" && <span className="text-sm text-emerald-400" role="status">Settings saved.</span>}
        {state === "error" && <span className="text-sm text-red-400" role="alert">Could not save. Check the fields and try again.</span>}
      </div>
    </form>
  );
}

"use client";

import { ChangeEvent, useState } from "react";

type DocumentItem = { id: string; name: string; mimeType: string; size: number; folder: string | null; createdAt: string };

export function DocumentManager({ initialDocuments }: { initialDocuments: DocumentItem[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/dashboard/documents", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      setDocuments((current) => [{ ...data.document, createdAt: new Date(data.document.createdAt).toISOString() }, ...current]);
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this private document?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/dashboard/documents/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed.");
      setDocuments((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface flex flex-wrap items-center justify-between gap-5 p-6">
        <div><h2 className="font-medium">Upload private document</h2><p className="mt-1 text-sm text-slate-500">PDF, PNG, JPEG, WebP, TXT or DOCX up to 10 MB.</p></div>
        <label className="btn btn-primary cursor-pointer">
          {busy ? "Working…" : "Choose file"}
          <input className="sr-only" type="file" disabled={busy} accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx" onChange={upload} />
        </label>
      </div>
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
      <div className="grid gap-3">
        {documents.map((document) => (
          <article key={document.id} className="surface flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="font-medium">{document.name}</h2>
              <p className="mt-1 text-xs text-slate-500">{document.folder ?? "Unsorted"} · {document.mimeType} · {document.size.toLocaleString()} bytes · {new Date(document.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <a className="btn" href={`/api/dashboard/documents/${document.id}/download`}>Download</a>
              <button className="btn text-red-300" type="button" disabled={busy} onClick={() => remove(document.id)}>Delete</button>
            </div>
          </article>
        ))}
        {!documents.length && <p className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">No private documents yet.</p>}
      </div>
    </div>
  );
}

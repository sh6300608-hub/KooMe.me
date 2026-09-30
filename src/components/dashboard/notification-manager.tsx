"use client";

import { useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationManager({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [items, setItems] = useState(initialNotifications);
  const [busy, setBusy] = useState(false);

  async function update(action: "read" | "unread" | "read-all", id?: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/dashboard/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      if (!response.ok) throw new Error("Request failed");
      setItems((current) =>
        action === "read-all"
          ? current.map((item) => ({ ...item, read: true }))
          : current.map((item) => item.id === id ? { ...item, read: action === "read" } : item),
      );
    } finally {
      setBusy(false);
    }
  }

  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{unread} unread notification{unread === 1 ? "" : "s"}.</p>
        <button className="btn" type="button" disabled={!unread || busy} onClick={() => update("read-all")}>
          Mark all read
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-5 transition ${item.read ? "border-slate-800 bg-slate-950/40" : "border-blue-500/30 bg-blue-500/5"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="tag">{item.type}</span>
                  {!item.read && <span className="h-2 w-2 rounded-full bg-blue-400" aria-label="Unread" />}
                </div>
                <h2 className="mt-3 font-medium">{item.title}</h2>
                {item.body && <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>}
              </div>
              <time className="text-xs text-slate-600">{new Date(item.createdAt).toLocaleString()}</time>
            </div>
            <div className="mt-4">
              <button className="text-xs font-medium text-blue-300 hover:text-blue-200" type="button" disabled={busy}
                onClick={() => update(item.read ? "unread" : "read", item.id)}>
                {item.read ? "Mark unread" : "Mark read"}
              </button>
            </div>
          </article>
        ))}
        {!items.length && <p className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">No notifications yet.</p>}
      </div>
    </div>
  );
}

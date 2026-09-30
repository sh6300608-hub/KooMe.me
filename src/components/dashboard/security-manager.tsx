"use client";

import { useState } from "react";

type SessionItem = {
  id: string;
  device: string | null;
  userAgent: string | null;
  expires: string;
  lastSeenAt: string;
  createdAt: string;
};

export function SecurityManager({ initialSessions }: { initialSessions: SessionItem[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [busy, setBusy] = useState(false);

  async function revoke(action: "revoke" | "revoke-others" | "revoke-all", sessionId?: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/dashboard/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId }),
      });
      if (!response.ok) throw new Error("Request failed");
      if (action === "revoke") setSessions((current) => current.filter((session) => session.id !== sessionId));
      else if (action === "revoke-others") {
        window.location.reload();
      } else {
        setSessions([]);
        window.location.assign("/login");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">Active sessions</h2>
          <p className="mt-1 text-sm text-slate-500">Revoke sessions you no longer recognize or use.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" type="button" disabled={busy || sessions.length < 2} onClick={() => revoke("revoke-others")}>Revoke others</button>
          <button className="btn border-red-500/30 text-red-300 hover:border-red-400" type="button" disabled={busy || !sessions.length} onClick={() => revoke("revoke-all")}>Log out all</button>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{session.device ?? "Unknown device"}</p>
                <p className="mt-1 max-w-2xl break-words text-xs text-slate-500">{session.userAgent ?? "User agent unavailable"}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Last seen {new Date(session.lastSeenAt).toLocaleString()} · Expires {new Date(session.expires).toLocaleDateString()}
                </p>
              </div>
              <button className="text-xs font-medium text-red-300 hover:text-red-200" type="button" disabled={busy} onClick={() => revoke("revoke", session.id)}>
                Revoke
              </button>
            </div>
          </div>
        ))}
        {!sessions.length && <p className="text-sm text-slate-500">No active sessions.</p>}
      </div>
    </div>
  );
}

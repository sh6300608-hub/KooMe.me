import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";

export default async function BackupsPage() {
  const user = await requireOwner();
  const backups = await db.backup.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Backups</h1>
        <p className="mt-2 text-slate-400">Export your owner-owned workspace data as a portable JSON backup. Secrets and active sessions are never included.</p>
      </header>

      <section className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="font-medium">Create a backup</h2>
            <p className="mt-1 text-sm text-slate-500">The export contains portfolio, career workspace, messages, attendance, settings and activity records.</p>
          </div>
          <a className="btn btn-primary" href="/api/dashboard/backups/export">Download JSON backup</a>
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="font-medium">Export history</h2>
        <div className="mt-4 space-y-3">
          {backups.map((backup) => (
            <div key={backup.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 py-3 text-sm">
              <div>
                <p className="font-medium">{backup.key}</p>
                <p className="mt-1 text-xs text-slate-500">{backup.size?.toLocaleString() ?? "Unknown"} bytes</p>
              </div>
              <time className="text-xs text-slate-600">{backup.createdAt.toLocaleString()}</time>
            </div>
          ))}
          {!backups.length && <p className="text-sm text-slate-500">No exports created yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="font-medium">Restore</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Restore requires an explicit import flow so a malformed or stale backup cannot silently overwrite live records.
          The current release provides safe export first; destructive restore is kept out of the public surface until its conflict and rollback rules are implemented.
        </p>
      </section>
    </div>
  );
}

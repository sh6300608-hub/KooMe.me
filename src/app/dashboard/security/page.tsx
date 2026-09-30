import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { SecurityManager } from "@/components/dashboard/security-manager";

export default async function SecurityPage() {
  const u = await requireOwner();
  const [sessions, events] = await Promise.all([
    db.session.findMany({ where: { userId: u.id }, orderBy: { lastSeenAt: "desc" } }),
    db.securityEvent.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">Security</h1>
        <p className="mt-2 text-slate-400">Control active sessions and review recent account security events.</p>
      </header>

      <SecurityManager initialSessions={sessions.map((session) => ({
        id: session.id,
        device: session.device,
        userAgent: session.userAgent,
        expires: session.expires.toISOString(),
        lastSeenAt: session.lastSeenAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
      }))} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="font-medium">Recent security events</h2>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-wrap justify-between gap-4 border-b border-slate-800 py-3 text-sm">
              <span className={event.success ? "text-slate-300" : "text-red-400"}>{event.event}</span>
              <time className="text-xs text-slate-600">{event.createdAt.toLocaleString()}</time>
            </div>
          ))}
          {!events.length && <p className="text-sm text-slate-500">No security events recorded yet.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="font-medium">Two-factor authentication</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Two-factor enrollment is not enabled yet because the project has no configured authenticator or email delivery provider.
          The dashboard does not present a fake security control as if it were protecting the account.
        </p>
      </section>
    </div>
  );
}

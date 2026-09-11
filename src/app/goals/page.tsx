import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  CAREER: "Career Goals",
  SKILL: "Skills to Learn",
  PROJECT: "Future Projects",
  AMBITION: "Long-Term Ambitions",
};

export default async function GoalsPage() {
  const items = await db.futureGoal.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: [{ category: "asc" }, { targetDate: "asc" }],
  });

  return (
    <main className="container" style={{ padding: "90px 0" }}>
      <p className="muted">DIRECTION</p>
      <h1>Future goals</h1>
      <p className="muted" style={{ maxWidth: 720 }}>
        A public view of goals that have deliberately been marked public. Private planning stays private, because apparently not every thought needs a landing page.
      </p>
      <div style={{ display: "grid", gap: 16, marginTop: 30 }}>
        {items.map((item) => (
          <article className="surface" key={item.id} style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0 }}>{labels[item.category] ?? item.category}</p>
            <h2 style={{ margin: "8px 0 16px" }}>{item.title}</h2>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(148,163,184,.18)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.max(0, item.progress))}%`, height: "100%", background: "var(--accent, #6d8cff)" }} />
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>{item.progress}% complete{item.targetDate ? ` · target ${item.targetDate.toLocaleDateString()}` : ""}</p>
            {item.notes && <p>{item.notes}</p>}
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="muted">No public goals yet.</p>}
    </main>
  );
}

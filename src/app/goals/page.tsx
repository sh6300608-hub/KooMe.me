import { db } from "@/lib/db";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { CAREER: "Career Goals", SKILL: "Skills to Learn", PROJECT: "Future Projects", AMBITION: "Long-Term Ambitions" };

export default async function GoalsPage() {
  const items = await db.futureGoal.findMany({ where: { visibility: "PUBLIC" }, orderBy: [{ category: "asc" }, { targetDate: "asc" }] });
  return (
    <><SiteNav /><main className="container page-shell">
      <section className="page-hero"><p className="eyebrow">DIRECTION</p><h1>Future goals</h1><p className="lead">A focused view of the goals that are intentionally public. Private planning stays private.</p></section>
      <div className="goal-list">
        {items.map((item) => <article className="surface goal-card" key={item.id}>
          <div className="goal-meta"><span className="tag">{labels[item.category] ?? item.category}</span>{item.targetDate && <span className="muted">Target {item.targetDate.toLocaleDateString()}</span>}</div>
          <h2>{item.title}</h2>
          <div className="progress" aria-label={`${item.progress}% complete`}><span style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} /></div>
          <div className="goal-footer"><span>{item.progress}% complete</span>{item.notes && <span className="muted">{item.notes}</span>}</div>
        </article>)}
      </div>
      {!items.length && <div className="surface empty-state"><h2>No public goals yet</h2><p className="muted">Goals will appear here after they are intentionally published.</p></div>}
    </main><SiteFooter /></>
  );
}

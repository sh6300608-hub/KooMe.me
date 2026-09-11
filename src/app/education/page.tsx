import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EducationPage() {
  const items = await db.education.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { startDate: "desc" }],
  });

  return (
    <main className="container" style={{ padding: "90px 0" }}>
      <p className="muted">EDUCATION</p>
      <h1>Education</h1>
      <p className="muted" style={{ maxWidth: 720 }}>
        Academic background, relevant coursework, and verified progress. Only published records appear here.
      </p>
      <div style={{ display: "grid", gap: 16, marginTop: 30 }}>
        {items.map((item) => (
          <article className="surface" key={item.id} style={{ padding: 24 }}>
            <p className="muted" style={{ margin: 0 }}>{item.institution}</p>
            <h2 style={{ margin: "8px 0" }}>{item.degree}</h2>
            <p className="muted">
              {item.startDate?.getFullYear() ?? ""}
              {item.endDate ? ` – ${item.endDate.getFullYear()}` : " – Present"}
              {item.score ? ` · ${item.score}` : ""}
            </p>
            {item.description && <p>{item.description}</p>}
            {item.subjects && (
              <div style={{ marginTop: 18 }}>
                <p className="muted" style={{ marginBottom: 8 }}>Relevant coursework</p>
                <p style={{ margin: 0 }}>{item.subjects.split(";").join(" · ")}</p>
              </div>
            )}
            {item.achievements && (
              <div style={{ marginTop: 18 }}>
                <p className="muted" style={{ marginBottom: 8 }}>Progress</p>
                <p style={{ margin: 0 }}>{item.achievements}</p>
              </div>
            )}
          </article>
        ))}
      </div>
      {items.length === 0 && <p className="muted">No published education records yet.</p>}
    </main>
  );
}

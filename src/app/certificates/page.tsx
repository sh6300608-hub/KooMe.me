import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const items = await db.certificate.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { date: "desc" }] });
  return <main className="container" style={{ padding: "90px 0" }}><p className="muted">CREDENTIALS</p><h1>Certificates & achievements</h1><div style={{ display: "grid", gap: 16, marginTop: 30 }}>{items.map((item) => <article className="surface" key={item.id} style={{ padding: 24 }}><h2 style={{ marginTop: 0 }}>{item.title}</h2><p className="muted">{item.organization}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ""}</p>{item.verificationUrl && <a href={item.verificationUrl} target="_blank" rel="noreferrer">Verify credential ↗</a>}</article>)}</div>{items.length === 0 && <p className="muted">No published credentials yet.</p>}</main>;
}

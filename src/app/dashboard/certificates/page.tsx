import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { CertificateManager } from "@/components/dashboard/certificate-manager";

export default async function CertificatesPage() {
  const user = await requireOwner();
  const rows = await db.certificate.findMany({ where: { userId: user.id }, orderBy: [{ featured: "desc" }, { date: "desc" }] });
  return <div className="mx-auto max-w-6xl">
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
    <h1 className="mt-2 text-3xl font-semibold">Certificates</h1>
    <p className="mt-2 mb-8 text-slate-400">Manage credentials, verification links, related skills, visibility, and featured status.</p>
    <CertificateManager initialCertificates={rows.map(row => ({ ...row, date: row.date?.toISOString() ?? null }))} />
  </div>;
}

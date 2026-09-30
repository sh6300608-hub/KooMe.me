import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { DocumentManager } from "@/components/dashboard/document-manager";

export default async function DocumentsPage() {
  const u = await requireOwner();
  const rows = await db.document.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Documents</h1>
      <p className="mt-2 mb-8 text-slate-400">Private career documents stay behind owner authentication and are never exposed through public portfolio routes.</p>
      <DocumentManager initialDocuments={rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))} />
    </div>
  );
}

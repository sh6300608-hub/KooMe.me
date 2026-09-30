import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { NotificationManager } from "@/components/dashboard/notification-manager";

export default async function NotificationsPage() {
  const u = await requireOwner();
  const rows = await db.notification.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Notifications</h1>
      <p className="mt-2 mb-8 text-slate-400">Review system notices and keep your workspace state current.</p>
      <NotificationManager initialNotifications={rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))} />
    </div>
  );
}

import { requireOwner } from "@/lib/owner";
import Link from "next/link";

const sections = [
  ["Overview", "/dashboard"],
  ["My Work", "/dashboard/work"],
  ["Skills", "/dashboard/skills"],
  ["Certificates", "/dashboard/certificates"],
  ["Education", "/dashboard/education"],
  ["Future Goals", "/dashboard/goals"],
  ["Resumes", "/dashboard/resumes"],
  ["Recruiters", "/dashboard/recruiters"],
  ["Applications", "/dashboard/applications"],
  ["Interviews", "/dashboard/interviews"],
  ["Messages", "/dashboard/messages"],
  ["Documents", "/dashboard/documents"],
  ["Attendance", "/dashboard/attendance"],
  ["Analytics", "/dashboard/analytics"],
  ["Notifications", "/dashboard/notifications"],
  ["Activity", "/dashboard/activity"],
  ["Security", "/dashboard/security"],
  ["Settings", "/dashboard/settings"],
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r border-slate-800 bg-slate-950/95 p-5 lg:min-h-screen">
        <div className="mb-8">
          <Link href="/" className="text-xl font-semibold tracking-tight">KooMi</Link>
          <p className="mt-1 text-xs text-slate-500">Private career workspace</p>
        </div>
        <nav aria-label="Dashboard navigation" className="grid gap-1">
          {sections.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Signed in as {user.email}
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8">{children}</main>
    </div>
  );
}

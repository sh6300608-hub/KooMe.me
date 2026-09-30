import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { RecruiterManager } from "@/components/dashboard/recruiter-manager";

export default async function RecruitersPage(){
  const u=await requireOwner();
  const rows=await db.recruiter.findMany({where:{userId:u.id},include:{applications:{select:{id:true}}},orderBy:[{priority:"desc"},{name:"asc"}]});
  return <div className="mx-auto max-w-7xl"><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Recruiters</h1><p className="mt-2 mb-8 text-slate-400">Manage recruiter contacts, follow-ups, priorities, and linked applications in one private workspace.</p><RecruiterManager initialRecruiters={rows.map(x=>({...x,followUpDate:x.followUpDate?.toISOString()||null}))}/></div>
}
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { InterviewManager } from "@/components/dashboard/interview-manager";

export default async function InterviewsPage(){
  const user=await requireOwner();
  const [rows,applications]=await Promise.all([
    db.interview.findMany({where:{userId:user.id},orderBy:{dateTime:"asc"}}),
    db.application.findMany({where:{userId:user.id},select:{id:true,company:true,jobTitle:true},orderBy:{createdAt:"desc"}})
  ]);
  return <div className="mx-auto max-w-7xl"><p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p><h1 className="mt-2 text-3xl font-semibold">Interviews</h1><p className="mt-2 mb-8 text-slate-400">Schedule interviews, connect them to applications, and keep preparation and outcomes private.</p><InterviewManager initialInterviews={rows.map(x=>({...x,dateTime:x.dateTime.toISOString(),nextRound:x.nextRound?.toISOString()||null}))} applications={applications}/></div>
}
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireOwner() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "OWNER") throw new Error("FORBIDDEN");
  return user;
}

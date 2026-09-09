import { db } from "@/lib/db";

export async function publishEntity(entity: string, entityId: string, data: unknown, userId: string, version: number) {
  return db.$transaction(async (tx) => {
    const snapshot = await tx.publishedVersion.create({ data: { entity, entityId, version, data: data as object } });
    await tx.activityLog.create({ data: { userId, action: "PUBLISH", entity, entityId, metadata: { version } } });
    return snapshot;
  });
}

export async function latestPublishedEntity(entity: string, entityId: string) {
  return db.publishedVersion.findFirst({ where: { entity, entityId }, orderBy: { version: "desc" } });
}

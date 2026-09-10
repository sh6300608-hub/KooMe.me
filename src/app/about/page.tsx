import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await db.profile.findFirst({ where: { published: true }, include: { photos: { where: { published: true }, orderBy: { sortOrder: "asc" } } } });
  return <main className="container" style={{ padding: "90px 0" }}><p className="muted">ABOUT</p><h1>{profile?.headline ?? "About"}</h1><p className="muted" style={{ maxWidth: 760, fontSize: 19, lineHeight: 1.8 }}>{profile?.bio ?? "Published profile information will appear here."}</p>{profile?.photos.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 40 }}>{profile.photos.map((photo) => <img key={photo.id} src={photo.url} alt={photo.altText ?? "Profile photo"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 16 }} />)}</div> : null}</main>;
}

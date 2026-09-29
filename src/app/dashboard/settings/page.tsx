import { db } from "@/lib/db";
import { requireOwner } from "@/lib/owner";
import { SettingsManager } from "@/components/dashboard/settings-manager";

const defaults = {
  siteTitle: "",
  tagline: "",
  location: "",
  contactEmail: "",
  githubUrl: "",
  linkedinUrl: "",
  publicResumePath: "",
  analyticsEnabled: false,
};

export default async function SettingsPage() {
  const user = await requireOwner();
  const record = await db.siteSettings.findUnique({ where: { userId: user.id } });
  const raw = record?.settings && typeof record.settings === "object" && !Array.isArray(record.settings)
    ? record.settings as Record<string, unknown>
    : {};

  const settings = {
    ...defaults,
    siteTitle: typeof raw.siteTitle === "string" ? raw.siteTitle : defaults.siteTitle,
    tagline: typeof raw.tagline === "string" ? raw.tagline : defaults.tagline,
    location: typeof raw.location === "string" ? raw.location : defaults.location,
    contactEmail: typeof raw.contactEmail === "string" ? raw.contactEmail : defaults.contactEmail,
    githubUrl: typeof raw.githubUrl === "string" ? raw.githubUrl : defaults.githubUrl,
    linkedinUrl: typeof raw.linkedinUrl === "string" ? raw.linkedinUrl : defaults.linkedinUrl,
    publicResumePath: typeof raw.publicResumePath === "string" ? raw.publicResumePath : defaults.publicResumePath,
    analyticsEnabled: raw.analyticsEnabled === true,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-400">Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-slate-400">Control public portfolio metadata and privacy-aware workspace behavior.</p>
      <SettingsManager initialSettings={settings} />
    </div>
  );
}

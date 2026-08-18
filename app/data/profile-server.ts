import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { portfolioProfile } from "../../db/schema";
import { profile, type EditableProfile, type SocialLinks } from "./profile";

const PROFILE_ROW_ID = "default";
const editableStringFields = [
  "name", "initials", "title", "subtitle", "location", "availability",
  "focus", "email", "bio", "summary",
] as const;

export async function getProfile(): Promise<typeof profile> {
  try {
    const [row] = await (await getDb()).select().from(portfolioProfile).where(eq(portfolioProfile.id, PROFILE_ROW_ID)).limit(1);
    if (!row) return profile;
    const saved = JSON.parse(row.content) as Partial<EditableProfile>;
    return { ...profile, ...pickSavedProfile(saved), values: saved.values ?? profile.values, socials: { ...profile.socials, ...saved.socials } };
  } catch {
    return profile;
  }
}

export function parseEditableProfile(input: unknown): EditableProfile {
  if (!input || typeof input !== "object") throw new Error("Invalid profile payload");
  const value = input as Record<string, unknown>;
  const result = {} as Record<(typeof editableStringFields)[number], string>;
  for (const field of editableStringFields) {
    const item = value[field];
    if (typeof item !== "string" || item.length > 5000) throw new Error(`Invalid ${field}`);
    result[field] = item.trim();
  }
  const values = value.values;
  if (!Array.isArray(values) || values.length > 20 || values.some((item) => typeof item !== "string" || item.length > 120)) {
    throw new Error("Invalid values");
  }
  const socials = value.socials;
  if (!socials || typeof socials !== "object") throw new Error("Invalid socials");
  const links = socials as Record<string, unknown>;
  const parsedSocials = {} as SocialLinks;
  for (const field of ["github", "linkedin", "email"] as const) {
    if (typeof links[field] !== "string" || links[field].length > 1000) throw new Error(`Invalid socials.${field}`);
    parsedSocials[field] = links[field].trim();
  }
  return { ...result, values: values.map((item) => item.trim()).filter(Boolean), socials: parsedSocials };
}

export async function saveProfile(input: unknown) {
  const saved = parseEditableProfile(input);
  const db = await getDb();
  await db.insert(portfolioProfile).values({ id: PROFILE_ROW_ID, content: JSON.stringify(saved), updatedAt: Date.now() }).onConflictDoUpdate({
    target: portfolioProfile.id,
    set: { content: JSON.stringify(saved), updatedAt: Date.now() },
  });
}

export async function requireProfileEditor() {
  const user = await requireChatGPTUser("/customize");
  if (!(await isProfileEditor(user))) notFound();
  return user;
}

export async function isProfileEditor(user: { userId: string; email: string }) {
  const editorUserId = await getEditorUserId();
  const editorEmail = await getEditorEmail();
  return Boolean((editorUserId && user.userId === editorUserId) || (editorEmail && user.email.toLowerCase() === editorEmail.toLowerCase()));
}

export async function getEditorUserId() {
  try {
    const { env } = await import("cloudflare:workers");
    return (env as unknown as Record<string, string | undefined>).PORTFOLIO_EDITOR_USER_ID ?? process.env.PORTFOLIO_EDITOR_USER_ID;
  } catch {
    return process.env.PORTFOLIO_EDITOR_USER_ID;
  }
}

export async function getEditorEmail() {
  try {
    const { env } = await import("cloudflare:workers");
    return (env as unknown as Record<string, string | undefined>).PORTFOLIO_EDITOR_EMAIL ?? process.env.PORTFOLIO_EDITOR_EMAIL;
  } catch {
    return process.env.PORTFOLIO_EDITOR_EMAIL;
  }
}

async function getDb() {
  return (await import("../../db")).getDb();
}

function pickSavedProfile(saved: Partial<EditableProfile>) {
  return Object.fromEntries(editableStringFields.map((field) => [field, saved[field] ?? profile[field]])) as Pick<EditableProfile, (typeof editableStringFields)[number]>;
}

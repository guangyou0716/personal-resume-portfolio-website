import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { requireChatGPTUser } from "../chatgpt-auth";
import { portfolioProfile } from "../../db/schema";
import { education, experience, profile, skillGroups, type EditableProfile, type EducationItem, type ExperienceItem, type SkillGroup, type SocialLinks } from "./profile";

const PROFILE_ROW_ID = "default";
const editableStringFields = [
  "name", "initials", "avatar", "title", "subtitle", "location", "availability",
  "focus", "email", "bio", "summary",
] as const;

export const getProfile = cache(async (): Promise<typeof profile & Pick<EditableProfile, "experience" | "skillGroups" | "education" | "githubCovers">> => {
  try {
    const [row] = await (await getDb()).select().from(portfolioProfile).where(eq(portfolioProfile.id, PROFILE_ROW_ID)).limit(1);
    if (!row) return defaultProfile();
    const saved = JSON.parse(row.content) as Partial<EditableProfile>;
    return {
      ...profile,
      ...pickSavedProfile(saved),
      values: saved.values ?? profile.values,
      socials: { ...profile.socials, ...saved.socials },
      experience: Array.isArray(saved.experience) ? saved.experience : experience,
      skillGroups: Array.isArray(saved.skillGroups) ? saved.skillGroups : skillGroups,
      education: Array.isArray(saved.education) ? saved.education : education,
      githubCovers: parseGitHubCovers(saved.githubCovers ?? {}),
    };
  } catch {
    return defaultProfile();
  }
});

export function parseEditableProfile(input: unknown): EditableProfile {
  if (!input || typeof input !== "object") throw new Error("Invalid profile payload");
  const value = input as Record<string, unknown>;
  const result = {} as Record<(typeof editableStringFields)[number], string>;
  for (const field of editableStringFields) {
    const item = value[field];
    if (typeof item !== "string" || item.length > 5000) throw new Error(`Invalid ${field}`);
    if (field === "avatar" && item && !/^(https?:\/\/|\/)/.test(item.trim())) throw new Error("Invalid avatar URL");
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
  return {
    ...result,
    values: values.map((item) => item.trim()).filter(Boolean),
    socials: parsedSocials,
    experience: parseExperience(value.experience ?? experience),
    skillGroups: parseSkillGroups(value.skillGroups ?? skillGroups),
    education: parseEducation(value.education ?? education),
    githubCovers: parseGitHubCovers(value.githubCovers ?? {}),
  };
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
  const [editorUserId, editorEmail] = await Promise.all([getEditorUserId(), getEditorEmail()]);
  return Boolean((editorUserId && user.userId === editorUserId) || (editorEmail && user.email.toLowerCase() === editorEmail.toLowerCase()));
}

export type GitHubRepository = { name: string; description: string; htmlUrl: string; language: string; stars: number };

export const getGitHubRepositories = cache(async (githubUrl: string): Promise<GitHubRepository[]> => {
  try {
    const url = new URL(githubUrl);
    const username = url.hostname.toLowerCase() === "github.com" ? url.pathname.split("/").filter(Boolean)[0] : undefined;
    if (!username || username === "your-username") return [];
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=6`, {
      headers: { accept: "application/vnd.github+json", "user-agent": "personal-resume-portfolio" },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter(isRecord).filter((repo) => repo.archived !== true && repo.fork !== true && typeof repo.name === "string" && typeof repo.html_url === "string").map((repo) => ({
      name: repo.name as string,
      description: typeof repo.description === "string" ? repo.description : "Public repository on GitHub.",
      htmlUrl: repo.html_url as string,
      language: typeof repo.language === "string" ? repo.language : "GitHub",
      stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
    }));
  } catch {
    return [];
  }
});

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

function defaultProfile() {
  return { ...profile, experience, skillGroups, education, githubCovers: {} };
}

function parseGitHubCovers(value: unknown): Record<string, string> {
  if (!isRecord(value) || Object.keys(value).length > 50) throw new Error("Invalid GitHub covers");
  return Object.fromEntries(Object.entries(value).map(([name, cover]) => {
    if (!name || name.length > 200 || typeof cover !== "string" || cover.length > 2000) throw new Error("Invalid GitHub cover");
    const trimmed = cover.trim();
    if (trimmed && !/^(https?:\/\/|\/)/.test(trimmed)) throw new Error("Invalid GitHub cover URL");
    return [name, trimmed];
  }));
}

function parseExperience(value: unknown): ExperienceItem[] {
  if (!Array.isArray(value) || value.length > 20) throw new Error("Invalid experience");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Invalid experience item");
    const bullets = item.bullets;
    if (!Array.isArray(bullets) || bullets.length > 20 || bullets.some((bullet) => typeof bullet !== "string" || bullet.length > 2000)) throw new Error("Invalid experience bullets");
    return {
      company: readString(item.company, "experience.company"),
      role: readString(item.role, "experience.role"),
      location: readString(item.location, "experience.location"),
      type: readString(item.type, "experience.type"),
      startDate: readString(item.startDate, "experience.startDate"),
      endDate: readString(item.endDate, "experience.endDate"),
      bullets: bullets.map((bullet) => bullet.trim()).filter(Boolean),
      impact: item.impact === undefined ? undefined : readString(item.impact, "experience.impact"),
    };
  });
}

function parseSkillGroups(value: unknown): SkillGroup[] {
  if (!Array.isArray(value) || value.length > 30) throw new Error("Invalid skill groups");
  return value.map((item) => {
    if (!isRecord(item) || !Array.isArray(item.items) || item.items.length > 40 || item.items.some((skill) => typeof skill !== "string" || skill.length > 120)) throw new Error("Invalid skill group");
    return { label: readString(item.label, "skillGroups.label"), items: item.items.map((skill) => skill.trim()).filter(Boolean) };
  });
}

function parseEducation(value: unknown): EducationItem[] {
  if (!Array.isArray(value) || value.length > 20) throw new Error("Invalid education");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Invalid education item");
    return {
      qualification: readString(item.qualification, "education.qualification"),
      school: readString(item.school, "education.school"),
      field: readString(item.field, "education.field"),
      year: readString(item.year, "education.year"),
      coursework: readString(item.coursework, "education.coursework"),
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function readString(value: unknown, field: string) {
  if (typeof value !== "string" || value.length > 5000) throw new Error(`Invalid ${field}`);
  return value.trim();
}

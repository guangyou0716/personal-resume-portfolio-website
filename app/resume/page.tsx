import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "../print-button";
import { SiteFooter, SiteHeader } from "../components";
import { education, experience, projects, skillGroups } from "../data/profile";
import { getProfile } from "../data/profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: `Quick Resume — ${profile.name}`, description: `${profile.title} quick resume for recruiters and hiring managers.` };
}

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profile = await getProfile();
  return <><SiteHeader active="Resume" /><main className="resume-page"><div className="container resume-toolbar"><Link className="text-link" href="/">← Back to portfolio</Link><PrintButton /></div><article className="container resume-sheet"><header><div><h1>{profile.name}</h1><p>{profile.title}</p></div><div className="resume-contact"><span>{profile.location}</span><a href={profile.socials.email}>{profile.email}</a><a href={profile.socials.github}>GitHub</a><a href={profile.socials.linkedin}>LinkedIn</a></div></header><section><h2>Summary</h2><p>{profile.bio} {profile.summary}</p></section><section><h2>Experience</h2>{experience.map((item) => <div className="resume-item" key={`${item.company}-${item.role}`}><div><h3>{item.role} · {item.company}</h3><p>{item.location} · {item.type}</p></div><span>{item.startDate} — {item.endDate}</span><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>)}</section><section><h2>Selected Projects</h2>{projects.filter((project) => project.featured).map((project) => <div className="resume-project" key={project.slug}><div><h3>{project.title}</h3><p>{project.description}</p></div><span>{project.technologies.join(" · ")}</span></div>)}</section><section><h2>Education</h2><div className="resume-education"><div><h3>{education[0].qualification}</h3><p>{education[0].school} · {education[0].field}</p></div><span>{education[0].year}</span></div></section><section><h2>Skills</h2><div className="resume-skills">{skillGroups.map((group) => <div key={group.label}><strong>{group.label}</strong><span>{group.items.join(" · ")}</span></div>)}</div></section></article></main><SiteFooter /></>;
}

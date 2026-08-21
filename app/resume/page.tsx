import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "../print-button";
import { SiteFooter, SiteHeader } from "../components";
import { certifications, projects } from "../data/profile";
import { getGitHubRepositories, getProfile } from "../data/profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: `Quick Resume — ${profile.name}`, description: `${profile.title} quick resume for recruiters and hiring managers.` };
}

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profile = await getProfile();
  const githubRepositories = await getGitHubRepositories(profile.socials.github);
  const summary = [profile.bio, profile.summary].filter(hasResumeContent).join(" ");
  const experience = profile.experience.filter((item) => hasResumeContent(item.role) && hasResumeContent(item.company));
  const education = profile.education.filter((item) => hasResumeContent(item.qualification) && hasResumeContent(item.school));
  const skillGroups = profile.skillGroups.filter((group) => hasResumeContent(group.label) && group.items.some(hasResumeContent));
  const strengths = profile.values.filter(hasResumeContent);

  return <><SiteHeader active="Resume" /><main className="resume-page"><div className="container resume-toolbar"><Link className="text-link" href="/" prefetch={false}>← Back to portfolio</Link><PrintButton /></div><article className="container resume-sheet"><header><div className="resume-identity">{profile.avatar ? <img className="resume-avatar" src={profile.avatar} width="176" height="176" decoding="async" fetchPriority="high" alt={`${profile.name} profile`} /> : <span className="resume-avatar resume-avatar--initials" aria-hidden="true">{profile.initials}</span>}<div className="resume-heading"><h1>{profile.name}</h1><p className="resume-title">{profile.title}</p>{hasResumeContent(profile.subtitle) && <p className="resume-subtitle">{profile.subtitle}</p>}<div className="resume-profile-meta">{[profile.location, profile.availability, profile.focus].filter(hasResumeContent).map((detail, index) => <span key={`${detail}-${index}`}>{detail}</span>)}</div></div></div><div className="resume-contact"><a href={profile.socials.email}>{profile.email}</a><a href={profile.socials.github}>GitHub</a><a href={profile.socials.linkedin}>LinkedIn</a></div></header>{summary && <section><h2>Profile</h2><p>{summary}</p></section>}{experience.length > 0 && <section><h2>Experience</h2>{experience.map((item) => <div className="resume-item" key={`${item.company}-${item.role}`}><div><h3>{item.role} · {item.company}</h3><p>{[item.location, item.type].filter(hasResumeContent).join(" · ")}</p></div><span>{[item.startDate, item.endDate].filter(hasResumeContent).join(" — ")}</span>{item.bullets.filter(hasResumeContent).length > 0 && <ul>{item.bullets.filter(hasResumeContent).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}{hasResumeContent(item.impact) && <p className="resume-impact"><strong>Impact</strong>{item.impact}</p>}</div>)}</section>}{(githubRepositories.length > 0 || projects.some((project) => project.featured && hasResumeContent(project.title))) && <section><h2>Selected Projects</h2>{githubRepositories.length > 0 ? githubRepositories.slice(0, 6).map((repo) => <div className="resume-project" key={repo.name}><div><h3><a href={repo.htmlUrl} target="_blank" rel="noreferrer">{repo.name} <span aria-hidden="true">↗</span></a></h3><p>{repo.description}</p></div><span>{[repo.language, repo.stars > 0 ? `★ ${repo.stars}` : undefined].filter(hasResumeContent).join(" · ")}</span></div>) : projects.filter((project) => project.featured && hasResumeContent(project.title)).map((project) => <div className="resume-project" key={project.slug}><div><h3>{project.title}</h3><p>{project.description}</p></div><span>{project.technologies.filter(hasResumeContent).join(" · ")}</span></div>)}</section>}{education.length > 0 && <section><h2>Education</h2>{education.map((item, index) => <div className="resume-education" key={`${item.school}-${index}`}><div><h3>{item.qualification}</h3><p>{[item.school, item.field].filter(hasResumeContent).join(" · ")}</p>{hasResumeContent(item.coursework) && <small>{item.coursework}</small>}</div><span>{item.year}</span></div>)}</section>}{certifications.length > 0 && <section><h2>Certifications</h2>{certifications.map((item) => <div className="resume-education" key={item.name}><div><h3>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">{item.name} <span aria-hidden="true">↗</span></a> : item.name}</h3><p>{[item.issuer, item.date].filter(hasResumeContent).join(" · ")}</p></div></div>)}</section>}{skillGroups.length > 0 && <section><h2>Skills</h2><div className="resume-skills">{skillGroups.map((group) => <div key={group.label}><strong>{group.label}</strong><span>{group.items.filter(hasResumeContent).join(" · ")}</span></div>)}</div></section>}{strengths.length > 0 && <section><h2>Core strengths</h2><p>{strengths.join(" · ")}</p></section>}</article></main><SiteFooter /></>;
}

function hasResumeContent(value: string | undefined): value is string {
  return Boolean(value?.trim() && !/^\[.*\]$/.test(value.trim()) && !value.includes("[Add ") && !value.includes("Replace this"));
}

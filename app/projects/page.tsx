import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ProjectPreview, SiteFooter, SiteHeader } from "../components";
import { projects } from "../data/profile";
import { getProfile } from "../data/profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: `Projects — ${profile.name}`, description: `Selected projects by ${profile.name}, ${profile.title}.` };
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  return <><SiteHeader active="Projects" /><main className="inner-page"><div className="container page-intro"><span className="section-index">SELECTED WORK</span><h1>Projects that show how I think and build.</h1><p>A selection of practical software projects spanning developer tooling, workflow automation, web products, and mobile apps.</p></div><section className="container project-index-grid">{projects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} prefetch={false} key={project.slug}><ProjectPreview project={project} /><div className="project-card__body"><div><span className="project-type">{project.type} · {project.status}</span><h2>{project.title}</h2><p>{project.description}</p></div><span className="project-arrow"><Icon name="arrow" size={18} /></span><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></Link>)}</section><section className="container back-link-row"><Link className="text-link" href="/" prefetch={false}>← Back home</Link></section></main><SiteFooter /></>;
}

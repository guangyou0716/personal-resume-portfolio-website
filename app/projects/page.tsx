import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ProjectPreview, SiteFooter, SiteHeader } from "../components";
import { isPlaceholderContent, profile, projects } from "../data/profile";

export const metadata: Metadata = {
  title: `Projects — ${profile.name}`,
  description: `Selected projects by ${profile.name}, ${profile.title}.`,
};

export default function ProjectsPage() {
  return <><SiteHeader active="Projects" /><main className="inner-page"><div className="container page-intro"><span className="section-index">SELECTED WORK</span><h1>Projects that show how I think and build.</h1><p>Use these detail pages to explain the problem, approach, technical decisions and result behind each project.</p></div>{isPlaceholderContent && <div className="container placeholder-note"><span>Demo content</span> Replace project objects and screenshots in <code>app/data/profile.ts</code>.</div>}<section className="container project-index-grid">{projects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}><ProjectPreview project={project} /><div className="project-card__body"><div><span className="project-type">{project.type} · {project.status}</span><h2>{project.title}</h2><p>{project.description}</p></div><span className="project-arrow"><Icon name="arrow" size={18} /></span><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></Link>)}</section><section className="container back-link-row"><Link className="text-link" href="/">← Back home</Link></section></main><SiteFooter /></>;
}

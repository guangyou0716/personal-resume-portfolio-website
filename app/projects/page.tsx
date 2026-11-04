import type { Metadata } from "next";
import Link from "next/link";
import { Icon, ProjectCard, SiteFooter, SiteHeader } from "../components";
import { projects } from "../data/profile";
import { getProfile } from "../data/profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: `Projects — ${profile.name}`, description: `Selected projects by ${profile.name}, ${profile.title}.` };
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const profile = await getProfile();
  return <><SiteHeader active="Projects" /><main id="main-content" className="inner-page"><div className="container page-intro"><h1>Projects that show how I think and build.</h1><p>A selection of practical software projects spanning developer tooling, workflow automation, web products, and mobile apps.</p></div><section className="container project-index-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} coverImage={profile.githubCovers[project.title] || project.coverImage} headingLevel={2} />)}</section><section className="container back-link-row"><Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to portfolio</Link></section></main><SiteFooter /></>;
}

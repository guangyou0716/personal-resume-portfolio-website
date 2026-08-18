import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ProjectPreview, SiteFooter, SiteHeader } from "../../components";
import { projects } from "../../data/profile";
import { getProfile } from "../../data/profile-server";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamic = "force-dynamic";

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  const profile = await getProfile();
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — ${profile.name}`,
    description: project.description,
    openGraph: { title: `${project.title} — ${profile.name}`, description: project.description, type: "article", images: [] },
    twitter: { card: "summary", title: `${project.title} — ${profile.name}`, description: project.description, images: [] },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <><SiteHeader active="Projects" /><main className="detail-page"><div className="container detail-breadcrumb"><Link href="/projects" prefetch={false}>Projects</Link><span>/</span><span>{project.title}</span></div><section className="container detail-hero"><div><span className="section-index">{project.type} · {project.status}</span><h1>{project.title}</h1><p>{project.description}</p><div className="detail-actions">{project.github && <a className="button button--secondary" href={project.github}>GitHub <span>↗</span></a>}{project.demo && <a className="button button--primary" href={project.demo}>Live Demo <Icon name="arrow" size={16} /></a>}</div></div><div className="detail-hero-visual">{project.coverImage ? <img src={project.coverImage} alt={`${project.title} screenshot`} /> : <ProjectPreview project={project} />}</div></section><section className="container detail-content"><div className="detail-main"><DetailSection title="Overview"><p>{project.overview}</p></DetailSection><DetailSection title="The Problem"><p>{project.problem}</p></DetailSection><DetailSection title="My Approach"><p>{project.approach}</p></DetailSection><DetailSection title="What I Built"><ul>{project.built.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></DetailSection><DetailSection title="Challenges"><p>{project.challenges}</p></DetailSection><DetailSection title="Solution"><p>{project.solution}</p></DetailSection><DetailSection title="Result"><p>{project.result}</p></DetailSection></div><aside className="detail-aside"><div><h2>Architecture</h2><ul>{project.architecture.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h2>Technologies</h2><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></aside></section><section className="container detail-gallery"><h2>Gallery</h2>{project.screenshots?.length ? <div className="gallery-grid">{project.screenshots.map((image) => <img key={image} src={image} alt={`${project.title} project screenshot`} loading="lazy" />)}</div> : <div className="gallery-placeholder"><ProjectPreview project={project} compact /><p>Add screenshots in the <code>screenshots</code> array in <code>app/data/profile.ts</code>.</p></div>}</section><section className="container detail-footer-links"><Link className="text-link" href="/projects" prefetch={false}>← Back to Projects</Link><Link className="text-link" href="/" prefetch={false}>Back home <Icon name="arrow" size={16} /></Link></section></main><SiteFooter /></>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="detail-section"><h2>{title}</h2>{children}</section>;
}

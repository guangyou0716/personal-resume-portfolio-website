import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ProjectPreview, SiteFooter, SiteHeader } from "../../components";
import { displayProjectName, projects } from "../../data/profile";
import { getProfile } from "../../data/profile-server";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamic = "force-dynamic";

function getProject(slug: string) {
  // Static list by slug: D1 overrides identity/resume fields, not project records or caseStudy.
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  const profile = await getProfile();
  if (!project) return { title: "Project not found" };
  return {
    title: `${displayProjectName(project.title)} — ${profile.name}`,
    description: project.description,
    openGraph: { title: `${displayProjectName(project.title)} — ${profile.name}`, description: project.description, type: "article", images: [] },
    twitter: { card: "summary", title: `${displayProjectName(project.title)} — ${profile.name}`, description: project.description, images: [] },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const profile = await getProfile();
  const coverImage = profile.githubCovers[project.title] || project.coverImage;

  return <><SiteHeader active="Projects" /><main id="main-content" className="detail-page"><div className="container detail-breadcrumb"><Link href="/projects" prefetch={false}>Projects</Link><span>/</span><span>{displayProjectName(project.title)}</span></div><section className={`container detail-hero ${coverImage ? "" : "detail-hero--text"}`}><div><span className="section-index">{project.type} · {project.status}</span><h1>{displayProjectName(project.title)}</h1><p>{project.description}</p><div className="detail-actions">{project.github && <a className="button button--secondary" href={project.github} target="_blank" rel="noreferrer">View source <Icon name="external" /></a>}{project.demo && <a className="button button--primary" href={project.demo} target="_blank" rel="noreferrer">Live demo <Icon name="arrow" size={16} /></a>}</div></div><div className="detail-hero-visual">{coverImage ? <img src={coverImage} width="1200" height="780" decoding="async" fetchPriority="high" alt={`${displayProjectName(project.title)} screenshot`} /> : <ProjectPreview project={project} />}</div></section><section className="container detail-content"><div className="detail-main">{project.overview && <DetailSection title="Overview"><p>{project.overview}</p></DetailSection>}{project.built?.length ? <DetailSection title="Highlights"><ul>{project.built.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></DetailSection> : null}{project.caseStudy ? <ProjectCaseStudy caseStudy={project.caseStudy} /> : null}</div><aside className="detail-aside">{project.architecture?.length ? <div><h2>Stack & focus</h2><ul>{project.architecture.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}<div><h2>Technologies</h2><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></aside></section>{project.screenshots?.length ? <section className="container detail-gallery"><h2>Gallery</h2><div className="gallery-grid">{project.screenshots.map((image) => <img key={image} src={image} width="800" height="530" alt={`${displayProjectName(project.title)} project screenshot`} loading="lazy" decoding="async" />)}</div></section> : null}<section className="container detail-footer-links"><Link className="text-link" href="/projects" prefetch={false}><Icon name="arrow-left" />Back to projects</Link><Link className="text-link" href="/" prefetch={false}>Back to portfolio <Icon name="arrow" /></Link></section></main><SiteFooter /></>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="detail-section"><h2>{title}</h2>{children}</section>;
}

function ProjectCaseStudy({ caseStudy }: { caseStudy: NonNullable<(typeof projects)[number]["caseStudy"]> }) {
  return <>
    <DetailSection title="Problem"><p>{caseStudy.problem}</p></DetailSection>
    <DetailSection title="Architecture"><ul>{caseStudy.architecture.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection>
    <DetailSection title="Engineering decisions & evidence">{caseStudy.decisions.map((decision) => <article key={decision.title}><h3>{decision.title}</h3><p>{decision.rationale}</p><ul>{decision.evidence.map((item) => <li key={item.href}><a className="text-link" href={item.href} target="_blank" rel="noreferrer">{item.label} <Icon name="external" /></a></li>)}</ul></article>)}</DetailSection>
    <DetailSection title="Limitations"><ul>{caseStudy.limitations.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection>
  </>;
}

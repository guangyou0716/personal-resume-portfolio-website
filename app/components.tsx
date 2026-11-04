import Link from "next/link";
import type { ProjectItem } from "./data/profile";
import { displayProjectName, profile } from "./data/profile";
import { getProfile } from "./data/profile-server";
import SiteInteractions from "./site-interactions";

import { Icon } from "./icon";
export { Icon } from "./icon";

export function BrandMark({ currentProfile = profile }: { currentProfile?: Pick<typeof profile, "name" | "initials"> }) {
  return <span className="brand-mark" aria-label={`${currentProfile.name} home`}><span className="brand-mark__initials">{currentProfile.initials}</span></span>;
}

function ThemeToggle({ mobile = false }: { mobile?: boolean }) {
  return <button className={mobile ? "mobile-theme-control" : "theme-control"} type="button" aria-label="Dark appearance" aria-pressed="false" data-theme-toggle>
    {mobile && <span className="theme-control__label">Dark appearance</span>}
    <span className="theme-control__options" aria-hidden="true"><Icon name="sun" size={16} /><span className="theme-switch"><span /></span><Icon name="moon" size={16} /></span>
  </button>;
}

export async function SiteHeader({ active = "About" }: { active?: string }) {
  const currentProfile = await getProfile();
  const navItems = [{ label: "About", icon: "mark" }, ...(currentProfile.experience.length ? [{ label: "Experience", icon: "code" }] : []), { label: "Projects", icon: "mark" }, { label: "Skills", icon: "code" }, { label: "Contact", icon: "mail" }];
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="site-header__inner container"><Link href="/" prefetch={false} className="brand-link" aria-label="Home"><BrandMark currentProfile={currentProfile} /></Link><nav className="desktop-nav" aria-label="Primary navigation">{navItems.map(({ label }) => <a key={label} className={active === label ? "is-active" : ""} aria-current={active === label ? "location" : undefined} data-section-nav={label.toLowerCase()} href={label === "About" ? "/#about" : `/#${label.toLowerCase()}`}>{label}</a>)}<a href="/resume" className={`nav-resume${active === "Resume" ? " is-active" : ""}`} aria-current={active === "Resume" ? "page" : undefined}>Resume <Icon name="external" size={16} /></a></nav><div className="header-actions"><Link className="mobile-resume-link" href="/resume" prefetch={false} aria-current={active === "Resume" ? "page" : undefined}>Resume</Link><ThemeToggle /><button className="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-navigation" data-menu-toggle><span className="menu-icon"><Icon name="menu" size={20} /><Icon name="close" size={20} /></span></button></div></div><nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" data-mobile-nav>{navItems.map(({ label, icon }) => <a key={label} data-section-nav={label.toLowerCase()} href={label === "About" ? "/#about" : `/#${label.toLowerCase()}`}><span className="mobile-nav__icon"><Icon name={icon} size={21} /></span>{label}<Icon name="arrow" size={19} /></a>)}<a href="/resume" className={active === "Resume" ? "is-active" : ""} aria-current={active === "Resume" ? "page" : undefined}><span className="mobile-nav__icon"><Icon name="mark" size={21} /></span>Quick resume <Icon name="external" size={16} /></a><ThemeToggle mobile /></nav></header><SiteInteractions /></>;
}

export function SectionHeading({ index, title, action }: { index: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div className="section-heading__title"><h2>{title}</h2></div>{action}</div>;
}

export function ProjectPreview({ project, compact = false }: { project: Pick<ProjectItem, "slug" | "type" | "coverImage">; compact?: boolean }) {
  if (project.coverImage) return <div className={`project-visual project-visual--cover ${compact ? "project-visual--compact" : ""}`}><img src={project.coverImage} width="1200" height="780" loading="lazy" decoding="async" alt={`${project.type} cover`} /></div>;
  return <div className={`project-visual project-visual--type ${compact ? "project-visual--compact" : ""}`}><Icon name="code" size={30} /><span>{project.type}</span></div>;
}

export function ProjectCard({ project, coverImage = project.coverImage, headingLevel = 3 }: { project: ProjectItem; coverImage?: string; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <Link className={`project-card${coverImage ? " project-card--with-cover" : ""}`} href={`/projects/${project.slug}`} prefetch={false}>
    {coverImage && <ProjectPreview project={{ ...project, coverImage }} />}
    <div className="project-card__body">
      <div><span className="project-type">{project.type} · {project.status}</span><Heading>{displayProjectName(project.title)}</Heading><p>{project.description}</p><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div>
      <span className="project-read-more">Explore project <Icon name="arrow" size={18} /></span>
    </div>
  </Link>;
}

export async function SiteFooter() {
  const currentProfile = await getProfile();
  return <footer className="site-footer"><div className="container site-footer__inner"><div><BrandMark currentProfile={currentProfile} /><p>{currentProfile.title}</p></div><div className="footer-links"><a href={currentProfile.socials.github}>GitHub</a><a href={currentProfile.socials.linkedin}>LinkedIn</a><a href={currentProfile.socials.email}>Email</a></div><div className="footer-note"><span>© {new Date().getFullYear()} {currentProfile.name}</span><a href="/customize">Owner access <Icon name="external" size={16} /></a></div></div></footer>;
}

import Link from "next/link";
import type { ProjectItem } from "./data/profile";
import { profile } from "./data/profile";
import { getProfile } from "./data/profile-server";

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true } as const;
  if (name === "arrow") return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "download") return <svg {...common}><path d="M12 3v11m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.7" /><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.72 5.28l-1.42 1.42M6.7 17.3l-1.42 1.42M18.72 18.72l-1.42-1.42M6.7 6.7 5.28 5.28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  if (name === "moon") return <svg {...common}><path d="M19.4 15.4A7.5 7.5 0 0 1 8.6 4.6 7.5 7.5 0 1 0 19.4 15.4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "code") return <svg {...common}><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "mark") return <svg {...common}><rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M8.5 9h7M8.5 12h4.5M8.5 15h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
  if (name === "mail") return <svg {...common}><rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "github") return <svg {...common}><path d="M12 3.5a8.6 8.6 0 0 0-2.72 16.76c.43.08.59-.19.59-.42v-1.5c-2.39.52-2.89-1.02-2.89-1.02-.39-.99-.96-1.25-.96-1.25-.78-.53.06-.52.06-.52.86.06 1.31.89 1.31.89.77 1.3 2.02.92 2.51.7.08-.55.3-.92.55-1.13-1.91-.22-3.92-.96-3.92-4.27 0-.94.34-1.71.89-2.31-.09-.22-.39-1.09.08-2.28 0 0 .73-.23 2.38.88a8.22 8.22 0 0 1 4.33 0c1.65-1.11 2.38-.88 2.38-.88.47 1.19.17 2.06.08 2.28.55.6.89 1.37.89 2.31 0 3.32-2.01 4.05-3.93 4.26.31.27.58.8.58 1.62v2.4c0 .23.16.5.59.41A8.6 8.6 0 0 0 12 3.5Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "linkedin") return <svg {...common}><path d="M6.2 8.4V19M6.2 5.2v.1M10.3 19v-6.1a3.1 3.1 0 0 1 6.2 0V19M10.3 10.1V19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><rect x="3.3" y="3.3" width="17.4" height="17.4" rx="3" stroke="currentColor" strokeWidth="1.7" /></svg>;
  return null;
}

export function BrandMark({ currentProfile = profile }: { currentProfile?: Pick<typeof profile, "name" | "initials"> }) {
  return <span className="brand-mark" aria-label={`${currentProfile.name} home`}><span className="brand-icon" aria-hidden="true"><Icon name="mark" size={16} /></span><span className="brand-mark__initials">{currentProfile.initials}</span></span>;
}

export async function SiteHeader({ active = "About" }: { active?: string }) {
  const currentProfile = await getProfile();
  return <header className="site-header"><div className="site-header__inner container"><Link href="/" prefetch={false} className="brand-link" aria-label="Home"><BrandMark currentProfile={currentProfile} /></Link><nav className="desktop-nav" aria-label="Primary navigation">{["About", "Experience", "Projects", "Skills", "Contact"].map((item) => <a key={item} className={active === item ? "is-active" : ""} href={item === "About" ? "/#about" : `/#${item.toLowerCase()}`}>{item}</a>)}<a href="/resume" className="nav-resume">Resume <span aria-hidden="true">↓</span></a></nav><div className="header-actions"><button className="theme-control" type="button" aria-label="Toggle theme" aria-pressed="false" data-theme-toggle><Icon name="sun" size={15} /><span className="theme-switch"><span /></span><Icon name="moon" size={15} /></button><button className="mobile-menu-button" type="button" aria-label="Open menu" aria-expanded="false" data-menu-toggle><Icon name="menu" /></button></div></div><div className="mobile-nav" data-mobile-nav>{["About", "Experience", "Projects", "Skills", "Contact"].map((item) => <a key={item} href={item === "About" ? "/#about" : `/#${item.toLowerCase()}`}>{item}</a>)}<a href="/resume">Quick Resume <span aria-hidden="true">↓</span></a><button className="mobile-theme-control" type="button" aria-label="Toggle theme" aria-pressed="false" data-theme-toggle><Icon name="sun" size={15} /><span>Appearance</span><span className="theme-switch"><span /></span><Icon name="moon" size={15} /></button></div></header>;
}

export function SectionHeading({ index, title, action }: { index: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div className="section-heading__title"><span className="section-index">{index}</span><h2>{title}</h2></div>{action}</div>;
}

export function ProjectPreview({ project, compact = false }: { project: Pick<ProjectItem, "slug" | "type">; compact?: boolean }) {
  return <div className={`project-visual project-visual--${project.slug} ${compact ? "project-visual--compact" : ""}`} aria-label="Project screenshot placeholder"><div className="mock-window-bar"><span /><span /><span /><em>{project.type}</em></div><div className="mock-window-content"><div className="mock-sidebar"><span /><span /><span /><span /></div><div className="mock-main"><div className="mock-heading" /><div className="mock-row"><span /><span /><span /></div><div className="mock-chart"><i /><i /><i /><i /><i /></div><div className="mock-row mock-row--short"><span /><span /></div></div></div><span className="mock-replace">Replace with screenshot</span></div>;
}

export async function SiteFooter() {
  const currentProfile = await getProfile();
  return <footer className="site-footer"><div className="container site-footer__inner"><div><BrandMark currentProfile={currentProfile} /><p>{currentProfile.title}</p></div><div className="footer-links"><a href={currentProfile.socials.github}>GitHub</a><a href={currentProfile.socials.linkedin}>LinkedIn</a><a href={currentProfile.socials.email}>Email</a></div><p className="footer-note">Built with care.<br /><span>© {new Date().getFullYear()} {currentProfile.name}</span></p></div></footer>;
}

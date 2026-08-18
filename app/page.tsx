import Link from "next/link";
import { Icon, ProjectPreview, SectionHeading, SiteFooter, SiteHeader } from "./components";
import { certifications, education, experience, githubWork, projects, skillGroups, workStyle } from "./data/profile";
import { getProfile } from "./data/profile-server";

const introCards = [
  ["What I Do", "Software development, automation and system integration."],
  ["What I Enjoy", "Solving practical engineering problems and improving workflows."],
  ["Technologies", "Python, C#, JavaScript, TypeScript, APIs, databases and AI tools."],
  ["Current Focus", "AI-assisted development, automation and reliable software systems."],
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getProfile();
  const featuredProjects = projects.filter((project) => project.featured);

  return <>
    <SiteHeader active="About" />
    <main>
      <section className="hero container" id="about">
        <div className="hero-avatar"><div className={`avatar-ring ${profile.avatar ? "avatar-ring--image" : ""}`}>{profile.avatar ? <img src={profile.avatar} alt={`${profile.name} profile`} /> : <span>{profile.initials}</span>}<span className="avatar-badge"><Icon name="code" size={15} /></span></div><span className="availability-dot" /><p>{profile.availability}</p></div>
        <div className="hero-copy"><p className="eyebrow">{profile.focus}</p><h1>Hi, I&apos;m <span>{profile.name}</span>.<br /><strong>{profile.title}</strong></h1><p className="hero-lede">{profile.bio}</p><div className="hero-actions"><a className="button button--primary" href="#projects">View My Work <Icon name="arrow" /></a><a className="button button--secondary" href={profile.resumeFile}>Download Resume <Icon name="download" /></a></div><div className="hero-links"><a href={profile.socials.github}>GitHub <span>↗</span></a><a href={profile.socials.linkedin}>LinkedIn <span>↗</span></a><a href={profile.socials.email}>Email <span>↗</span></a></div><div className="hero-facts"><span>⌖ {profile.location}</span><span>● {profile.availability}</span><span>⚡ {profile.focus}</span></div></div>
      </section>

      {profile.name === "[Your Name]" && <div className="placeholder-note container"><span>Demo content</span> Open <code>/customize</code> to update the details when you are ready.</div>}

      <section className="section section--intro container" id="introduction"><SectionHeading index="01" title="A quick introduction" /><div className="intro-grid">{introCards.map(([title, text]) => <article className="intro-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="section container" id="about-detail"><div className="about-grid"><div><span className="section-index">01 / ABOUT</span><h2 className="display-heading">Good software starts with a clear understanding of the work.</h2></div><div className="about-copy"><p>{profile.summary}</p><p>Use this space for a little more context about your background, the environments you enjoy working in, and the kind of problems you want to solve. Keep it specific, human and easy to scan.</p><div className="values-list">{profile.values.map((value) => <span key={value}>{value}</span>)}</div></div></div></section>

      <section className="section container" id="projects"><SectionHeading index="02" title="Featured Projects" action={<Link className="text-link" href="/projects">View all projects <Icon name="arrow" size={16} /></Link>} /><div className="project-grid">{featuredProjects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}><ProjectPreview project={project} /><div className="project-card__body"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="project-arrow"><Icon name="arrow" size={18} /></span><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></Link>)}</div></section>

      <section className="section container" id="experience"><SectionHeading index="03" title="Experience" /><div className="timeline">{experience.map((item) => <article className="timeline-item" key={`${item.company}-${item.role}`}><div className="timeline-date"><span>{item.startDate}</span><span>{item.endDate}</span></div><div className="timeline-marker" /><div className="timeline-content"><h3>{item.role}</h3><p className="timeline-meta">{item.company} · {item.location} · {item.type}</p><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>{item.impact && <p className="impact"><strong>Impact</strong>{item.impact}</p>}</div></article>)}</div></section>

      <section className="section container" id="skills"><div className="split-heading"><SectionHeading index="04" title="Skills & Technologies" /><SectionHeading index="05" title="How I Work" /></div><div className="skills-work-grid"><div className="skill-groups">{skillGroups.map((group) => <div className="skill-group" key={group.label}><h3>{group.label}</h3><div className="tag-row">{group.items.map((skill) => <span key={skill}>{skill}</span>)}</div></div>)}</div><div className="work-style-list">{workStyle.map(([title, text], index) => <article key={title}><span className="work-style-number">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

      {certifications.length > 0 && <section className="section container"><SectionHeading index="06" title="Certifications" /><div className="certification-list">{certifications.map((item) => <div key={item.name}><h3>{item.name}</h3><p>{item.issuer} · {item.date}</p></div>)}</div></section>}

      <section className="section container section--lower"><div className="lower-grid"><div><SectionHeading index="06" title="Education" /><div className="education-item"><div className="education-icon"><Icon name="code" size={22} /></div><div><h3>{education[0].qualification}</h3><p>{education[0].school}</p><p>{education[0].field} · {education[0].year}</p><small>{education[0].coursework}</small></div></div></div><div><SectionHeading index="07" title="Selected GitHub Work" action={<a className="text-link" href={profile.socials.github}>View GitHub <Icon name="arrow" size={16} /></a>} /><div className="github-list">{githubWork.map((repo, index) => <a href={profile.socials.github} key={`${repo.name}-${index}`}><span className="repo-icon"><Icon name="code" size={16} /></span><span><strong>{repo.name}</strong><small>{repo.description}</small></span><em>{repo.stars}</em></a>)}</div></div></div></section>

      <section className="contact-section container" id="contact"><div><span className="section-index">08 / CONTACT</span><h2>Let&apos;s Connect</h2><p>Interested in discussing a role, project, or technical challenge? Feel free to reach out.</p></div><div className="contact-links"><a href={profile.socials.email}><span><Icon name="mail" size={18} /></span><strong>Email Me</strong><small>{profile.email}</small></a><a href={profile.socials.linkedin}><span><Icon name="linkedin" size={18} /></span><strong>LinkedIn</strong><small>Connect professionally</small></a><a href={profile.socials.github}><span><Icon name="github" size={18} /></span><strong>GitHub</strong><small>See selected work</small></a><a href={profile.resumeFile}><span><Icon name="download" size={18} /></span><strong>Quick Resume</strong><small>Print or save as PDF</small></a></div></section>
    </main>
    <SiteFooter />
  </>;
}

import Link from "next/link";
import { Icon, ProjectCard, SectionHeading, SiteFooter, SiteHeader } from "./components";
import { certifications, projects, workStyle } from "./data/profile";
import { getProfile } from "./data/profile-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getProfile();
  const featuredProjects = projects.filter((project) => project.featured);
  const hasExperience = profile.experience.length > 0;
  const skillsIndex = hasExperience ? "04" : "03";
  const workStyleIndex = hasExperience ? "05" : "04";
  const lowerIndex = hasExperience ? "06" : "05";

  return <>
    <SiteHeader active="About" />
    <main id="main-content">
      <section className="hero container" id="about" aria-labelledby="home-title">
        <div className="hero-avatar">
          <div className={`avatar-ring ${profile.avatar ? "avatar-ring--image" : ""}`}>
            {profile.avatar ? <img src={profile.avatar} width="440" height="440" decoding="async" fetchPriority="high" alt={`${profile.name} profile`} /> : <span>{profile.initials}</span>}

          </div>

          <p>{profile.location}</p><p className="availability">{profile.availability}</p>
        </div>
        <div className="hero-copy">
          <h1 id="home-title"><span>{profile.name}</span><br /><strong>{profile.title}</strong></h1>
          <p className="hero-tagline">{profile.subtitle}</p>
          <p className="hero-lede">{profile.bio}</p>{summaryParagraphs(profile.summary).map((paragraph) => <p className="hero-summary" key={paragraph}>{paragraph}</p>)}
          <div className="hero-actions"><a className="button button--primary" href="#projects">View my work <Icon name="arrow" /></a><a className="button button--secondary" href={profile.resumeFile}>View resume <Icon name="arrow" /></a></div>
          <div className="hero-links"><a href={profile.socials.github}><Icon name="github" size={17} />GitHub <Icon name="external" size={14} /></a><a href={profile.socials.linkedin}><Icon name="linkedin" size={17} />LinkedIn <Icon name="external" size={14} /></a><a href={profile.socials.email}><Icon name="mail" size={17} />Email <Icon name="external" size={14} /></a></div>
        </div>
      </section>

      <section className="section container" id="projects">
        <SectionHeading index="02" title="Selected work" action={<Link className="text-link" href="/projects" prefetch={false}>View all projects <Icon name="arrow" size={17} /></Link>} />
        <p className="section-intro">Explore the project details, technologies, and source code.</p>
        <div className="project-grid">{featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} coverImage={profile.githubCovers[project.title] || project.coverImage} />)}</div>
      </section>

      {hasExperience && <section className="section container" id="experience"><SectionHeading index="03" title="Experience" /><div className="timeline">{profile.experience.map((item) => <article className="timeline-item" key={`${item.company}-${item.role}`}><div className="timeline-date"><span>{item.startDate}</span><span>{item.endDate}</span></div><div className="timeline-marker" aria-hidden="true" /><div className="timeline-content"><h3>{item.role}</h3><p className="timeline-meta">{item.company} · {item.location} · {item.type}</p>{item.bullets.some((bullet) => bullet.trim()) && <ul>{item.bullets.filter((bullet) => bullet.trim()).map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}{item.impact && <p className="impact"><strong>Impact</strong>{item.impact}</p>}</div></article>)}</div></section>}

      <section className="section container" id="skills"><div className="skills-work-grid"><div className="skill-groups"><SectionHeading index={skillsIndex} title="Skills & technologies" />{profile.skillGroups.length ? profile.skillGroups.map((group) => <div className="skill-group" key={group.label}><h3>{group.label}</h3><div className="tag-row">{group.items.map((skill) => <span key={skill}>{skill}</span>)}</div></div>) : <p className="empty-state"></p>}</div><div className="work-style-list"><SectionHeading index={workStyleIndex} title="How I work" />{workStyle.map(([title, text], index) => <article key={title}><span className="work-style-number" aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

      {certifications.length > 0 && <section className="section container"><SectionHeading index="06" title="Certifications" /><div className="certification-list">{certifications.map((item) => <div key={item.name}><h3>{item.name}</h3><p>{item.issuer} · {item.date}</p></div>)}</div></section>}

      {profile.education.length > 0 && <section className="section container section--lower"><SectionHeading index={lowerIndex} title="Education" /><div className="education-list">{profile.education.map((item, index) => <div className="education-item" key={`${item.school}-${index}`}><div className="education-icon"><Icon name="code" size={22} /></div><div><h3>{item.qualification}</h3><p>{item.school}</p><p>{item.field} · {item.year}</p>{item.coursework && <small>{item.coursework}</small>}</div></div>)}</div></section>}

      <section className="contact-section container" id="contact"><div><h2>Let&apos;s connect</h2><p>Interested in discussing a role, project, or technical challenge? Feel free to reach out.</p></div><div className="contact-links"><a className="contact-email" href={profile.socials.email}><span><Icon name="mail" size={18} /></span><strong>Email me</strong><small>{profile.email}</small></a><a href={profile.socials.linkedin}><span><Icon name="linkedin" size={18} /></span><strong>LinkedIn</strong><small>Connect professionally</small></a><a href={profile.socials.github}><span><Icon name="github" size={18} /></span><strong>GitHub</strong><small>See selected work</small></a><a href={profile.resumeFile}><span><Icon name="download" size={18} /></span><strong>Quick resume</strong><small>Print or save as PDF</small></a></div></section>
    </main>
    <SiteFooter />
  </>;
}

function summaryParagraphs(summary: string) {
  return summary.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

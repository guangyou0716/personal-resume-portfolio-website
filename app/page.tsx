import Link from "next/link";
import { Icon, ProjectPreview, SectionHeading, SiteFooter, SiteHeader } from "./components";
import { certifications, githubWork, projects, workStyle } from "./data/profile";
import { getGitHubRepositories, getProfile, type GitHubRepository } from "./data/profile-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getProfile();
  const githubRepositories = await getGitHubRepositories(profile.socials.github);
  const featuredProjects = projects.filter((project) => project.featured);

  return <>
    <SiteHeader active="About" />
    <main>
      <section className="hero container" id="about" aria-labelledby="home-title">
        <div className="hero-avatar">
          <div className={`avatar-ring ${profile.avatar ? "avatar-ring--image" : ""}`}>
            {profile.avatar ? <img src={profile.avatar} width="440" height="440" decoding="async" fetchPriority="high" alt={`${profile.name} profile`} /> : <span>{profile.initials}</span>}
            <span className="avatar-badge"><Icon name="code" size={20} /></span>
          </div>
          <span className="availability-dot" aria-hidden="true" />
          <p>{profile.availability}</p>
        </div>
        <div className="hero-copy">
          <h1 id="home-title">Hi, I&apos;m <span>{profile.name}</span>.<br /><strong>{profile.title}</strong></h1>
          <p className="hero-tagline">{profile.subtitle}</p>
          <p className="hero-lede">{profile.bio}</p>
          <div className="hero-actions"><a className="button button--primary" href="#projects">View My Work <Icon name="arrow" /></a><a className="button button--secondary" href={profile.resumeFile}>Download Resume <Icon name="download" /></a></div>
          <div className="hero-links"><a href={profile.socials.github}><Icon name="github" size={17} />GitHub <span aria-hidden="true">↗</span></a><a href={profile.socials.linkedin}><Icon name="linkedin" size={17} />LinkedIn <span aria-hidden="true">↗</span></a><a href={profile.socials.email}><Icon name="mail" size={17} />Email <span aria-hidden="true">↗</span></a></div>
        </div>
      </section>

      <section className="section container" id="projects"><SectionHeading index="02" title="Featured Projects" action={<Link className="text-link" href="/projects" prefetch={false}>View all projects <Icon name="arrow" size={17} /></Link>} /><div className="project-grid">{githubRepositories.length ? githubRepositories.slice(0, 3).map((repo) => <GitHubProjectCard key={repo.name} repo={repo} coverImage={profile.githubCovers[repo.name]} />) : featuredProjects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} prefetch={false} key={project.slug}><ProjectPreview project={project} /><div className="project-card__body"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="project-arrow"><Icon name="arrow" size={18} /></span><div className="tag-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div></div></Link>)}</div></section>

      <section className="section container" id="experience"><SectionHeading index="03" title="Experience" /><div className="timeline">{profile.experience.length ? profile.experience.map((item) => <article className="timeline-item" key={`${item.company}-${item.role}`}><div className="timeline-date"><span>{item.startDate}</span><span>{item.endDate}</span></div><div className="timeline-marker" aria-hidden="true" /><div className="timeline-content"><h3>{item.role}</h3><p className="timeline-meta">{item.company} · {item.location} · {item.type}</p><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>{item.impact && <p className="impact"><strong>Impact</strong>{item.impact}</p>}</div></article>) : <p className="empty-state">Add your experience in /customize.</p>}</div></section>

      <section className="section container" id="skills"><div className="split-heading"><SectionHeading index="04" title="Skills & Technologies" /><SectionHeading index="05" title="How I Work" /></div><div className="skills-work-grid"><div className="skill-groups">{profile.skillGroups.length ? profile.skillGroups.map((group) => <div className="skill-group" key={group.label}><h3>{group.label}</h3><div className="tag-row">{group.items.map((skill) => <span key={skill}>{skill}</span>)}</div></div>) : <p className="empty-state">Add skills in /customize.</p>}</div><div className="work-style-list">{workStyle.map(([title, text], index) => <article key={title}><span className="work-style-number" aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

      {certifications.length > 0 && <section className="section container"><SectionHeading index="06" title="Certifications" /><div className="certification-list">{certifications.map((item) => <div key={item.name}><h3>{item.name}</h3><p>{item.issuer} · {item.date}</p></div>)}</div></section>}

      <section className="section container section--lower"><div className="lower-grid"><div><SectionHeading index="06" title="Education" /><div className="education-list">{profile.education.length ? profile.education.map((item, index) => <div className="education-item" key={`${item.school}-${index}`}><div className="education-icon"><Icon name="code" size={22} /></div><div><h3>{item.qualification}</h3><p>{item.school}</p><p>{item.field} · {item.year}</p><small>{item.coursework}</small></div></div>) : <p className="empty-state">Add your education in /customize.</p>}</div></div><div><SectionHeading index="07" title="Selected GitHub Work" action={<a className="text-link" href={profile.socials.github}>View GitHub <Icon name="arrow" size={16} /></a>} /><div className="github-list">{githubRepositories.length ? githubRepositories.slice(0, 3).map((repo) => <a href={repo.htmlUrl} target="_blank" rel="noreferrer" key={repo.name}><span className="repo-icon"><Icon name="github" size={16} /></span><span><strong>{repo.name}</strong><small>{repo.description}</small></span><em>★ {repo.stars}</em></a>) : githubWork.map((repo, index) => <a href={profile.socials.github} key={`${repo.name}-${index}`}><span className="repo-icon"><Icon name="code" size={16} /></span><span><strong>{repo.name}</strong><small>{repo.description}</small></span><em>{repo.stars}</em></a>)}</div></div></div></section>

      <section className="contact-section container" id="contact"><div><span className="section-index">08 / CONTACT</span><h2>Let&apos;s Connect</h2><p>Interested in discussing a role, project, or technical challenge? Feel free to reach out.</p></div><div className="contact-links"><a href={profile.socials.email}><span><Icon name="mail" size={18} /></span><strong>Email Me</strong><small>{profile.email}</small></a><a href={profile.socials.linkedin}><span><Icon name="linkedin" size={18} /></span><strong>LinkedIn</strong><small>Connect professionally</small></a><a href={profile.socials.github}><span><Icon name="github" size={18} /></span><strong>GitHub</strong><small>See selected work</small></a><a href={profile.resumeFile}><span><Icon name="download" size={18} /></span><strong>Quick Resume</strong><small>Print or save as PDF</small></a></div></section>
    </main>
    <SiteFooter />
  </>;
}

function GitHubProjectCard({ repo, coverImage }: { repo: GitHubRepository; coverImage?: string }) {
  return <a className="project-card" href={repo.htmlUrl} target="_blank" rel="noreferrer"><ProjectPreview project={{ slug: "github-repository", type: "GitHub repository", coverImage }} /><div className="project-card__body"><div><h3>{repo.name}</h3><p>{repo.description}</p></div><span className="project-arrow"><Icon name="arrow" size={18} /></span><div className="tag-row"><span>{repo.language}</span><span>★ {repo.stars}</span></div></div></a>;
}

import type { Metadata } from "next";
import Link from "next/link";
import PrintButton from "../print-button";
import "./resume.css";
import { Icon, SiteFooter, SiteHeader } from "../components";
import { certifications } from "../data/profile";
import { getProfile } from "../data/profile-server";
import { publicSiteOrigin } from "../site-origin";
import { BreakableUrl, formatDateRange, NowrapList, protectHyphenated, RoleCompany, SkillList } from "./typography";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return { title: `Quick resume — ${profile.name}`, description: `${profile.title} quick resume for recruiters and hiring managers.` };
}

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profile = await getProfile();
  const portfolioUrl = await publicSiteOrigin();
  const summary = [profile.bio, profile.summary].find(hasResumeContent);
  const experience = profile.experience.filter((item) => hasResumeContent(item.role) && hasResumeContent(item.company));
  const education = profile.education.filter((item) => hasResumeContent(item.qualification) && hasResumeContent(item.school) && !/^SPM\b/i.test(item.qualification));
  const skillGroups = profile.skillGroups.filter((group) => hasResumeContent(group.label) && group.items.some(hasResumeContent));

  return (
    <>
      <SiteHeader active="Resume" />
      <main id="main-content" className="resume-page">
        <div className="container resume-toolbar">
          <Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to portfolio</Link>
          <PrintButton />
        </div>
        <article className="container resume-sheet resume-sheet--editorial">
          <header>
            <div className="resume-identity">
              {profile.avatar ? <img className="resume-avatar" src={profile.avatar} width="176" height="176" decoding="async" fetchPriority="high" alt={`${profile.name} profile`} /> : <span className="resume-avatar resume-avatar--initials" aria-hidden="true">{profile.initials}</span>}
              <div className="resume-heading">
                <h1>{profile.name}</h1>
                <p className="resume-title">{profile.title}</p>
                {hasResumeContent(profile.subtitle) && <p className="resume-subtitle">{profile.subtitle}</p>}
                <div className="resume-profile-meta">
                  {[profile.location, profile.availability, profile.focus].filter(hasResumeContent).map((detail, index) => (
                    <span key={`${detail}-${index}`}><NowrapList text={detail} /></span>
                  ))}
                </div>
              </div>
            </div>
            <dl className="resume-contact resume-contact--urls">
              <div><dt>Email</dt><dd><a href={profile.socials.email}><BreakableUrl value={profile.email} /></a></dd></div>
              <div><dt>Portfolio</dt><dd><a href={portfolioUrl}><BreakableUrl value={portfolioUrl} /></a></dd></div>
              <div><dt>GitHub</dt><dd><a href={profile.socials.github}><BreakableUrl value={profile.socials.github} /></a></dd></div>
              <div><dt>LinkedIn</dt><dd><a href={profile.socials.linkedin}><BreakableUrl value={profile.socials.linkedin} /></a></dd></div>
            </dl>
          </header>
          <div className="resume-columns">
            <div className="resume-primary">
              {summary && <section><h2>Professional profile</h2><p>{protectHyphenated(summary)}</p></section>}
              {experience.length > 0 && (
                <section>
                  <h2>Experience</h2>
                  {experience.map((item) => (
                    <div className="resume-item" key={`${item.company}-${item.role}`}>
                      <div>
                        <h3><RoleCompany role={item.role} company={item.company} /></h3>
                        <p>{protectHyphenated([item.location, item.type].filter(hasResumeContent).join(" · "))}</p>
                      </div>
                      <span>{formatDateRange(item.startDate, item.endDate)}</span>
                      {item.bullets.filter(hasResumeContent).length > 0 && (
                        <ul>{item.bullets.filter(hasResumeContent).map((bullet) => <li key={bullet}>{protectHyphenated(bullet)}</li>)}</ul>
                      )}
                      {hasResumeContent(item.impact) && <p className="resume-impact"><strong>Impact</strong>{protectHyphenated(item.impact)}</p>}
                    </div>
                  ))}
                </section>
              )}
              {education.length > 0 && (
                <section>
                  <h2>Education</h2>
                  {education.map((item, index) => (
                    <div className="resume-education" key={`${item.school}-${index}`}>
                      <div>
                        <h3>{item.qualification}</h3>
                        <p>{[item.school, item.field].filter(hasResumeContent).join(" · ")}</p>
                        {hasResumeContent(item.coursework) && <small>{item.coursework}</small>}
                      </div>
                      <span>{formatDateRange(item.year)}</span>
                    </div>
                  ))}
                </section>
              )}
              {certifications.length > 0 && (
                <section>
                  <h2>Certifications</h2>
                  {certifications.map((item) => (
                    <div className="resume-education" key={item.name}>
                      <div>
                        <h3>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">{item.name} <Icon name="external" size={14} /></a> : item.name}</h3>
                        <p>{[item.issuer, item.date].filter(hasResumeContent).join(" · ")}</p>
                        {item.link && <a className="resume-visible-url" href={item.link}><BreakableUrl value={item.link} /></a>}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
            <aside className="resume-secondary" aria-label="Skills">
              {skillGroups.length > 0 && (
                <section>
                  <h2>Skills</h2>
                  <div className="resume-skills">
                    {skillGroups.map((group) => (
                      <div key={group.label}>
                        <strong>{group.label}</strong>
                        <SkillList items={group.items.filter(hasResumeContent)} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function hasResumeContent(value: string | undefined): value is string {
  return Boolean(value?.trim() && !/^\[.*\]$/.test(value.trim()) && !value.includes("[Add ") && !value.includes("Replace this"));
}

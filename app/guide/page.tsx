import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = { title: "Customize guide", description: "Private maintenance guide for updating this personal resume site." };

const guideItems = [
  ["Open the editor", "Visit /customize and sign in with the site owner account. Changes are saved for the public site."],
  ["Change the introduction", "Use the private editor for your name, title, location, bio, summary, values and contact links."],
  ["Add experience", "Add another object to the experience array. The homepage and Quick Resume page update automatically."],
  ["Add a project", "Add one ProjectItem object to projects. Use a unique slug; the project card and detail page are generated for you."],
  ["Add project screenshots", "Put image files in public/projects, then add their paths to coverImage and screenshots."],
  ["Change skills", "Edit the skillGroups array. Categories and tags are rendered from that data."],
  ["Replace Resume PDF", "Add your file as public/resume.pdf, then change profile.resumeFile to /resume.pdf. The current link opens Quick Resume until you do this."],
  ["Change profile picture", "Add your image under public/profile and replace the avatar placeholder in app/page.tsx when ready."],
  ["Change social links", "Edit profile.socials.github, profile.socials.linkedin and profile.socials.email."],
  ["Change theme accent", "Update --accent and --accent-soft at the top of app/globals.css."],
];

export default function GuidePage() {
  return <><SiteHeader /><main className="guide-page"><div className="container guide-intro"><span className="section-index">PRIVATE MAINTENANCE GUIDE</span><h1>Keep the site easy to update.</h1><p>This page is intentionally not in the public navigation. Every personal detail is kept in one data file so you can return months later and know exactly where to edit.</p><Link className="text-link" href="/">← Back to portfolio</Link></div><section className="container guide-list">{guideItems.map(([title, text], index) => <article key={title}><span className="guide-number">0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</section></main><SiteFooter /></>;
}

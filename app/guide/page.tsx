import type { Metadata } from "next";
import Link from "next/link";
import { requireProfileEditor } from "../data/profile-server";
export const dynamic = "force-dynamic";
import { Icon, SiteFooter, SiteHeader } from "../components";

export const metadata: Metadata = { title: "Customize guide", robots: { index: false, follow: false }, description: "Private maintenance guide for updating this personal resume site." };

const guideItems = [
  ["Open the editor", "Visit /customize. Cloudflare Access signs in the site owner. Changes are saved for the public site."],
  ["Change the introduction", "Use the private editor for your name, title, location, bio, summary, values and contact links. Hero description supplies the short profile in Quick resume; About summary stays on the portfolio."],
  ["Add experience", "Use the private editor to add or update experience. The homepage and Quick resume page update automatically."],
  ["Add a project", "Add one ProjectItem object to projects. Use a unique slug; the project card and detail page are generated for you."],
  ["Add project screenshots", "Put image files in public/projects, then add their paths to coverImage and screenshots."],
  ["Change skills", "Use the private editor to update skill groups and tags."],
  ["Replace resume PDF", "Add your file as public/resume.pdf, then change profile.resumeFile to /resume.pdf. The current link opens Quick resume until you do this."],
  ["Change profile picture", "Open /customize, paste an image URL into Avatar image URL, and save. For a local image, put it at public/profile/avatar.jpg and use /profile/avatar.jpg."],
  ["Change social links", "Use the private editor's Contact links section."],
  ["Change theme accent", "Update --primary and --primary-container in both light and dark themes at the top of app/globals.css."],
];

export default async function GuidePage() {
  await requireProfileEditor();
  return <><SiteHeader /><main id="main-content" className="guide-page"><div className="container guide-intro"><span className="section-index">PRIVATE MAINTENANCE GUIDE</span><h1>Keep the site easy to update.</h1><p>This page is intentionally not in the public navigation. Use the private editor to maintain profile details; static project case studies and site styling remain in the source code.</p><Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to portfolio</Link></div><section className="container guide-list">{guideItems.map(([title, text], index) => <article key={title}><span className="guide-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</section></main><SiteFooter /></>;
}

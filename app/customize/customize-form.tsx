"use client";

import { useState } from "react";
import type { EditableProfile, EducationItem, ExperienceItem, SkillGroup } from "../data/profile";
import type { GitHubRepository } from "../data/profile-server";

export default function CustomizeForm({ initialProfile, githubRepositories }: { initialProfile: EditableProfile; githubRepositories: GitHubRepository[] }) {
  const [form, setForm] = useState<EditableProfile>(() => cloneProfile(initialProfile));
  const [valuesText, setValuesText] = useState(initialProfile.values.join("\n"));
  const [status, setStatus] = useState("");
  const update = (field: "name" | "initials" | "avatar" | "title" | "location" | "availability" | "focus" | "subtitle" | "bio" | "summary" | "email", value: string) => setForm((current) => ({ ...current, [field]: value }));
  const updateSocial = (field: keyof EditableProfile["socials"], value: string) => setForm((current) => ({ ...current, socials: { ...current.socials, [field]: value } }));
  const updateExperience = (index: number, field: Exclude<keyof ExperienceItem, "bullets">, value: string) => setForm((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const updateExperienceBullets = (index: number, value: string) => setForm((current) => ({ ...current, experience: current.experience.map((item, itemIndex) => itemIndex === index ? { ...item, bullets: value.split(/\r?\n/) } : item) }));
  const updateSkillGroup = (index: number, field: keyof SkillGroup, value: string) => setForm((current) => ({ ...current, skillGroups: current.skillGroups.map((group, groupIndex) => groupIndex === index ? { ...group, [field]: field === "items" ? value.split(/\r?\n/) : value } : group) }));
  const updateEducation = (index: number, field: keyof EducationItem, value: string) => setForm((current) => ({ ...current, education: current.education.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  const updateGitHubCover = (name: string, value: string) => setForm((current) => ({ ...current, githubCovers: { ...current.githubCovers, [name]: value } }));
  const removeAt = (field: "experience" | "skillGroups" | "education", index: number) => setForm((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));

  async function save() {
    setStatus("Saving…");
    try {
      const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, values: valuesText.split(/\r?\n/) }) });
      setStatus(response.ok ? "Saved. Refresh the public site to see the changes." : "Could not save. Please try again.");
    } catch {
      setStatus("Could not save. Please try again.");
    }
  }

  return <div className="customize-form">
    <section><h2>Basic information</h2><label>Avatar image URL<input type="url" value={form.avatar} onChange={(event) => update("avatar", event.target.value)} placeholder="https://... or /profile/avatar.jpg" /></label><div className="customize-grid">{(["name", "initials", "title", "location", "availability", "focus"] as const).map((field) => <label key={field}>{labelFor(field)}<input value={form[field]} onChange={(event) => update(field, event.target.value)} /></label>)}</div></section>
    <section><h2>Introduction</h2><label>Short tagline<input value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></label><label>Hero description<textarea rows={4} value={form.bio} onChange={(event) => update("bio", event.target.value)} /></label><label>About summary<textarea rows={5} value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label><label>Values, one per line<textarea rows={5} value={valuesText} onChange={(event) => setValuesText(event.target.value)} /></label></section>
    <section><h2>Experience</h2><div className="customize-list">{form.experience.map((item, index) => <div className="customize-item" key={`${item.company}-${index}`}><div className="customize-item__header"><h3>Experience {index + 1}</h3><button className="button button--secondary" type="button" onClick={() => removeAt("experience", index)}>Remove</button></div><div className="customize-grid customize-grid--three"><label>Company<input value={item.company} onChange={(event) => updateExperience(index, "company", event.target.value)} /></label><label>Role<input value={item.role} onChange={(event) => updateExperience(index, "role", event.target.value)} /></label><label>Location<input value={item.location} onChange={(event) => updateExperience(index, "location", event.target.value)} /></label><label>Type<input value={item.type} onChange={(event) => updateExperience(index, "type", event.target.value)} /></label><label>Start date<input value={item.startDate} onChange={(event) => updateExperience(index, "startDate", event.target.value)} /></label><label>End date<input value={item.endDate} onChange={(event) => updateExperience(index, "endDate", event.target.value)} /></label></div><label>Contributions, one per line<textarea rows={4} value={item.bullets.join("\n")} onChange={(event) => updateExperienceBullets(index, event.target.value)} /></label><label>Impact (optional)<input value={item.impact ?? ""} onChange={(event) => updateExperience(index, "impact", event.target.value)} /></label></div>)}</div><button className="button button--secondary customize-add" type="button" onClick={() => setForm((current) => ({ ...current, experience: [...current.experience, emptyExperience()] }))}>Add experience</button></section>
    <section><h2>Skills &amp; Technologies</h2><div className="customize-list">{form.skillGroups.map((group, index) => <div className="customize-item" key={`${group.label}-${index}`}><div className="customize-item__header"><h3>Skill group {index + 1}</h3><button className="button button--secondary" type="button" onClick={() => removeAt("skillGroups", index)}>Remove</button></div><label>Group name<input value={group.label} onChange={(event) => updateSkillGroup(index, "label", event.target.value)} /></label><label>Skills, one per line<textarea rows={4} value={group.items.join("\n")} onChange={(event) => updateSkillGroup(index, "items", event.target.value)} /></label></div>)}</div><button className="button button--secondary customize-add" type="button" onClick={() => setForm((current) => ({ ...current, skillGroups: [...current.skillGroups, { label: "New group", items: ["New skill"] }] }))}>Add skill group</button></section>
    <section><h2>Education</h2><div className="customize-list">{form.education.map((item, index) => <div className="customize-item" key={`${item.school}-${index}`}><div className="customize-item__header"><h3>Education {index + 1}</h3><button className="button button--secondary" type="button" onClick={() => removeAt("education", index)}>Remove</button></div><div className="customize-grid"><label>Qualification<input value={item.qualification} onChange={(event) => updateEducation(index, "qualification", event.target.value)} /></label><label>School<input value={item.school} onChange={(event) => updateEducation(index, "school", event.target.value)} /></label><label>Field of study<input value={item.field} onChange={(event) => updateEducation(index, "field", event.target.value)} /></label><label>Year<input value={item.year} onChange={(event) => updateEducation(index, "year", event.target.value)} /></label></div><label>Relevant coursework (optional)<input value={item.coursework} onChange={(event) => updateEducation(index, "coursework", event.target.value)} /></label></div>)}</div><button className="button button--secondary customize-add" type="button" onClick={() => setForm((current) => ({ ...current, education: [...current.education, emptyEducation()] }))}>Add education</button></section>
    <section><h2>GitHub covers</h2>{githubRepositories.length ? <div className="customize-list">{githubRepositories.map((repo) => <div className="customize-item" key={repo.name}><label>{repo.name} cover image URL<input type="url" value={form.githubCovers[repo.name] ?? ""} onChange={(event) => updateGitHubCover(repo.name, event.target.value)} placeholder="https://... or /profile/project-cover.jpg" /></label></div>)}</div> : <p className="customize-help">Add a public GitHub profile URL above, save it, then reload this page to edit repository covers.</p>}<p className="customize-help">Paste a public image URL, including a GitHub Social preview URL, or a site path such as /profile/project-cover.jpg. Leave blank to keep the placeholder.</p></section>
    <section><h2>Contact links</h2><div className="customize-grid"><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>GitHub URL<input type="url" value={form.socials.github} onChange={(event) => updateSocial("github", event.target.value)} /></label><label>LinkedIn URL<input type="url" value={form.socials.linkedin} onChange={(event) => updateSocial("linkedin", event.target.value)} /></label><label>Email link<input type="text" value={form.socials.email} onChange={(event) => updateSocial("email", event.target.value)} /></label></div><p className="customize-help">When the GitHub URL points to a public profile, Featured Projects and Selected GitHub Work update automatically from its public repositories.</p></section>
    <div className="customize-actions"><button className="button button--primary" type="button" onClick={save}>Save changes</button><a className="text-link" href="/signout-with-chatgpt?return_to=/">Sign out</a><span aria-live="polite">{status}</span></div>
  </div>;
}

function cloneProfile(profile: EditableProfile): EditableProfile {
  return { ...profile, values: [...profile.values], socials: { ...profile.socials }, experience: profile.experience.map((item) => ({ ...item, bullets: [...item.bullets] })), skillGroups: profile.skillGroups.map((group) => ({ ...group, items: [...group.items] })), education: profile.education.map((item) => ({ ...item })), githubCovers: { ...profile.githubCovers } };
}

function emptyExperience(): ExperienceItem {
  return { company: "", role: "", location: "", type: "", startDate: "", endDate: "", bullets: [""], impact: "" };
}

function emptyEducation(): EducationItem {
  return { qualification: "", school: "", field: "", year: "", coursework: "" };
}

function labelFor(field: string) {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

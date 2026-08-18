"use client";

import { useState } from "react";
import type { EditableProfile } from "../data/profile";

export default function CustomizeForm({ initialProfile }: { initialProfile: EditableProfile }) {
  const [form, setForm] = useState<EditableProfile>({ ...initialProfile, socials: { ...initialProfile.socials } });
  const [valuesText, setValuesText] = useState(initialProfile.values.join("\n"));
  const [status, setStatus] = useState("");
  const update = (field: keyof EditableProfile, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const updateSocial = (field: keyof EditableProfile["socials"], value: string) => setForm((current) => ({ ...current, socials: { ...current.socials, [field]: value } }));
  async function save() {
    setStatus("Saving…");
    const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, values: valuesText.split("\n") }) });
    setStatus(response.ok ? "Saved. Refresh the public site to see the changes." : "Could not save. Please try again.");
  }
  return <div className="customize-form"><section><h2>Basic information</h2><label>Avatar image URL<input type="url" value={form.avatar} onChange={(event) => update("avatar", event.target.value)} placeholder="https://... or /profile/avatar.jpg" /></label><div className="customize-grid">{(["name", "initials", "title", "location", "availability", "focus"] as const).map((field) => <label key={field}>{labelFor(field)}<input value={form[field]} onChange={(event) => update(field, event.target.value)} /></label>)}</div></section><section><h2>Introduction</h2><label>Short tagline<input value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></label><label>Hero description<textarea rows={4} value={form.bio} onChange={(event) => update("bio", event.target.value)} /></label><label>About summary<textarea rows={5} value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label><label>Values, one per line<textarea rows={5} value={valuesText} onChange={(event) => setValuesText(event.target.value)} /></label></section><section><h2>Contact links</h2><div className="customize-grid"><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>GitHub URL<input type="url" value={form.socials.github} onChange={(event) => updateSocial("github", event.target.value)} /></label><label>LinkedIn URL<input type="url" value={form.socials.linkedin} onChange={(event) => updateSocial("linkedin", event.target.value)} /></label><label>Email link<input type="text" value={form.socials.email} onChange={(event) => updateSocial("email", event.target.value)} /></label></div></section><div className="customize-actions"><button className="button button--primary" type="button" onClick={save}>Save changes</button><a className="text-link" href="/signout-with-chatgpt?return_to=/">Sign out</a><span aria-live="polite">{status}</span></div></div>;
}

function labelFor(field: string) {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

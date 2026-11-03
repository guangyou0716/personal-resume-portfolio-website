import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Owner editor", robots: { index: false, follow: false } };
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { getGitHubRepositories, getProfileForEditor, isProfileEditor } from "../data/profile-server";
import CustomizeForm from "./customize-form";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const user = await getChatGPTUser();
  if (!user) return <CustomizeGate />;
  if (!(await isProfileEditor(user))) return <CustomizeAccessDenied />;
  let currentProfile;
  try {
    currentProfile = await getProfileForEditor();
  } catch {
    return <CustomizeUnavailable />;
  }
  const githubRepositories = await getGitHubRepositories(currentProfile.profile.socials.github);
  // A native navigation preserves the editor's unsaved-change warning.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <><main id="main-content" className="customize-page"><div className="container customize-shell"><div className="customize-heading"><div><span className="section-index">PRIVATE EDITOR</span><h1>Customize your portfolio</h1><p>Update the details below and they will appear on the public site and Quick Resume.</p></div><a className="text-link" href="/">View public site ↗</a></div><p className="customize-account">Signed in as {user.email}</p><CustomizeForm initialProfile={currentProfile.profile} profileVersion={currentProfile.updatedAt} githubRepositories={githubRepositories} /></div></main></>;
}

function CustomizeGate() {
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>Sign in to customize your portfolio</h1><p>This page is only for the site owner. Sign in with ChatGPT to continue.</p><a className="button button--primary" href={chatGPTSignInPath("/customize")} target="_top">Sign in with ChatGPT</a><Link className="text-link" href="/" prefetch={false}>Back to public site</Link></div></main>;
}

function CustomizeAccessDenied() {
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>This account cannot edit the site</h1><p>Sign out and use the ChatGPT account that owns this portfolio.</p><a className="button button--secondary" href="/signout-with-chatgpt?return_to=/customize">Sign out</a><Link className="text-link" href="/" prefetch={false}>Back to public site</Link></div></main>;
}

function CustomizeUnavailable() {
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>Your saved profile is temporarily unavailable</h1><p>Nothing was changed. Please try opening the editor again in a moment.</p><Link className="text-link" href="/" prefetch={false}>Back to public site</Link></div></main>;
}

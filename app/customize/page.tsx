import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import { getGitHubRepositories, getProfile, isProfileEditor } from "../data/profile-server";
import CustomizeForm from "./customize-form";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const user = await getChatGPTUser();
  if (!user) return <CustomizeGate />;
  if (!(await isProfileEditor(user))) return <CustomizeAccessDenied />;
  const currentProfile = await getProfile();
  const githubRepositories = await getGitHubRepositories(currentProfile.socials.github);
  return <><main className="customize-page"><div className="container customize-shell"><div className="customize-heading"><div><span className="section-index">PRIVATE EDITOR</span><h1>Customize your portfolio</h1><p>Update the details below and they will appear on the public site and Quick Resume.</p></div><Link className="text-link" href="/" prefetch={false}>View public site ↗</Link></div><p className="customize-account">Signed in as {user.email}</p><CustomizeForm initialProfile={currentProfile} githubRepositories={githubRepositories} /></div></main></>;
}

function CustomizeGate() {
  return <main className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>Sign in to customize your portfolio</h1><p>This page is only for the site owner. Sign in with ChatGPT to continue.</p><a className="button button--primary" href={chatGPTSignInPath("/customize")}>Sign in with ChatGPT</a><Link className="text-link" href="/" prefetch={false}>Back to public site</Link></div></main>;
}

function CustomizeAccessDenied() {
  return <main className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>This account cannot edit the site</h1><p>Sign out and use the ChatGPT account that owns this portfolio.</p><a className="button button--secondary" href="/signout-with-chatgpt?return_to=/customize">Sign out</a><Link className="text-link" href="/" prefetch={false}>Back to public site</Link></div></main>;
}

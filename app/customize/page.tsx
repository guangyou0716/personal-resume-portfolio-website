import type { Metadata } from "next";
import Link from "next/link";
import { ACCESS_SIGN_IN_PATH, ACCESS_SIGN_OUT_PATH, getEditorUser, isAccessConfigured, isEditorLoginConfigured, isPasswordLoginConfigured } from "../auth";
import { Icon } from "../components";
import { getGitHubRepositories, getProfileForEditor } from "../data/profile-server";
import CustomizeForm from "./customize-form";

export const metadata: Metadata = { title: "Owner editor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string | string[] };

export default async function CustomizePage({ searchParams }: { searchParams?: Promise<SearchParams> | SearchParams }) {
  if (!(await isEditorLoginConfigured())) return <CustomizeBlocked configured={false} />;
  const user = await getEditorUser();
  if (!user) {
    if (await isPasswordLoginConfigured()) {
      const params = await Promise.resolve(searchParams ?? {});
      const error = Array.isArray(params.error) ? params.error[0] : params.error;
      return <CustomizeSignIn accessConfigured={await isAccessConfigured()} error={error} />;
    }
    return <CustomizeBlocked configured />;
  }
  let currentProfile;
  try {
    currentProfile = await getProfileForEditor();
  } catch {
    return <CustomizeUnavailable />;
  }
  const githubRepositories = await getGitHubRepositories(currentProfile.profile.socials.github);
  // A native navigation preserves the editor's unsaved-change warning.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <><main id="main-content" className="customize-page"><div className="container customize-shell"><div className="customize-heading"><div><span className="section-index">PRIVATE EDITOR</span><h1>Customize your portfolio</h1><p>Update the details below and they will appear on the public site and Quick resume.</p></div><a className="text-link" href="/">View public site <Icon name="external" /></a></div><p className="customize-account">Signed in as {user.email}</p><CustomizeForm initialProfile={currentProfile.profile} profileVersion={currentProfile.updatedAt} githubRepositories={githubRepositories} authMethod={user.method} /></div></main></>;
}

function CustomizeSignIn({ accessConfigured, error }: { accessConfigured: boolean; error?: string }) {
  const message = error === "locked" ? "Too many sign-in attempts. Please try again in a few minutes." : error === "1" ? "Could not sign in. Please try again." : "";
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>Sign in</h1><p>Enter the owner password to edit this site.</p>{message ? <p className="customize-error" role="alert">{message}</p> : null}<form method="post" action="/api/editor/login"><label>Password<input type="password" name="password" autoComplete="current-password" /></label><button className="button button--primary" type="submit">Sign in</button></form>{accessConfigured && <a className="button button--primary" href={ACCESS_SIGN_IN_PATH}>Owner access</a>}{accessConfigured && <a className="button button--secondary" href={ACCESS_SIGN_OUT_PATH}>Sign out</a>}<Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to public site</Link></div></main>;
}

function CustomizeBlocked({ configured }: { configured: boolean }) {
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>{configured ? "Not authorized" : "Editor not configured"}</h1><p>{configured ? "You are not authorized to edit this site. Sign in through Cloudflare Access with the owner account." : "Cloudflare Access is not configured. You are not authorized to edit this site."}</p>{configured && <a className="button button--primary" href={ACCESS_SIGN_IN_PATH}>Owner access</a>}{configured && <a className="button button--secondary" href={ACCESS_SIGN_OUT_PATH}>Sign out</a>}<Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to public site</Link></div></main>;
}

function CustomizeUnavailable() {
  return <main id="main-content" className="customize-page"><div className="container customize-shell customize-message"><span className="section-index">PRIVATE EDITOR</span><h1>Your saved profile is temporarily unavailable</h1><p>Nothing was changed. Please try opening the editor again in a moment.</p><Link className="text-link" href="/" prefetch={false}><Icon name="arrow-left" />Back to public site</Link></div></main>;
}

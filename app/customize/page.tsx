import Link from "next/link";
import { getProfile, requireProfileEditor } from "../data/profile-server";
import CustomizeForm from "./customize-form";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const user = await requireProfileEditor();
  const currentProfile = await getProfile();
  return <><main className="customize-page"><div className="container customize-shell"><div className="customize-heading"><div><span className="section-index">PRIVATE EDITOR</span><h1>Customize your portfolio</h1><p>Update the details below and they will appear on the public site and Quick Resume.</p></div><Link className="text-link" href="/">View public site ↗</Link></div><p className="customize-account">Signed in as {user.email}</p><CustomizeForm initialProfile={currentProfile} /></div></main></>;
}

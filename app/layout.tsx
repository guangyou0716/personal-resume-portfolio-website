import type { Metadata } from "next";
import "./globals.css";
import { getProfile } from "./data/profile-server";
import { publicSiteOrigin } from "./site-origin";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const metadataBase = new URL(await publicSiteOrigin("http://localhost:3000"));
  const socialImage = new URL("/og.png?v=20261017", metadataBase).toString();
  return {
    metadataBase,
    title: `${profile.name} — ${profile.title}`,
    description: profile.subtitle,
    openGraph: { title: `${profile.name} — ${profile.title}`, description: profile.subtitle, type: "website", images: [{ url: socialImage, width: 1200, height: 630, alt: `${profile.name} — ${profile.title}` }] },
    twitter: { card: "summary_large_image", title: `${profile.name} — ${profile.title}`, description: profile.subtitle, images: [socialImage] },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("portfolio-theme");var s=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t==="dark"||t==="light"?t:s;document.documentElement.style.colorScheme=document.documentElement.dataset.theme}catch(e){}` }} /></head>
      <body>{children}</body>
    </html>
  );
}

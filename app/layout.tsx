import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import SiteInteractions from "./site-interactions";
import { getProfile } from "./data/profile-server";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const profile = await getProfile();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = (requestHeaders.get("x-forwarded-proto") ?? "http").split(",")[0];
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase).toString();
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
    <html lang="en">
      <body><SiteInteractions />{children}</body>
    </html>
  );
}

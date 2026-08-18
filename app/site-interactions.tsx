"use client";

import { useEffect } from "react";

export default function SiteInteractions() {
  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem("portfolio-theme");
    if (stored === "dark" || stored === "light") root.dataset.theme = stored;

    const themeButton = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
    const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
    const mobileNav = document.querySelector<HTMLElement>("[data-mobile-nav]");
    const toggleTheme = () => {
      const isDark = root.dataset.theme === "dark" || (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const nextTheme = isDark ? "light" : "dark";
      root.dataset.theme = nextTheme;
      window.localStorage.setItem("portfolio-theme", nextTheme);
    };
    const toggleMenu = () => {
      const open = mobileNav?.classList.toggle("is-open") ?? false;
      menuButton?.setAttribute("aria-expanded", String(open));
      menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    themeButton?.addEventListener("click", toggleTheme);
    menuButton?.addEventListener("click", toggleMenu);
    mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { mobileNav.classList.remove("is-open"); menuButton?.setAttribute("aria-expanded", "false"); menuButton?.setAttribute("aria-label", "Open menu"); }));
    return () => { themeButton?.removeEventListener("click", toggleTheme); menuButton?.removeEventListener("click", toggleMenu); };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

export default function SiteInteractions() {
  useEffect(() => {
    const root = document.documentElement;
    const themeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]"));
    const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
    const mobileNav = document.querySelector<HTMLElement>("[data-mobile-nav]");
    const applyTheme = (theme: "dark" | "light") => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      themeButtons.forEach((button) => button.setAttribute("aria-pressed", String(theme === "dark")));
    };
    const stored = window.localStorage.getItem("portfolio-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(stored === "dark" || stored === "light" ? stored : systemTheme);
    const toggleTheme = () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      window.localStorage.setItem("portfolio-theme", nextTheme);
    };
    const toggleMenu = () => {
      const open = mobileNav?.classList.toggle("is-open") ?? false;
      menuButton?.setAttribute("aria-expanded", String(open));
      menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    const closeMenu = () => {
      mobileNav?.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open menu");
    };
    themeButtons.forEach((button) => button.addEventListener("click", toggleTheme));
    menuButton?.addEventListener("click", toggleMenu);
    mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    return () => {
      themeButtons.forEach((button) => button.removeEventListener("click", toggleTheme));
      menuButton?.removeEventListener("click", toggleMenu);
      mobileNav?.querySelectorAll("a").forEach((link) => link.removeEventListener("click", closeMenu));
    };
  }, []);

  return null;
}

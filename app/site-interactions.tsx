"use client";

import { useEffect } from "react";

const MOBILE_BREAKPOINT = 820;

export default function SiteInteractions() {
  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const themeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]"));
    const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
    const mobileNav = document.querySelector<HTMLElement>("[data-mobile-nav]");
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-section-nav]"));
    const sections = Array.from(new Set(navLinks.map((link) => document.getElementById(link.dataset.sectionNav === "about" ? "about" : link.dataset.sectionNav ?? "")).filter((section): section is HTMLElement => Boolean(section))));
    let lastFocus: HTMLElement | null = null;

    const applyTheme = (theme: "dark" | "light") => {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      themeButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(theme === "dark"));
        button.title = theme === "dark" ? "Switch to light appearance" : "Switch to dark appearance";
      });
    };
    const readStoredTheme = () => {
      try { return window.localStorage.getItem("portfolio-theme"); } catch { return null; }
    };
    const systemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const stored = readStoredTheme();
    applyTheme(stored === "dark" || stored === "light" ? stored : systemTheme());

    const toggleTheme = () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      const update = () => applyTheme(nextTheme);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "startViewTransition" in document && typeof document.startViewTransition === "function") document.startViewTransition(update);
      else update();
      try { window.localStorage.setItem("portfolio-theme", nextTheme); } catch { /* storage is optional */ }
    };
    const onSystemThemeChange = () => { if (!readStoredTheme()) applyTheme(systemTheme()); };
    const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
    systemMedia.addEventListener?.("change", onSystemThemeChange);

    const setBackgroundInert = (value: boolean) => {
      document.querySelectorAll<HTMLElement>("main, .site-footer").forEach((element) => { element.inert = value; });
    };
    const closeMenu = (restoreFocus = false) => {
      setBackgroundInert(false);
      mobileNav?.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Open menu");
      if (restoreFocus) (lastFocus ?? menuButton)?.focus();
      lastFocus = null;
    };
    const openMenu = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT || !mobileNav) return;
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuButton;
      mobileNav.classList.add("is-open");
      setBackgroundInert(true);
      requestAnimationFrame(() => {
        if (mobileNav.classList.contains("is-open")) mobileNav.querySelector<HTMLAnchorElement>("a")?.focus();
      });
      document.body.classList.add("menu-open");
      menuButton?.setAttribute("aria-expanded", "true");
      menuButton?.setAttribute("aria-label", "Close menu");
    };
    const toggleMenu = () => mobileNav?.classList.contains("is-open") ? closeMenu(true) : openMenu();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && mobileNav?.classList.contains("is-open")) {
        const controls = Array.from(header?.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(".brand-link, .header-actions button, [data-mobile-nav] a, [data-mobile-nav] button") ?? []);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Escape" && mobileNav?.classList.contains("is-open")) { event.preventDefault(); closeMenu(true); } };
    const onPointerDown = (event: PointerEvent) => { if (mobileNav?.classList.contains("is-open") && header && event.target instanceof Node && !header.contains(event.target)) closeMenu(true); };
    const onResize = () => { if (window.innerWidth > MOBILE_BREAKPOINT) closeMenu(); };
    const onNavClick = (event: Event) => {
      closeMenu();
      if (!(event.currentTarget instanceof HTMLAnchorElement)) return;
      const destination = new URL(event.currentTarget.href);
      if (destination.pathname !== window.location.pathname || !destination.hash) return;
      const target = document.getElementById(destination.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    themeButtons.forEach((button) => button.addEventListener("click", toggleTheme));
    menuButton?.addEventListener("click", toggleMenu);
    mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", onNavClick));
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);

    const setActive = (id: string) => navLinks.forEach((link) => {
      const active = link.dataset.sectionNav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
    });
    const observer = sections.length ? new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive((visible.target as HTMLElement).id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, .2, .6] }) : null;
    sections.forEach((section) => observer?.observe(section));
    if (window.location.hash) requestAnimationFrame(() => {
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = previousBehavior;
    });

    return () => {
      closeMenu();
      themeButtons.forEach((button) => button.removeEventListener("click", toggleTheme));
      menuButton?.removeEventListener("click", toggleMenu);
      mobileNav?.querySelectorAll("a").forEach((link) => link.removeEventListener("click", onNavClick));
      systemMedia.removeEventListener?.("change", onSystemThemeChange);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, []);

  return null;
}

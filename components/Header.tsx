"use client";

/**
 * Header — desktop nav unchanged; mobile hamburger with project dropdown.
 */

import { PROJECTS } from "@/lib/project-details";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Introduction", href: "#architecture" },
  { label: "Projects", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

const WHATSAPP_URL = "https://wa.me/96170137192";
const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";
const INTRO_HREF = "/#architecture";

function lockBodyScroll(): () => void {
  const scrollY = window.scrollY;
  const { style } = document.body;
  const prev = {
    position: style.position,
    top: style.top,
    width: style.width,
    overflow: style.overflow,
  };

  style.position = "fixed";
  style.top = `-${scrollY}px`;
  style.width = "100%";
  style.overflow = "hidden";
  document.body.classList.add("mobile-nav-open");

  return () => {
    style.position = prev.position;
    style.top = prev.top;
    style.width = prev.width;
    style.overflow = prev.overflow;
    document.body.classList.remove("mobile-nav-open");
    window.scrollTo(0, scrollY);
  };
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setProjectsOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const unlock = lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlock();
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) setProjectsOpen(false);
  }, [menuOpen]);

  return (
    <>
      <header className="site-header fixed inset-x-0 top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-4 sm:px-5 md:px-10 md:py-6">
        <Link
          href={INTRO_HREF}
          aria-label="BMC Development — back to top"
          className="justify-self-start inline-flex items-center"
          onClick={closeMenu}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_SRC}
            alt="BMC Development"
            draggable={false}
            decoding="async"
            className="h-auto w-[54px] object-contain sm:w-[64px] md:w-[78px] lg:w-[88px]"
          />
        </Link>

        <nav
          className="hidden justify-self-center gap-6 md:flex lg:gap-8"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[0.65rem] tracking-[0.22em] text-cream/55 uppercase transition-colors duration-500 hover:text-cream"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="justify-self-end flex items-center">
          <button
            type="button"
            className="mobile-nav-toggle md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
          >
            {menuOpen ? (
              <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
            )}
          </button>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact BMC on WhatsApp"
            className="hidden whitespace-nowrap rounded-full border border-cream/20 bg-black/35 px-3.5 py-2 text-[0.6rem] tracking-[0.2em] text-cream/80 uppercase transition-all duration-500 hover:border-cream/40 hover:bg-black/50 md:inline-flex md:px-5 md:py-2.5 md:text-[0.65rem]"
          >
            Contact
          </a>
        </div>
      </header>

      {menuOpen && (
        <div
          className="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            type="button"
            className="mobile-nav__backdrop"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          />
          <nav
            id="mobile-nav-panel"
            className="mobile-nav__panel"
            aria-label="Mobile navigation menu"
          >
            <Link
              href={INTRO_HREF}
              className="mobile-nav__link"
              onClick={closeMenu}
            >
              Introduction
            </Link>

            <div className="mobile-nav__group">
              <button
                type="button"
                className="mobile-nav__link mobile-nav__link--toggle"
                aria-expanded={projectsOpen}
                aria-controls="mobile-nav-projects"
                onClick={() => setProjectsOpen((open) => !open)}
              >
                <span>Nos projets</span>
                <ChevronDown
                  className={`mobile-nav__chevron${projectsOpen ? " mobile-nav__chevron--open" : ""}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
              <ul
                id="mobile-nav-projects"
                className={`mobile-nav__submenu${projectsOpen ? " mobile-nav__submenu--open" : ""}`}
              >
                {PROJECTS.map((project) => (
                  <li key={project.slug}>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="mobile-nav__sublink"
                      onClick={closeMenu}
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav__link mobile-nav__link--cta"
              onClick={closeMenu}
            >
              Contact
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

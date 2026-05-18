"use client";

import { lockBodyScroll } from "@/lib/mobile-nav-lock";
import { PROJECTS } from "@/lib/project-details";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const WHATSAPP_URL = "https://wa.me/96170137192";
const INTRO_HREF = "/#architecture";

/**
 * Hamburger + mobile nav panel (hidden from md breakpoint up).
 * Same menu on the main site header and project detail pages.
 */
export default function SiteMobileNavMenu() {
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

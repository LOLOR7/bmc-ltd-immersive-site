"use client";

/**
 * Header — desktop nav unchanged; mobile hamburger with project dropdown.
 */

import SiteMobileNavMenu from "@/components/SiteMobileNavMenu";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Introduction", href: "#architecture" },
  { label: "Projects", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

const WHATSAPP_URL = "https://wa.me/96170137192";
const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";
const INTRO_HREF = "/#architecture";

export default function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-4 sm:px-5 md:px-10 md:py-6">
      <Link
        href={INTRO_HREF}
        aria-label="BMC Development — back to top"
        className="justify-self-start inline-flex items-center"
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

      <div className="justify-self-end flex items-center gap-2">
        <SiteMobileNavMenu />

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
  );
}

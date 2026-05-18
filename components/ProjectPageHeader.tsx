"use client";

import SiteMobileNavMenu from "@/components/SiteMobileNavMenu";
import Link from "next/link";

const LOGO_SRC = "/assets/bmc-logo-client-cream.png?v=1";

export default function ProjectPageHeader() {
  return (
    <header className="project-page__header">
      <Link href="/" className="project-page__logo-link" aria-label="BMC Development">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SRC}
          alt="BMC Development"
          className="project-page__logo"
          decoding="async"
          draggable={false}
        />
      </Link>

      <div className="project-page__header-actions">
        <SiteMobileNavMenu />
        <Link href="/" className="project-page__back">
          Back to experience
        </Link>
      </div>
    </header>
  );
}

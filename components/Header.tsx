"use client";

const NAV_ITEMS = [
  { label: "Architecture", href: "#architecture" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:py-7">
      <a
        href="#intro"
        className="justify-self-start text-sm font-medium tracking-[0.28em] text-cream/90 uppercase md:text-xs"
      >
        BMC
      </a>

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

      <a
        href="#contact"
        className="justify-self-end rounded-full border border-cream/20 bg-black/35 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-cream/80 uppercase transition-all duration-500 hover:border-cream/40 hover:bg-black/50 md:px-5 md:py-2.5 md:text-[0.65rem]"
      >
        Request Access
      </a>
    </header>
  );
}

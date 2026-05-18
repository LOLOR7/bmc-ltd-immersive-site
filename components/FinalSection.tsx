import { FINAL_COPY } from "@/lib/scenes";

export default function FinalSection() {
  return (
    <section id="contact" className="final-section">
      <h2 className="text-4xl leading-tight font-light tracking-[-0.03em] text-cream md:text-6xl">
        {FINAL_COPY.title}
      </h2>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/55 md:text-base">
        {FINAL_COPY.subtitle}
      </p>
      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="#contact"
          className="rounded-full border border-cream/25 bg-cream px-8 py-3.5 text-[0.65rem] tracking-[0.22em] text-[#050505] uppercase transition-opacity duration-500 hover:opacity-90"
        >
          {FINAL_COPY.primaryCta}
        </a>
        <a
          href="mailto:contact@admacliffhouse.com"
          className="rounded-full border border-cream/20 px-8 py-3.5 text-[0.65rem] tracking-[0.22em] text-cream/75 uppercase transition-colors duration-500 hover:border-cream/40 hover:text-cream"
        >
          {FINAL_COPY.secondaryCta}
        </a>
      </div>
    </section>
  );
}

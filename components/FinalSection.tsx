const WHATSAPP_URL = "https://wa.me/96170137192";
const PHONE_URL = "tel:+96170137192";

export default function FinalSection() {
  return (
    <section id="contact" className="final-section">
      <p className="mb-5 text-[0.65rem] tracking-[0.32em] text-cream/50 uppercase md:mb-6">
        Contact Us
      </p>
      <h2 className="max-w-3xl text-3xl leading-tight font-light tracking-[-0.03em] text-cream md:text-5xl lg:text-6xl">
        We can design and execute your project
      </h2>
      <div className="mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-cream/25 bg-cream px-8 py-3.5 text-center text-[0.65rem] tracking-[0.22em] text-[#050505] uppercase transition-opacity duration-500 hover:opacity-90"
        >
          WhatsApp
        </a>
        <a
          href={PHONE_URL}
          className="rounded-full border border-cream/20 px-8 py-3.5 text-center text-[0.65rem] tracking-[0.14em] text-cream/75 transition-colors duration-500 hover:border-cream/40 hover:text-cream sm:tracking-[0.18em]"
        >
          +961 70 137 192
        </a>
      </div>
    </section>
  );
}

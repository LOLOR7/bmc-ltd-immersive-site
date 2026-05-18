import MetricPill from "@/components/MetricPill";

type TransitionSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  metrics?: string[];
  ariaLabel?: string;
};

export default function TransitionSection({
  eyebrow = "Next residence",
  title,
  subtitle = "A second architectural journey — mountain chalets in Bekish.",
  metrics,
  ariaLabel = "Between projects",
}: TransitionSectionProps) {
  return (
    <section
      className="relative z-10 flex min-h-[40vh] flex-col items-center justify-center border-y border-cream/10 bg-[#050505] px-6 py-20 text-center md:min-h-[50vh] md:py-28"
      aria-label={ariaLabel}
    >
      <p className="text-[0.65rem] tracking-[0.35em] text-cream/35 uppercase">
        {eyebrow}
      </p>
      {title ? (
        <h2 className="mt-4 text-2xl font-light tracking-[-0.02em] text-cream md:text-3xl">
          {title}
        </h2>
      ) : null}
      <p
        className={`max-w-md text-sm leading-relaxed text-cream/50 md:text-base ${title ? "mt-3" : "mt-4"}`}
      >
        {subtitle}
      </p>
      {metrics && metrics.length > 0 ? (
        <ul className="mt-8 flex flex-col flex-wrap items-center justify-center gap-2 sm:flex-row sm:gap-3">
          {metrics.map((label) => (
            <li key={label}>
              <MetricPill label={label} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

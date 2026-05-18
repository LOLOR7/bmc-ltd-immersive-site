type MetricPillProps = {
  label: string;
  className?: string;
};

export default function MetricPill({ label, className = "" }: MetricPillProps) {
  return (
    <span
      className={`metric-pill inline-flex items-center rounded-full border border-cream/15 bg-black/25 px-4 py-2 text-[0.6rem] tracking-[0.18em] text-cream/75 uppercase md:text-[0.65rem] ${className}`}
    >
      {label}
    </span>
  );
}

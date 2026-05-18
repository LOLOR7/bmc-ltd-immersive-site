import { getProjectHrefForExperience } from "@/lib/project-details";
import Link from "next/link";

type ViewProjectLinkProps = {
  experienceId: string;
};

export default function ViewProjectLink({ experienceId }: ViewProjectLinkProps) {
  const href = getProjectHrefForExperience(experienceId);
  if (!href) return null;

  return (
    <Link
      href={href}
      className="mt-6 inline-flex rounded-full border border-cream/20 bg-black/25 px-5 py-2.5 text-[0.6rem] tracking-[0.2em] text-cream/75 uppercase backdrop-blur-sm transition-colors duration-500 hover:border-cream/40 hover:text-cream sm:mt-8"
    >
      View more details
    </Link>
  );
}

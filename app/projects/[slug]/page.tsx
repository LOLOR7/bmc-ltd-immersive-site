import ProjectPageContent from "@/components/ProjectPageContent";
import {
  ALL_PROJECT_SLUGS,
  getProjectBySlug,
  type ProjectSlug,
} from "@/lib/project-details";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ALL_PROJECT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project — BMC Development" };
  }
  return {
    title: `${project.title} — BMC Development`,
    description: project.subtitle,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectPageContent project={project} />;
}

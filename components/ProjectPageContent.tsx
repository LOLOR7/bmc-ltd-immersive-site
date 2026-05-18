import ProjectPageHeader from "@/components/ProjectPageHeader";
import type { ProjectPageData } from "@/lib/project-details";

const WHATSAPP_URL = "https://wa.me/96170137192";
const PHONE_URL = "tel:+96170137192";

type ProjectPageContentProps = {
  project: ProjectPageData;
};

export default function ProjectPageContent({ project }: ProjectPageContentProps) {
  return (
    <div className="project-page">
      <ProjectPageHeader />

      <main className="project-page__main">
        <section className="project-page__hero">
          {project.location && (
            <p className="project-page__eyebrow">{project.location}</p>
          )}
          <h1 className="project-page__title">{project.title}</h1>
          <p className="project-page__subtitle">{project.subtitle}</p>
          {project.keyFacts.length > 0 && (
            <ul className="project-page__facts">
              {project.keyFacts.map((fact) => (
                <li key={fact} className="project-page__fact">
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="project-page__gallery-section"
          aria-label="Project gallery"
        >
          {project.gallery.length > 0 ? (
            <ul className="project-page__gallery">
              {project.gallery.map((image) => (
                <li key={image.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="project-page__gallery-placeholder">
              <p>{project.galleryPlaceholder}</p>
            </div>
          )}
        </section>

        <section className="project-page__section">
          <h2 className="project-page__section-label">Overview</h2>
          {project.overview.map((paragraph) => (
            <p key={paragraph} className="project-page__paragraph">
              {paragraph}
            </p>
          ))}
        </section>

        {project.highlights.length > 0 && (
          <section className="project-page__section">
            <h2 className="project-page__section-label">Sequence highlights</h2>
            <ul className="project-page__highlights">
              {project.highlights.map((scene) => (
                <li key={`${scene.index ?? ""}-${scene.title}`}>
                  <article className="project-page__highlight">
                    {scene.index && (
                      <p className="project-page__highlight-index">{scene.index}</p>
                    )}
                    <h3 className="project-page__highlight-title">{scene.title}</h3>
                    <p className="project-page__highlight-desc">
                      {scene.description}
                    </p>
                    {scene.tags.length > 0 && (
                      <ul className="project-page__highlight-tags">
                        {scene.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="project-page__cta">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="project-page__cta-btn project-page__cta-btn--primary"
          >
            WhatsApp
          </a>
          <a href={PHONE_URL} className="project-page__cta-btn">
            +961 70 137 192
          </a>
        </section>
      </main>
    </div>
  );
}

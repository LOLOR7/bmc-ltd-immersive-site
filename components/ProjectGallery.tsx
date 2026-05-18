"use client";

import { lockBodyScroll } from "@/lib/mobile-nav-lock";
import type { ProjectGalleryImage } from "@/lib/project-details";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ProjectGalleryProps = {
  images: ProjectGalleryImage[];
};

export default function ProjectGallery({ images }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((index) => {
      if (index === null || images.length === 0) return index;
      return (index - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) => {
      if (index === null || images.length === 0) return index;
      return (index + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const unlock = lockBodyScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlock();
    };
  }, [activeIndex, close, showNext, showPrev]);

  if (images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <>
      <ul className="project-page__gallery">
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              className="project-page__gallery-trigger"
              onClick={() => setActiveIndex(index)}
              aria-label={`View larger: ${image.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      {activeImage && activeIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
        >
          <button
            type="button"
            className="gallery-lightbox__backdrop"
            aria-label="Close image viewer"
            onClick={close}
          />
          <button
            type="button"
            className="gallery-lightbox__close"
            aria-label="Close image viewer"
            onClick={close}
          >
            <X className="h-5 w-5" strokeWidth={1.25} aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                aria-label="Previous image"
                onClick={showPrev}
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--next"
                aria-label="Next image"
                onClick={showNext}
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" />
              </button>
            </>
          )}

          <figure className="gallery-lightbox__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="gallery-lightbox__image"
              decoding="async"
            />
            <figcaption className="gallery-lightbox__caption">
              {activeImage.alt}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

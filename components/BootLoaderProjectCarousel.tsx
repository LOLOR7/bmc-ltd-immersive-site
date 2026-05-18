"use client";

import type { ProjectGalleryImage } from "@/lib/project-details";

type BootLoaderProjectCarouselProps = {
  images: ProjectGalleryImage[];
};

export default function BootLoaderProjectCarousel({
  images,
}: BootLoaderProjectCarouselProps) {
  if (images.length === 0) return null;

  const trackImages = [...images, ...images];

  return (
    <div className="boot-loader__carousel" aria-hidden="true">
      <div className="boot-loader__carousel-viewport">
        <div className="boot-loader__carousel-track">
          {trackImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="boot-loader__carousel-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

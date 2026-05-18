"use client";

import type { ProjectGalleryImage } from "@/lib/project-details";
import { useEffect, useMemo, useState } from "react";

const MIN_VISIBLE_IMAGES = 3;

type BootLoaderProjectCarouselProps = {
  images: ProjectGalleryImage[];
};

function preloadImage(image: ProjectGalleryImage): Promise<ProjectGalleryImage | null> {
  const src = image.src?.trim();
  if (!src) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(image);
    img.onerror = () => resolve(null);
    img.decoding = "async";
    img.src = src;
  });
}

export default function BootLoaderProjectCarousel({
  images,
}: BootLoaderProjectCarouselProps) {
  const candidates = useMemo(
    () =>
      images.filter(
        (image, index, list) =>
          Boolean(image.src?.trim()) &&
          list.findIndex((item) => item.src === image.src) === index,
      ),
    [images],
  );

  const [readyImages, setReadyImages] = useState<ProjectGalleryImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    setReadyImages([]);

    void Promise.all(candidates.map((image) => preloadImage(image))).then(
      (results) => {
        if (cancelled) return;
        setReadyImages(
          results.filter((image): image is ProjectGalleryImage => image !== null),
        );
      },
    );

    return () => {
      cancelled = true;
    };
  }, [candidates]);

  if (readyImages.length < MIN_VISIBLE_IMAGES) return null;

  const trackImages = [...readyImages, ...readyImages];

  return (
    <div className="boot-loader__carousel" aria-hidden="true">
      <div className="boot-loader__carousel-viewport">
        <div className="boot-loader__carousel-track">
          {trackImages.map((image, index) => (
            <CarouselSlide key={`${image.src}-${index}`} image={image} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CarouselSlide({ image }: { image: ProjectGalleryImage }) {
  const [failed, setFailed] = useState(false);

  if (failed || !image.src) return null;

  return (
    <div className="boot-loader__carousel-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt=""
        loading="eager"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

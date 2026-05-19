"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/adma-527-mobile-scroll-poc.mp4";
const SCROLL_HEIGHT_VH = 400;
/** Min delta (s) before seeking — reduces iOS scrub jank. */
const SEEK_THRESHOLD_S = 0.04;

export default function VideoScrollExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let ctx: gsap.Context | undefined;

    const bindScroll = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const target = self.progress * duration;
            if (!Number.isFinite(target)) return;
            if (Math.abs(video.currentTime - target) < SEEK_THRESHOLD_S) return;
            try {
              video.currentTime = target;
            } catch {
              /* iOS may reject seek while not ready */
            }
          },
        });
      }, section);

      ScrollTrigger.refresh();
    };

    const onLoadedMetadata = () => bindScroll();

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    }

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="adma527-video-scroll-poc"
      className="frame-section video-scroll-poc"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="Video scroll proof of concept — Adma 527"
    >
      <div className="frame-sticky">
        <video
          ref={videoRef}
          className="frame-image video-scroll-poc__video"
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden
        />
        <div className="frame-exposure" aria-hidden="true" />
        <p className="video-scroll-poc__label">Video Scroll POC — Adma 527</p>
      </div>
    </section>
  );
}

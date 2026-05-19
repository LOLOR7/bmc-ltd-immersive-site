"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

const VIDEO_PATH = "/videos/adma-527-mobile-scroll-poc.mp4";
const SCROLL_HEIGHT_VH = 400;
/** Min delta (s) before seeking — reduces iOS scrub jank. */
const SEEK_THRESHOLD_S = 0.04;

const isDev = process.env.NODE_ENV === "development";

type VideoStatus = "loading" | "ready" | "error";

function logDev(label: string, video: HTMLVideoElement) {
  if (!isDev) return;
  console.log(`[VideoScrollPOC] ${label}`, {
    currentSrc: video.currentSrc,
    readyState: video.readyState,
    networkState: video.networkState,
    duration: video.duration,
  });
}

function primeIosFirstFrame(video: HTMLVideoElement) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;
  const t = Math.min(0.001, duration);
  try {
    video.currentTime = t;
  } catch {
    /* iOS may reject seek before buffer */
  }
}

export default function VideoScrollExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState(VIDEO_PATH);
  const [status, setStatus] = useState<VideoStatus>("loading");

  useEffect(() => {
    setVideoSrc(
      typeof window !== "undefined"
        ? new URL(VIDEO_PATH, window.location.href).href
        : VIDEO_PATH,
    );
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let ctx: gsap.Context | undefined;
    let scrollBound = false;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
    video.preload = "auto";
    video.load();

    const bindScroll = () => {
      if (scrollBound) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      scrollBound = true;
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: () => {
            primeIosFirstFrame(video);
          },
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

    const markReady = () => {
      setStatus("ready");
      primeIosFirstFrame(video);
      bindScroll();
      void video
        .play()
        .then(() => {
          video.pause();
          primeIosFirstFrame(video);
        })
        .catch(() => {
          /* autoplay blocked until scroll — first frame may still paint */
        });
    };

    const onLoadedMetadata = () => {
      logDev("loadedmetadata", video);
      primeIosFirstFrame(video);
      bindScroll();
    };

    const onCanPlay = () => {
      logDev("canplay", video);
      markReady();
    };

    const onError = () => {
      logDev("error", video);
      setStatus("error");
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onLoadedMetadata();
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onCanPlay();
    }

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      ctx?.revert();
    };
  }, [videoSrc]);

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
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden
        />
        <div className="frame-exposure" aria-hidden="true" />
        {status === "loading" && (
          <p className="video-scroll-poc__status" role="status">
            Video loading…
          </p>
        )}
        {status === "error" && (
          <p className="video-scroll-poc__status video-scroll-poc__status--error" role="alert">
            Video unavailable — check connection or use www.bmcdevelopmentlb.com
          </p>
        )}
        <p className="video-scroll-poc__label">Video Scroll POC — Adma 527</p>
      </div>
    </section>
  );
}

"use client";

import {
  hasBootCompleted,
  isDev,
  markBootCompleted,
  runPriorityBoot,
} from "@/lib/frame-preload";
import { useEffect, useState } from "react";

type BootPhase = "loading" | "fading" | "hidden";

export default function ExperienceBootLoader() {
  const [phase, setPhase] = useState<BootPhase>(() =>
    isDev || hasBootCompleted() ? "hidden" : "loading",
  );
  const [progress, setProgress] = useState(0);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isDev || phase !== "loading") return;

    let cancelled = false;
    document.body.classList.add("boot-loading");

    const finish = () => {
      if (cancelled) return;
      markBootCompleted();
      setPhase("fading");
      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("hidden");
        document.body.classList.remove("boot-loading");
      }, 520);
    };

    void runPriorityBoot(
      (ratio) => {
        if (!cancelled) setProgress(ratio);
      },
      (src) => {
        if (!cancelled) setPosterSrc(src);
      },
    ).then(() => {
      if (!cancelled) finish();
    });

    return () => {
      cancelled = true;
      document.body.classList.remove("boot-loading");
    };
  }, [phase]);

  if (isDev || phase === "hidden") return null;

  return (
    <div
      className={`experience-boot${phase === "fading" ? " experience-boot--fading" : ""}`}
      aria-live="polite"
      aria-busy={phase === "loading"}
      aria-label="Loading architectural experience"
    >
      {posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="experience-boot__poster"
          decoding="async"
          draggable={false}
        />
      ) : null}
      <div className="experience-boot__veil" aria-hidden="true" />
      <div className="experience-boot__content">
        <p className="experience-boot__label">BMC</p>
        <p className="experience-boot__hint">Preparing experience</p>
        <div className="experience-boot__track" aria-hidden="true">
          <span
            className="experience-boot__bar"
            style={{ transform: `scaleX(${Math.max(0.04, progress)})` }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { MOBILE_VIDEO_PROJECT_COUNT } from "@/lib/mobile-video-projects";

type MobileProjectProgressProps = {
  activeIndex: number;
};

export default function MobileProjectProgress({
  activeIndex,
}: MobileProjectProgressProps) {
  const clamped = Math.min(
    MOBILE_VIDEO_PROJECT_COUNT - 1,
    Math.max(0, activeIndex),
  );

  return (
    <div
      className="mobile-project-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={MOBILE_VIDEO_PROJECT_COUNT}
      aria-valuenow={clamped + 1}
      aria-label={`Project ${clamped + 1} of ${MOBILE_VIDEO_PROJECT_COUNT}`}
    >
      <div className="mobile-project-progress__track">
        {Array.from({ length: MOBILE_VIDEO_PROJECT_COUNT }, (_, i) => (
          <span
            key={i}
            className={`mobile-project-progress__segment${
              i < clamped
                ? " mobile-project-progress__segment--past"
                : i === clamped
                  ? " mobile-project-progress__segment--active"
                  : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

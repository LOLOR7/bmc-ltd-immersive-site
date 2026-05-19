import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisLike = { stop: () => void; start: () => void };

declare global {
  interface Window {
    __bmcLenis?: LenisLike;
  }
}

let lockCount = 0;
let savedScrollY = 0;

/** iOS-safe scroll freeze while a mobile video gate is active. Ref-counted. */
export function lockMobileScroll(): () => void {
  lockCount += 1;
  if (lockCount > 1) {
    return () => {
      lockCount = Math.max(0, lockCount - 1);
    };
  }

  savedScrollY = window.scrollY;
  document.body.classList.add("mobile-gate-locked");
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = "100%";

  window.__bmcLenis?.stop();

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;

    document.body.classList.remove("mobile-gate-locked");
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, savedScrollY);
    window.__bmcLenis?.start();
    ScrollTrigger.refresh();
  };
}

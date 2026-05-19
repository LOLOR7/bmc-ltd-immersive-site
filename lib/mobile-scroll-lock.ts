type LenisLike = { stop: () => void; start: () => void };

declare global {
  interface Window {
    __bmcLenis?: LenisLike;
  }
}

let lockCount = 0;

/**
 * iOS-safe scroll freeze while a mobile video gate is active. Ref-counted.
 *
 * Previous implementation used `body { position: fixed; top: -scrollY }`
 * which produced a visible "page remonte" jump on unlock: the moment we
 * removed `position: fixed`, the browser had `scrollY = 0`, displayed the
 * top of the page for one frame, then `window.scrollTo(0, savedScrollY)`
 * restored the previous position. The flicker was perceived as the page
 * scrolling up by half a page.
 *
 * The new lock relies on:
 *   - `body.mobile-gate-locked` CSS class (`overflow: hidden; touch-action: none`)
 *   - the same `overflow: hidden` on `<html>` to cover Safari's html-level scroll
 *   - `Lenis.stop()` to halt the smooth-scroll animator
 *   - `touchmove` `preventDefault` in the consuming component
 *
 * `window.scrollY` is preserved end-to-end — no `scrollTo`, no flicker.
 * `ScrollTrigger.refresh()` is the consumer's responsibility (called in
 * `MobileVideoJourney.handleUnlocked` because the intro `minHeight`
 * transitions 100vh → 115vh on unlock and shifts the layout below).
 */
export function lockMobileScroll(): () => void {
  lockCount += 1;
  if (lockCount > 1) {
    return () => {
      lockCount = Math.max(0, lockCount - 1);
    };
  }

  const html = document.documentElement;
  const previousHtmlOverflow = html.style.overflow;

  document.body.classList.add("mobile-gate-locked");
  html.style.overflow = "hidden";
  window.__bmcLenis?.stop();

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;

    document.body.classList.remove("mobile-gate-locked");
    html.style.overflow = previousHtmlOverflow;
    window.__bmcLenis?.start();
  };
}

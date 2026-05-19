const preloaded = new Set<string>();

/** Warm HTTP cache for a single mobile scroll video — call once per src. */
export function preloadMobileVideo(src: string): void {
  if (typeof window === "undefined" || preloaded.has(src)) return;
  preloaded.add(src);

  const href = new URL(src, window.location.href).href;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = href;
  document.head.appendChild(link);

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.src = href;
  video.load();
}

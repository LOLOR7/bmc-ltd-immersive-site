/**
 * Home mobile — scroll-controlled 9:16 sources.
 * - light:      900×1600 / 30fps / CRF 25 (≈ 2.8–4.7 Mbps).
 * - ultralight: 800×1422 / 30fps / CRF 27 (≈ 1.9–2.8 Mbps), targeted at
 *   the two heaviest projects to cut weak-network load time. Rollback =
 *   restore the `-light` paths for `adma527` / `adma514`.
 */
export const HOME_VIDEO_SCROLL = {
  admaCliff: "/videos/adma-cliff-mobile-scroll-light.mp4",
  bekish: "/videos/bekish-mobile-scroll-light.mp4",
  adma527: "/videos/adma-527-mobile-scroll-ultralight.mp4",
  adma514: "/videos/adma-514-mobile-scroll-ultralight.mp4",
  dusk: "/videos/dusk-mobile-scroll-light.mp4",
} as const;

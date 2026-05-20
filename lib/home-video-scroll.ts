/**
 * Home mobile — scroll-controlled 9:16 sources.
 * - light:      900×1600 / 30fps / CRF 25 (≈ 2.8–4.7 Mbps).
 * - ultralight: 800×1422 / 30fps / CRF 27 (≈ 1.9–2.8 Mbps).
 * - superlight: 720×1280 / 30fps / CRF 28 (≈ 1.9 Mbps), Adma 527 only —
 *   the heaviest project, still felt slow on weak connections after the
 *   ultralight pass. Rollback for adma527 = restore the ultralight path.
 */
export const HOME_VIDEO_SCROLL = {
  admaCliff: "/videos/adma-cliff-mobile-scroll-light.mp4",
  bekish: "/videos/bekish-mobile-scroll-light.mp4",
  adma527: "/videos/adma-527-mobile-scroll-superlight.mp4",
  adma514: "/videos/adma-514-mobile-scroll-ultralight.mp4",
  dusk: "/videos/dusk-mobile-scroll-light.mp4",
} as const;

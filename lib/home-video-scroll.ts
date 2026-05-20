/**
 * Home mobile — scroll-controlled 9:16 sources.
 * - light:           900×1600 / 30fps / CRF 25 (≈ 2.8–4.7 Mbps).
 * - ultralight:      800×1422 / 30fps / CRF 27 (≈ 1.9–2.8 Mbps).
 * - superlight:      720×1280 / 30fps / CRF 28 / GOP 10 (≈ 1.9 Mbps).
 * - superlight-gop5: 720×1280 / 30fps / CRF 28 / GOP 5 + maxrate 2200k VBV
 *   cap (≈ 2.0 Mbps avg). Adma 527 only — pool-terrace scene at t=14–17s had
 *   a localized bitrate spike in the plain superlight file; shorter GOP +
 *   VBV cap flattens bytes-per-seek peak (~165 KB → ~63 KB). +5% file size.
 *   Rollback for adma527 = restore `adma-527-mobile-scroll-superlight.mp4`.
 * - dusk v2:         pre-cut mobile export from edited master (ends on the
 *   clean final perspective, no distorted zoom-out). Light v2 (900×1600 /
 *   CRF 25) — ultralight v2 was too soft for smooth scrub even on good
 *   connections. Rollback for dusk = `dusk-mobile-scroll-ultralight-v2.mp4`
 *   or original `dusk-mobile-scroll-light.mp4`.
 */
export const HOME_VIDEO_SCROLL = {
  admaCliff: "/videos/adma-cliff-mobile-scroll-light.mp4",
  bekish: "/videos/bekish-mobile-scroll-light.mp4",
  adma527: "/videos/adma-527-mobile-scroll-superlight-gop5.mp4",
  adma514: "/videos/adma-514-mobile-scroll-ultralight.mp4",
  dusk: "/videos/dusk-mobile-scroll-light-v2.mp4",
} as const;

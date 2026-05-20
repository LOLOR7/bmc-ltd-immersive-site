/**
 * Home mobile — scroll-controlled 9:16 sources.
 * - light:           900×1600 / 30fps / CRF 25 (≈ 2.8–4.7 Mbps).
 * - ultralight:      800×1422 / 30fps / CRF 27 (≈ 1.9–2.8 Mbps).
 * - superlight:      720×1280 / 30fps / CRF 28 / GOP 10 (≈ 1.9 Mbps).
 * - superlight-gop5: 720×1280 / 30fps / CRF 28 / GOP 5 + maxrate 2200k VBV
 *   cap (≈ 2.0 Mbps avg, 3.0 Mbps peak). Adma 527 only — the pool-terrace
 *   scene at t=14–17s was a localized bitrate spike (~4.0 Mbps in the
 *   superlight CRF28/GOP10 version) that translated to a brief scrub
 *   stutter on Safari mobile: shorter GOP halves the post-seek decode
 *   chain, and the maxrate VBV cap flattens the spike to ~3.0 Mbps so
 *   buffer never empties at the peak. Bytes-per-seek peak in the pool
 *   region drops from ~165 KB to ~63 KB. File size +5% (6.16 → 6.45 MiB).
 *   Rollback for adma527 = restore the superlight path (no other change
 *   needed, the file ships alongside).
 */
export const HOME_VIDEO_SCROLL = {
  admaCliff: "/videos/adma-cliff-mobile-scroll-light.mp4",
  bekish: "/videos/bekish-mobile-scroll-light.mp4",
  adma527: "/videos/adma-527-mobile-scroll-superlight-gop5.mp4",
  adma514: "/videos/adma-514-mobile-scroll-ultralight.mp4",
  dusk: "/videos/dusk-mobile-scroll-light.mp4",
} as const;

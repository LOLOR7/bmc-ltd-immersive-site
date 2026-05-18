import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Local dev only (when running `next dev --webpack`).
 *
 * Excludes heavy static folders from the file-system watcher.
 * Files are still served by Next.js — only the watcher ignores them.
 *
 * Production (`next build` / `next start`) uses Turbopack by default
 * and ignores this `webpack` block entirely.
 */
const DEV_WATCH_IGNORED: string[] = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.next/**",
  "**/public/frames/**",
  "**/public/frames-mobile/**",
  "**/public/videos/**",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Explicit turbopack config so Next 16 accepts coexistence with `webpack`.
  // `root` also silences the nested-lockfile workspace warning.
  turbopack: {
    root: projectRoot,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: DEV_WATCH_IGNORED,
        aggregateTimeout: 200,
        poll: false,
      };
    }
    return config;
  },
};

export default nextConfig;

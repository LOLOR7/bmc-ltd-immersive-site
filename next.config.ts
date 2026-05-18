import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Heavy frame folders are still served as static files in dev,
 * but excluded from the FS watcher when running `next dev --webpack`.
 * Avoids saturating macOS FSEvents on 7k+ JPGs in public/frames.
 *
 * Production (`next build`) uses Turbopack by default and ignores this block.
 *
 * Note: webpack's schema accepts `string | RegExp | Array<string>` for
 * `ignored`. Mixed arrays (e.g. RegExp + string) are rejected. We replace
 * the default (which is a RegExp) with an explicit array of non-empty
 * glob strings.
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
  output: "standalone",
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

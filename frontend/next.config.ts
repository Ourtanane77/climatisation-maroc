import type { NextConfig } from "next";

// Local production checks (Lighthouse) run `next build && next start` beside the Docker dev server,
// which owns `.next`: NEXT_DIST_DIR gives them their own build folder, and LOCAL_PROXY_ORIGIN
// (e.g. http://localhost:8080) forwards what nginx normally serves (storage files, the API).
const proxyOrigin = process.env.LOCAL_PROXY_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Self-contained server for the production Docker image (docker/next/Dockerfile).
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // The front office lives behind nginx, which also serves Laravel's /storage files.
  images: {
    // Catalogue images are pre-sized by Laravel (WebP renditions); next/image is not used for them.
    unoptimized: true,
  },
  // Design photos are requested with ?v=<mtime> (src/lib/design-assets.ts): a replaced photo gets a
  // new URL, so they can be cached for a year. /brand keeps the default (the logo URL has no version).
  async headers() {
    return [{ source: "/design/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  // Docker dev (webpack + polling, see docker-compose.yml): poll every 1.5 s and skip folders that
  // are not source code, otherwise the watcher keeps the CPU busy and every page renders slowly.
  webpack(config, { dev }) {
    if (dev && process.env.WATCHPACK_POLLING) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1500,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.next*/**", "**/test-results/**", "**/playwright-report/**", "**/public/design/**", "**/.git/**"],
      };
    }
    return config;
  },
  // `next build` uses Turbopack, which refuses to build next to a webpack hook unless this key exists.
  turbopack: {},
  ...(proxyOrigin && {
    async rewrites() {
      return [
        { source: "/storage/:path*", destination: `${proxyOrigin}/storage/:path*` },
        { source: "/api/v1/:path*", destination: `${proxyOrigin}/api/v1/:path*` },
      ];
    },
  }),
};

export default nextConfig;

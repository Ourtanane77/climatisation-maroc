import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the production Docker image (docker/next/Dockerfile).
  output: "standalone",
  poweredByHeader: false,
  // The front office lives behind nginx, which also serves Laravel's /storage files.
  images: {
    // Catalogue images are pre-sized by Laravel (WebP renditions); next/image is not used for them.
    unoptimized: true,
  },
};

export default nextConfig;

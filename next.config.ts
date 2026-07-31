import type { NextConfig } from "next";

// GitHub Pages project sites serve assets beneath the repository slug.
const basePath = process.env.PAGES_BASE_PATH ?? "";
// Dev-browser tests can isolate generated artifacts without changing the production default.
const distDir = process.env.NEXT_DIST_DIR?.trim() || ".next";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  distDir,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_PAGES_BASE_PATH: basePath,
  },
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;

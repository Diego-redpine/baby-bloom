import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/baby-bloom",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/baby-bloom",
  images: { unoptimized: true },
};

export default nextConfig;

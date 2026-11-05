import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  images: {
    minimumCacheTTL: 2678400, // 31 days
    // Camera stills are rendered with plain img tags straight from UDOT
    // Traffic's service, so no remote next/image patterns are needed.
    remotePatterns: [],
  },
};

export default nextConfig;

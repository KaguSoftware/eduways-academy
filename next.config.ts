import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Lets phones/tablets on the LAN load dev chunks (/_next/*) when testing against
  // `next dev` over the network. Dev-only setting; ignored in production builds.
  allowedDevOrigins: ["192.168.1.*", "10.*", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default withNextIntl(nextConfig);

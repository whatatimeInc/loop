import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/mentores",
        destination: "/explorar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev server is reached as localhost, 127.0.0.1 and over the LAN during demos;
  // without this Next 16 blocks HMR/hydration assets for non-matching origins.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.68.105"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "*.supabase.co" },
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

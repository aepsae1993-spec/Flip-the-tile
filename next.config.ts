import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qehllyhzzjyzvrxhmkrt.supabase.co",
        pathname: "/storage/v1/object/public/logo/**",
      },
    ],
  },
};

export default nextConfig;

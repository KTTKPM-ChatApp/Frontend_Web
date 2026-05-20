import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.59"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zalo-site.zadn.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stc-zaloprofile.zdn.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stc-zlogin.zdn.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "chat.zalo.me",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['@emotion/react', '@emotion/styled', '@emotion/cache'],
  },

  // ===== Proxy API để né CORS =====
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4321/api/:path*",
      },
    ];
  },
};

export default nextConfig;
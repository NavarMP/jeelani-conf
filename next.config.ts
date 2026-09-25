import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev for easier debugging, or change to false to test
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withSerwist(withNextIntl(nextConfig));

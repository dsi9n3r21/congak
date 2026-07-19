const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Cache lesson/practice content aggressively for low-bandwidth + offline use.
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(lessons|topics|question_templates).*/,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "congak-content-cache", expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 } },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
      handler: "CacheFirst",
      options: { cacheName: "congak-image-cache", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
};

module.exports = withPWA(nextConfig);

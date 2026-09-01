const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Cache lesson/practice content aggressively for low-bandwidth + offline use.
  runtimeCaching: [
    // Page navigations (every route in the app — /quests/world/[category]
    // in particular). MUST try the network first: this app tracks
    // per-student progress that changes every play, and the custom
    // `runtimeCaching` array above replaces next-pwa's built-in default
    // rules entirely rather than merging with them — which means
    // whatever sensible default navigation-caching behavior next-pwa
    // normally ships with was silently gone, with no explicit rule
    // covering plain page loads at all. Root cause of a reported bug:
    // closing and reopening the installed PWA showed OLD progress (e.g.
    // "Level 1" after actually clearing level 8) even though the
    // database had the correct, current data the whole time — confirmed
    // via a direct Supabase query showing the real saved progress was
    // right, so the DB/save path was never the problem, only what the
    // service worker served on reopen. NetworkFirst still falls back to
    // the cache if there's genuinely no connection, so offline use isn't
    // lost, but a live connection now always wins.
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: { cacheName: "congak-pages-cache", networkTimeoutSeconds: 5, expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } },
    },
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

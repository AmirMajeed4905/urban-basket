const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
  {
    urlPattern: /^https?:\/\/res\.cloudinary\.com\/.*\.(png|jpg|jpeg|webp|svg)$/,
    handler: "CacheFirst",
    options: {
      cacheName: "cloudinary-images",
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  {
    urlPattern: /^\/.*\.(png|jpg|jpeg|webp|svg|ico)$/,
    handler: "CacheFirst",
    options: {
      cacheName: "local-images",
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
],
});
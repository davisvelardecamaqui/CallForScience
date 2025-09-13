const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },     // evita que ESLint bloquee el build
  // typescript: { ignoreBuildErrors: true } // usa esto SOLO si sale algún error TS raro
});

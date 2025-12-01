/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "www.bing.com",
      },
    ],
  },
  cacheComponents: true,

};

module.exports = nextConfig;

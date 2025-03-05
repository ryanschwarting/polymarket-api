/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "polymarket-upload.s3.us-east-2.amazonaws.com",
      "polymarket-static.s3.us-east-2.amazonaws.com",
    ],
  },
};

export default nextConfig;

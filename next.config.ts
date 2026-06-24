import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BACKEND_API_URL: 'https://indexing-checker-khan-it.onrender.com/api',
  },
};

export default nextConfig;

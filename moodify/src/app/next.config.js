/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensures env variables are available to the server
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
    },
    // Alternative for newer Next.js versions:
    serverRuntimeConfig: {
      MONGODB_URI: process.env.MONGODB_URI,
    },
    publicRuntimeConfig: {
      MONGODB_URI: process.env.MONGODB_URI, 
    },
  };
  
  module.exports = nextConfig;
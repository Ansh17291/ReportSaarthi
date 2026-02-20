/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add a rule to handle the canvas module
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    return config;
  },
};

module.exports = nextConfig; 
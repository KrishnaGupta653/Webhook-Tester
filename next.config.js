// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     // appDir: true,
//   },
// }

// module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the built-in server since we're using a custom server
  output: 'standalone',
  
  // Enable experimental features if needed
  experimental: {
    // appDir: true, // This is now default in Next.js 14
  },

  // Custom webpack config for better Socket.io compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Custom server detection
  env: {
    CUSTOM_SERVER: 'true',
  },

  // Headers for better CORS support
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const config = {
  // Optimize build performance
  swcMinify: true,
  experimental: {
    // Enable SWC minification for faster builds
    swcMinify: true,
  },
  webpack(config, { dev, isServer }) {
    // Add rule to handle importing SVG files as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],  // Allows importing SVGs as React components
    });

    // Optimize webpack performance
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

export default config;
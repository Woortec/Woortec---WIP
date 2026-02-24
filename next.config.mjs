/** @type {import('next').NextConfig} */
const config = {
  // SWC minification
  swcMinify: true,

  experimental: {
    // Tree-shake large icon/UI packages — avoids compiling thousands of unused modules
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@phosphor-icons/react',
      'recharts',
      'chart.js',
      'react-chartjs-2',
    ],
  },

  webpack(config, { dev, isServer }) {
    // ── SVG support ──────────────────────────────────────────────────────
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // ── Production chunk splitting ─────────────────────────────────────────
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[/\\]node_modules[/\\]/,
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
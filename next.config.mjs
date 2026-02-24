/** @type {import('next').NextConfig} */
const config = {
  swcMinify: true,

  // ── Skip type-checking and linting at build time ─────────────────────────
  // These are expensive on Vercel's 2-core machines. Run them separately in CI
  // (e.g. via `npm run typecheck` and `npm run lint` as separate pipeline steps).
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Externalise heavy server-only packages ────────────────────────────────
  // These packages are ONLY used in API routes (Node.js runtime).
  // Telling Next.js to treat them as externals means webpack skips bundling
  // them — they're resolved at runtime from node_modules instead.
  // This cuts webpack compilation time significantly.
  experimental: {
    serverComponentsExternalPackages: [
      'googleapis',
      'google-auth-library',
      'facebook-nodejs-business-sdk',
      'klaviyo-api',
      'stripe',
      'node-cron',
      'formidable',
      'multer',
      'micro',
      'next-connect',
      'jspdf',
      'html2canvas',
      'sharp',
    ],
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
    // ── SVG support ──────────────────────────────────────────────────────────
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // ── Production chunk splitting ───────────────────────────────────────────
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
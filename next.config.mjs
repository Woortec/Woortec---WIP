import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const config = {
    webpack(config) {
      // Add rule to handle importing SVG files as React components
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],  // Allows importing SVGs as React components
      });
  
      return config;
    },
  };

const sentryOptions = {
  org: "woortec",
  project: "javascript-nextjs",
  silent: process.env.NODE_ENV !== 'production', // Only log in production
  widenClientFileUpload: false, // Much faster builds
  disableLogger: true,
  automaticVercelMonitors: true,
  // tunnelRoute: "/monitoring", // Only if you need it
};

export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(config, sentryOptions)
  : config;
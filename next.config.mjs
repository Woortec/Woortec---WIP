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

export default config;
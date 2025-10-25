export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  output: 'standalone',
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
};

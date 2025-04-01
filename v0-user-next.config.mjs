/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['huggingface.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.hf.space',
      },
    ],
    // Add image optimization settings
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Add compression
  compress: true,
  // Add webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Only run in production builds
    if (!dev) {
      // Optimize CSS
      config.optimization.minimize = true;
      
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            chunks: 'all',
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            chunks: 'all',
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
          monaco: {
            test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
            priority: 50,
            chunks: 'all',
            name: 'monaco-editor',
          },
        },
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Add caching headers
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Special caching for static assets
      {
        source: '/(.*).(jpg|jpeg|png|svg|webp|avif|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;


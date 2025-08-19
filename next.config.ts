import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        '@opentelemetry/exporter-jaeger': false,
        '@genkit-ai/firebase': false,
        'firebase-admin': false,
        'long': false,
      };
    }

    config.module.rules.push({
      test: /node_modules\/handlebars\/lib\/index\.js$/,
      loader: 'string-replace-loader',
      options: {
        search: 'require.extensions',
        replace: '(() => {})',
      }
    });

    return config;
  },
};

export default nextConfig;

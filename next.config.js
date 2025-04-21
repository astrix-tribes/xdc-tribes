const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    domains: [
      'cdn.pixabay.com',
      'images.unsplash.com',
      'i.imgur.com',
      'picsum.photos',
      'via.placeholder.com',
      'cloudfront.net',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add React 18 configuration to fix findDOMNode error
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      zlib: false,
      path: false,
      buffer: false,
    };
    
    // Add polyfills for client-side only
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    
    // Exclude WalletConnect and Web3Auth from SSR
    if (isServer) {
      config.externals = [...config.externals, 
        '@walletconnect/sign-client',
        '@web3auth/base',
        '@web3auth/modal',
        '@web3auth/openlogin-adapter'
      ];
    }
    
    return config;
  }
};

module.exports = nextConfig; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'recharts',
      'motion',
      '@supabase/supabase-js',
      'browser-image-compression',
    ],
  },
  headers: async () => [
    {
      source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|ttf)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.resolve(__dirname, 'src/lib/router-compat.tsx'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'react-router-dom': './src/lib/router-compat.tsx',
    },
  },
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || 'public_8ulBaGE6HasMRTYenvVihqllUm8=',
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || 'private_DBHLVLfKVktC1UhaxnMNjJ++5sc=',
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/crv2lglsp',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'divloq4oz',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '999667235587213',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'hKQ5Q6x6bdJOflp14Nk_S-MGrkw',
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // strict mode causes double renders in dev — disable for speed
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'react-hot-toast',
      'recharts',
      'firebase',
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig

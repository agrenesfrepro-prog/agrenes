/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
    allowedDevOrigins: ['127.0.0.1', '192.168.1.123'],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ierviwtmdqerdmwtnimn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ierviwtmdqerdmwtnimn.supabase.co',
        pathname: '/storage/v1/render/image/public/**',
      },
    ],
  },
  env: {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    REACT_APP_STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
    REACT_APP_SITE_URL: process.env.REACT_APP_SITE_URL,
  },
}

module.exports = nextConfig

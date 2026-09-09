export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/account',
          '/checkout',
          '/orders',
          '/wishlist',
          '/vendor',
          '/login',
          '/reset-password',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://agrenesmarket.com/sitemap.xml',
    host: 'https://agrenesmarket.com',
  }
}
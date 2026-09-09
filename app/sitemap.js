import { createClient } from '../src/lib/supabase-ssr/server'

const BASE_URL = 'https://agrenesmarket.com'

// Regenerate every 6 hours — new products get crawlable that fast
export const revalidate = 21600

export default async function sitemap() {
  const supabase = await createClient()

  // Static high-priority pages
  const staticUrls = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE_URL}/shop`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${BASE_URL}/vendors`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/contact`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/bulk`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/bundles`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/returns`, priority: 0.3, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  // All active categories as filter URLs
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)

  const categoryUrls = (categories || []).map(cat => ({
    url: `${BASE_URL}/shop?cat=${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  // All active products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)

  const productUrls = (products || []).map(p => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: 0.7,
    changeFrequency: 'weekly',
  }))

  // All active bundles
  const { data: bundles } = await supabase
    .from('bundles')
    .select('slug, updated_at')
    .eq('is_active', true)

  const bundleUrls = (bundles || []).map(b => ({
    url: `${BASE_URL}/bundles/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    priority: 0.7,
    changeFrequency: 'weekly',
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls, ...bundleUrls]
}
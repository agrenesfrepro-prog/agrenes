import { createClient } from '../../src/lib/supabase-ssr/server'
import ShopPage from '../../src/screens/ShopPage'

export const revalidate = 3600

export const metadata = {
  title: 'Shop Fresh Ugandan Produce - AGRENES',
  description: 'Browse fresh Ugandan fruits, vegetables, herbs and staples. Air-freighted weekly, delivered UK-wide. GAP & UNBS certified.',
  openGraph: {
    title: 'Shop Fresh Ugandan Produce - AGRENES',
    description: 'Browse fresh Ugandan fruits, vegetables, herbs and staples. Air-freighted weekly, delivered UK-wide.',
    images: ['/og-image.png'],
  },
}

export default async function ShopRoute({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  // Base query: all active products, joined with category, vendor, variants for pricing
  let query = supabase
    .from('products')
    .select('*, categories(name,slug), vendors(name), product_variants(price,is_active)')
    .eq('is_active', true)

  // Apply URL filters
  if (params.cat) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.cat)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (params.flash) query = query.eq('is_flash_deal', true)
  if (params.bulk) query = query.eq('bulk_available', true)
  if (params.featured) query = query.eq('is_featured', true)
  if (params.q) query = query.ilike('name', `%${params.q}%`)

  // Sort
  const sort = params.sort || 'sales_count.desc'
  const [sortCol, sortDir] = sort.split('.')
  query = query.order(sortCol, { ascending: sortDir === 'asc' })

  // Limit for first paint
  query = query.limit(48)

  const { data: products } = await query

  return <ShopPage initialProducts={products || []} />
}
import { createClient } from '../src/lib/supabase-ssr/server'
import HomePage from '../src/screens/HomePage'

// This is a Server Component. It runs on Vercel's servers.
// Fetches Home data server-side, passes to HomePage as props.
// Result: real HTML with real product data reaches every scraper (Google, Predis, Facebook).

// Rebuild every hour so product changes propagate without redeploy.
export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  // Fetch all Home data in parallel
  const [bundlesRes, flashDealsRes, featuredRes, topRatedRes] = await Promise.all([
    supabase
      .from('bundles')
      .select('id,slug,name,tagline,price,compare_price,hero_emoji,hero_image')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order')
      .limit(6),
    supabase
      .from('products')
      .select('*')
      .eq('is_flash_deal', true)
      .eq('is_active', true)
      .limit(8),
    supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(6),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(8),
  ])

  const initialData = {
    bundles: bundlesRes.data || [],
    flashDeals: flashDealsRes.data || [],
    featured: featuredRes.data || [],
    topRated: topRatedRes.data || [],
  }

  return <HomePage initialData={initialData} />
}
import { createClient } from '../src/lib/supabase-ssr/server'
import HomePage from '../src/screens/HomePage'

// Rebuild every hour so product changes propagate without redeploy.
export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

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

  // Organization schema - tells Google about AGRENES the business
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AGRENES',
    legalName: 'Agriculture Environment & Ecosystems Ltd',
    url: 'https://agrenesmarket.com',
    logo: 'https://agrenesmarket.com/logo.png',
    description: 'Fresh Ugandan produce air-freighted to the UK. GAP & UNBS certified fruits, vegetables and staples.',
    email: 'support@agrenes.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ndeeba Kabowa',
      addressLocality: 'Kampala',
      addressCountry: 'UG',
    },
       sameAs: [
      'https://www.facebook.com/agrenesltd',
      'https://www.instagram.com/agrenesmarket',
      'https://x.com/agrenesmarket',
      'https://www.linkedin.com/in/agricultural-environment-and-ecosystem-a32053402',
      'https://www.youtube.com/@Agrenesmarket',
      'https://www.tiktok.com/@agrenesmarket',
    ],
  }

  // WebSite schema with SearchAction - lets Google show a search box in search results
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AGRENES',
    url: 'https://agrenesmarket.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://agrenesmarket.com/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <HomePage initialData={initialData} />
    </>
  )
}
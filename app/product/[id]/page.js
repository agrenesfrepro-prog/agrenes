import { createClient } from '../../../src/lib/supabase-ssr/server'
import ProductPage from '../../../src/screens/ProductPage'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, price')
    .eq('id', id)
    .single()

  if (!product) return { title: 'Product not found - AGRENES' }

  return {
    title: product.name + ' - AGRENES',
    description: (product.description || '').slice(0, 160) || 'Buy ' + product.name + ' online from AGRENES.',
    openGraph: {
      title: product.name + ' - AGRENES',
      description: (product.description || '').slice(0, 160),
      images: product.images && product.images[0] ? [product.images[0]] : ['/og-image.png'],
    },
  }
}

export default async function ProductRoute({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const [productRes, reviewsRes, variantsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(name,slug), vendors(name,is_verified)')
      .eq('id', id)
      .single(),
    supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  if (!productRes.data) {
    notFound()
  }

  let related = []
  if (productRes.data.category_id) {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name), vendors(name), product_variants(price,is_active)')
      .eq('category_id', productRes.data.category_id)
      .eq('is_active', true)
      .neq('id', id)
      .limit(6)
    related = data || []
  }

  const product = productRes.data

  // Build JSON-LD Product schema for rich Google search results
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || 'Fresh Ugandan produce from AGRENES',
    image: product.images && product.images.length > 0 ? product.images : ['/og-image.png'],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'AGRENES',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://agrenesmarket.com/product/' + product.id,
      priceCurrency: 'GBP',
      price: product.price,
      availability: product.stock_qty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'AGRENES',
      },
    },
    ...(product.rating > 0 && product.review_count > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count,
      },
    } : {}),
  }

  const initialData = {
    product,
    reviews: reviewsRes.data || [],
    variants: variantsRes.data || [],
    related,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPage initialData={initialData} />
    </>
  )
}
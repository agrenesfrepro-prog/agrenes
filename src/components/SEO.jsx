import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://agrenesmarket.com'
const DEFAULT_IMAGE = SITE_URL + '/og-image.jpg'
const DEFAULT_TAGLINE = 'Fresh Ugandan produce, air-freighted weekly to your door across the UK. GAP & UNBS certified fruits, vegetables, and staples.'
const DEFAULT_KEYWORDS = 'ugandan food UK, matoke UK, african food delivery UK, ugandan groceries UK, african produce UK, matoke delivery, ugandan food shop, buy matoke online, kalo flour, bushera, groundnut paste, african grocery online UK'

// Universal SEO component — drop into any page
export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  price,
  currency = 'GBP',
  availability = 'in stock',
  productBrand,
}) {
  const fullTitle = title
    ? `${title} · AGRENES`
    : 'AGRENES · Fresh Ugandan Produce Delivered UK-Wide 🇺🇬✈️🇬🇧'
  const desc = description || DEFAULT_TAGLINE
  const img = image || DEFAULT_IMAGE
  const canonicalUrl = url ? SITE_URL + url : SITE_URL
  const kw = keywords || DEFAULT_KEYWORDS

  const jsonLd = type === 'product' && price ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: desc,
    image: [img],
    brand: { '@type': 'Brand', name: productBrand || 'AGRENES' },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: currency,
      price: String(price),
      availability: availability === 'in stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'AGRENES' },
    },
  } : {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AGRENES',
    url: SITE_URL,
    logo: SITE_URL + '/logo.png',
    description: DEFAULT_TAGLINE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kampala',
      addressCountry: 'Uganda',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-7950-554456',
      contactType: 'customer service',
      areaServed: ['GB', 'US', 'CA', 'DE', 'FR', 'NL'],
    },
    sameAs: ['https://agrenesmarket.com'],
  }

  return (
    <Helmet>
      {/* Standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={kw} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="AGRENES" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Product-specific OG (for individual product pages) */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={String(price)} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
        </>
      )}

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}

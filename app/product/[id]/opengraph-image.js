import { ImageResponse } from 'next/og'
import { createClient } from '../../../src/lib/supabase-ssr/server'

export const runtime = 'nodejs'
export const revalidate = 3600
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'AGRENES Product'

export default async function OGImage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, price, images, description')
    .eq('id', id)
    .single()

  const productName = product?.name || 'AGRENES Fresh Produce'
  const price = product?.price ? '£' + Number(product.price).toFixed(2) : ''
  const image = product?.images?.[0] || null

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #063D32 0%, #0A5441 50%, #0F7A5E 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Left: product image or emoji placeholder */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          {image ? (
            <img
              src={image}
              alt=""
              width={480}
              height={480}
              style={{
                borderRadius: 24,
                objectFit: 'cover',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}
            />
          ) : (
            <div style={{ fontSize: 280, display: 'flex' }}>🥬</div>
          )}
        </div>

        {/* Right: text content */}
        <div
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 60px 60px 20px',
            color: '#fff',
          }}
        >
          {/* Top: AGRENES brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: 2,
                display: 'flex',
              }}
            >
              AGRENES
            </div>
          </div>

          {/* Middle: product name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: productName.length > 30 ? 52 : 64,
                fontWeight: 800,
                lineHeight: 1.1,
                display: 'flex',
              }}
            >
              {productName}
            </div>
            {price && (
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: '#F5A623',
                  display: 'flex',
                }}
              >
                {price}
              </div>
            )}
          </div>

          {/* Bottom: tagline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 22,
              opacity: 0.85,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>🇺🇬 Fresh from Uganda</div>
            <div style={{ display: 'flex' }}>✈️ Air-freighted UK-Wide</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
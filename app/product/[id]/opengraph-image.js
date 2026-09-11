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
    .select('name, price, images, description, unit, bulk_price, bulk_min_qty, weight_kg, stock_qty')
    .eq('id', id)
    .single()

  const productName = product?.name || 'AGRENES Fresh Produce'
  const price = product?.price ? '£' + Number(product.price).toFixed(2) : ''
  const unit = product?.unit || 'unit'
  const bulkPrice = product?.bulk_price ? '£' + Number(product.bulk_price).toFixed(2) : null
  const bulkMinQty = product?.bulk_min_qty || null
  const image = product?.images?.[0] || null
  const desc = product?.description ? (product.description.length > 110 ? product.description.slice(0, 110).trim() + '…' : product.description) : ''
  const inStock = product?.stock_qty > 0

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #063D32 0%, #0A5441 60%, #0F7A5E 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Left: product image (40%) */}
        <div
          style={{
            width: '42%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 36,
          }}
        >
          {image ? (
            <img
              src={image}
              alt=""
              width={420}
              height={420}
              style={{
                borderRadius: 20,
                objectFit: 'cover',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              }}
            />
          ) : (
            <div style={{ fontSize: 260, display: 'flex' }}>🥬</div>
          )}
        </div>

        {/* Right: text content (58%) */}
        <div
          style={{
            width: '58%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '44px 60px 40px 20px',
            color: '#fff',
          }}
        >
          {/* Top brand + stock */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 2,
                display: 'flex',
              }}
            >
              AGRENES
            </div>
            {inStock && (
              <div style={{
                background: '#19A87C',
                padding: '6px 16px',
                borderRadius: 100,
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
              }}>
                IN STOCK
              </div>
            )}
          </div>

          {/* Middle: name, price, bulk, description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontSize: productName.length > 30 ? 46 : 56,
                fontWeight: 800,
                lineHeight: 1.05,
                display: 'flex',
              }}
            >
              {productName}
            </div>

            {/* Retail price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 800,
                  color: '#F5A623',
                  display: 'flex',
                }}
              >
                {price}
              </div>
              <div style={{ fontSize: 22, opacity: 0.8, display: 'flex' }}>per {unit}</div>
            </div>

            {/* Bulk price if applicable */}
            {bulkPrice && bulkMinQty && (
              <div style={{
                background: 'rgba(245, 166, 35, 0.15)',
                border: '2px solid #F5A623',
                borderRadius: 12,
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                alignSelf: 'flex-start',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#F5A623', display: 'flex' }}>
                  💰 BULK: {bulkPrice}/{unit}
                </div>
                <div style={{ fontSize: 18, opacity: 0.8, display: 'flex' }}>
                  from {bulkMinQty} {unit}s
                </div>
              </div>
            )}

            {/* Description */}
            {desc && (
              <div style={{
                fontSize: 20,
                opacity: 0.85,
                lineHeight: 1.35,
                display: 'flex',
                marginTop: 4,
              }}>
                {desc}
              </div>
            )}
          </div>

          {/* Bottom taglines */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 20,
              opacity: 0.9,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>🇺🇬 Fresh from Uganda · ✈️ Air-freighted UK-Wide</div>
            <div style={{ display: 'flex', color: '#F5A623', fontWeight: 700 }}>🚚 Free delivery over £75</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
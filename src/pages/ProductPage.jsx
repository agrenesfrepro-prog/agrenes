import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, ShieldCheck, Truck, Star, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore, useWishlistStore } from '../lib/store'
import { img } from '../lib/img'
import ProductCard from '../components/product/ProductCard'
import WriteReview from '../components/product/WriteReview'
import toast from 'react-hot-toast'

// Cultural notes for Ugandan produce
const CULTURAL_NOTES = {
  "matoke": "Matoke (green cooking banana) is Uganda's national dish. Steamed in banana leaves and mashed, it's served at virtually every Ugandan family table.",
  "plantain": "Plantain (gonja) is a Ugandan staple - sliced and deep-fried into golden chips, roasted whole over charcoal, or boiled as a starchy side dish.",
  "cassava": "Cassava is a lifeline crop across Uganda, eaten boiled, fried, or ground into flour for flatbreads and porridge.",
  "avocado": "Uganda is one of Africa's top avocado producers. Ugandan Hass avocados are prized for their rich, buttery flavour and creamy texture.",
  "ginger": "Ugandan ginger is among the world's most aromatic, grown in fertile soils at altitude. It's a key ingredient in East African teas, curries and wellness drinks.",
  "passion": "Uganda produces some of the world's finest passion fruit. The fragrant golden pulp is a favourite in fresh juices across East Africa.",
  "sweet potato": "The orange-fleshed sweet potato was introduced to Uganda and has become a vital crop, providing nutrition for millions of families.",
  "sour sop": "Soursop (kitafeeri) is valued across Uganda for its uniquely sweet-tart flavour and its use in traditional herbal medicine.",
}

function getCulturalNote(productName) {
  if (!productName) return null
  const name = productName.toLowerCase()
  for (const [key, note] of Object.entries(CULTURAL_NOTES)) {
    if (name.includes(key)) return note
  }
  return null
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, openCart } = useCartStore()
  const wishlist = useWishlistStore()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [related, setRelated] = useState([])
  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [isBulk, setIsBulk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    setLoading(true)
    setImgIndex(0)
    setQty(1)
    Promise.all([
      supabase.from('products').select('*, categories(name,slug), vendors(name,is_verified)').eq('id', id).single(),
      supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', id).order('created_at', { ascending: false }).limit(10),
      supabase.from('product_variants').select('*').eq('product_id', id).eq('is_active', true).order('sort_order'),
    ]).then(([{ data: p }, { data: r }, { data: v }]) => {
      setProduct(p)
      setReviews(r || [])
      setVariants(v || [])
      if (v?.length) setSelectedVariant(v[0])
      if (p?.category_id) {
        supabase.from('products')
          .select('*, vendors(name), product_variants(price,is_active)')
          .eq('category_id', p.category_id).eq('is_active', true).neq('id', id).limit(6)
          .then(({ data }) => setRelated(data || []))
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ padding: 16 }}>
      <div className="card skel" style={{ height: 320, marginBottom: 12 }} />
      <div className="card skel" style={{ height: 160 }} />
    </div>
  )

  if (!product) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>🥬</div>
      <h2 style={{ marginBottom: 8 }}>Product not found</h2>
      <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: 8 }}>Browse Shop</button>
    </div>
  )

  const price = selectedVariant ? Number(selectedVariant.price) : (isBulk && product.bulk_price ? Number(product.bulk_price) : Number(product.price))
  const compare = Number(product.compare_price) || 0
  const savingsPct = compare && compare > price ? Math.round((1 - price / compare) * 100) : 0
  const images = product.images?.length ? product.images : []
  const heroSrc = images[imgIndex] ? img(images[imgIndex], 900)?.replace('resize=cover', 'resize=contain') : null

  const handleAddToCart = () => {
    const cartItem = selectedVariant
      ? { ...product, id: product.id + '-' + selectedVariant.id, price, name: product.name + ' (' + selectedVariant.label + ')', variant_id: selectedVariant.id }
      : { ...product, price }
    addItem(cartItem, qty)
    toast.success(`${product.name} added to cart`)
  }
  const handleBuyNow = () => { handleAddToCart(); openCart?.() }

  const inWishlist = wishlist.has(product.id)

  return (
    <div className="page-enter" style={{ paddingBottom: 96 }}>
      {/* Top bar */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--wh)', border: '1px solid var(--br)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, fontSize: 12, color: 'var(--mu)' }}>
          {product.categories?.name}
        </div>
        <button onClick={() => wishlist.toggle(product)} style={{ background: 'var(--wh)', border: '1px solid var(--br)', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={20} fill={inWishlist ? 'var(--rd)' : 'none'} color={inWishlist ? 'var(--rd)' : 'var(--tx)'} />
        </button>
      </div>

      {/* MAIN LAYOUT — image + info side-by-side on desktop, stacked on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 14px'
      }}>

        {/* Image column */}
        <div>
          <div style={{
            width: '100%',
            maxWidth: 500,
            aspectRatio: '1 / 1',
            margin: '0 auto',
            background: 'var(--wh)',
            border: '1px solid var(--br)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {heroSrc ? (
              <img src={heroSrc} alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            ) : (
              <div style={{ fontSize: 64, color: 'var(--lt)' }}><Package size={64} /></div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: '1px solid var(--br)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: '1px solid var(--br)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            {savingsPct > 0 && (
              <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--rd)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>−{savingsPct}%</span>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => setImgIndex(i)} style={{
                  width: 54, height: 54, borderRadius: 8,
                  border: '2px solid ' + (i === imgIndex ? 'var(--g2)' : 'var(--br)'),
                  background: 'var(--wh)', padding: 2, cursor: 'pointer', overflow: 'hidden'
                }}>
                  <img src={img(im, 200)?.replace('resize=cover','resize=contain')} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info column */}
        <div>
          <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 24, fontWeight: 700, color: 'var(--g1)', marginBottom: 4, lineHeight: 1.25 }}>{product.name}</h1>
          {product.vendors?.name && (
            <div style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 12 }}>
              by <span style={{ color: 'var(--g2)', fontWeight: 600 }}>{product.vendors.name}</span>
              {product.vendors.is_verified && <span style={{ marginLeft: 6, color: 'var(--g4)' }}>✓ Verified</span>}
            </div>
          )}

          {/* Size variants */}
          {variants.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)', marginBottom: 8 }}>Select Size</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {variants.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariant(v)} style={{
                    padding: '9px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                    background: selectedVariant?.id === v.id ? 'var(--g2)' : 'var(--wh)',
                    color: selectedVariant?.id === v.id ? '#fff' : 'var(--tx)',
                    border: '1.5px solid ' + (selectedVariant?.id === v.id ? 'var(--g2)' : 'var(--br)'),
                    cursor: 'pointer', transition: 'all .15s'
                  }}>
                    {v.label}
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, opacity: .8 }}>£{Number(v.price).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Fraunces,serif', fontSize: 32, fontWeight: 700, color: 'var(--g2)' }}>£{price.toFixed(2)}</span>
            {compare > price && <span style={{ fontSize: 15, color: 'var(--mu)', textDecoration: 'line-through' }}>£{compare.toFixed(2)}</span>}
            <span style={{ fontSize: 13, color: 'var(--mu)' }}>/ {product.unit}</span>
          </div>
          {product.stock_qty === 0 && <div style={{ color: 'var(--rd)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Out of stock</div>}
          {product.stock_qty > 0 && product.stock_qty <= 10 && <div style={{ color: 'var(--am)', fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>Only {product.stock_qty} left</div>}

          {/* Bulk toggle */}
          {product.bulk_price && !selectedVariant && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setIsBulk(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid ' + (isBulk ? 'var(--br)' : 'var(--g2)'), background: isBulk ? 'var(--wh)' : 'var(--gll)', color: isBulk ? 'var(--tx)' : 'var(--g2)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🛍️ Retail</button>
              <button onClick={() => setIsBulk(true)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid ' + (!isBulk ? 'var(--br)' : 'var(--g2)'), background: !isBulk ? 'var(--wh)' : 'var(--gll)', color: !isBulk ? 'var(--tx)' : 'var(--g2)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📦 Bulk (min {product.bulk_min_qty})</button>
            </div>
          )}

          {/* Qty selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mu)' }}>QTY</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--br)', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, background: 'var(--wh)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
              <div style={{ width: 44, textAlign: 'center', fontWeight: 700 }}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 40, background: 'var(--wh)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
            </div>
          </div>

          {/* Desktop action buttons (visible always; on mobile the sticky bar mirrors them) */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={handleAddToCart} disabled={product.stock_qty === 0} className="btn-outline" style={{ flex: 1, justifyContent: 'center', height: 48, fontSize: 14, fontWeight: 700 }}>
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock_qty === 0} className="btn-primary" style={{ flex: 1, justifyContent: 'center', height: 48, fontSize: 14, fontWeight: 700 }}>
              Buy Now
            </button>
          </div>

          {/* Quick assurance strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            <div style={{ padding: '10px 12px', background: 'var(--brl)', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={16} color="var(--g3)" /> Delivery 2–4 days
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--brl)', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="var(--g3)" /> Freshness guaranteed
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="card" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--mu)', marginBottom: 8 }}>About this product</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--tx)', whiteSpace: 'pre-wrap' }}>{product.description}</p>
            </div>
          )}

          {/* Cultural note */}
          {getCulturalNote(product?.name) && (
            <div className="card" style={{ padding: 18, marginBottom: 12, background: 'linear-gradient(135deg,var(--gll),var(--gl))', border: '1px solid var(--g5)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--g2)', marginBottom: 6 }}>🌍 Did You Know?</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--g1)', margin: 0 }}>{getCulturalNote(product?.name)}</p>
            </div>
          )}

          {/* Delivery countries */}
          <div className="card" style={{ padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--mu)', marginBottom: 12 }}>✈️ Delivery to Your Country</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { flag: '🇬🇧', country: 'United Kingdom', time: '2–4 working days', free: 'Free over £75' },
                { flag: '🇺🇸', country: 'United States', time: '4–6 working days', free: 'Free over $150' },
                { flag: '🇨🇦', country: 'Canada', time: '5–7 working days', free: 'Free over CA$175' },
                { flag: '🇪🇺', country: 'Europe (EU)', time: '3–5 working days', free: 'Free over €100' },
              ].map(d => (
                <div key={d.country} style={{ background: 'var(--brl)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{d.flag}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{d.country}</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)' }}>{d.time}</div>
                  <div style={{ fontSize: 10, color: 'var(--g3)', fontWeight: 600, marginTop: 2 }}>{d.free}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--mu)', marginBottom: 10 }}>Customer Reviews ({reviews.length})</div>
              {reviews.map(r => (
                <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--brl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.profiles?.full_name || 'Customer'}</div>
                    <div style={{ color: 'var(--am)', fontSize: 13 }}>{'★'.repeat(r.rating || 5)}</div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--mu)', lineHeight: 1.5 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowReview(true)} className="btn-outline"
            style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 13.5, marginTop: 8 }}>
            ✍️ Write a Review
          </button>
          {showReview && (
            <WriteReview
              productId={product.id}
              onClose={() => setShowReview(false)}
              onSubmit={() => {
                setShowReview(false)
                supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', id).order('created_at', { ascending: false }).limit(10)
                  .then(({ data }) => setReviews(data || []))
              }}
            />
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '20px auto 0', padding: '0 14px' }}>
          <h3 style={{ fontFamily: 'Fraunces,serif', fontSize: 20, color: 'var(--g1)', marginBottom: 12 }}>You might also like</h3>
          <div className="pgrid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Sticky Jumia-style action bar — only on mobile */}
      <div className="pdp-sticky" style={{
        position: 'fixed', left: 0, right: 0, bottom: 56,   /* 56 clears bottom-nav on mobile */
        background: 'var(--wh)', borderTop: '1px solid var(--br)',
        padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center',
        zIndex: 500,
        boxShadow: '0 -6px 20px rgba(0,0,0,.06)'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--mu)' }}>Total</div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--g2)' }}>£{(price * qty).toFixed(2)}</div>
        </div>
        <button onClick={handleAddToCart} disabled={product.stock_qty === 0} className="btn-outline" style={{ flex: 1, justifyContent: 'center', height: 46, fontSize: 13.5, fontWeight: 700 }}>
          Add to Cart
        </button>
        <button onClick={handleBuyNow} disabled={product.stock_qty === 0} className="btn-primary" style={{ flex: 1, justifyContent: 'center', height: 46, fontSize: 13.5, fontWeight: 700 }}>
          Buy Now
        </button>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .pdp-sticky { display: none !important; }
        }
      `}</style>
    </div>
  )
}

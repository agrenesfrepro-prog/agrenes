import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Star, Plus, Minus, Share2, ShieldCheck, Truck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore, useWishlistStore } from '../lib/store'
import ProductCard from '../components/product/ProductCard'
import toast from 'react-hot-toast'


// Cultural notes for Ugandan produce
const CULTURAL_NOTES = {
  "matoke": "Matoke (green cooking banana) is Uganda's national dish. Steamed in banana leaves and mashed, it's served at virtually every Ugandan family table.",
  "plantain": "Plantain (gonja) is a Ugandan staple — sliced and deep-fried into golden chips, roasted whole over charcoal, or boiled as a starchy side dish.",
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
  const { toggle, has } = useWishlistStore()
  const [product, setProduct] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [isBulk, setIsBulk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    setQty(1)
    Promise.all([
      supabase.from('products').select('*, categories(name,slug)').eq('id', id).single(),
      supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', id).order('created_at', {ascending:false}).limit(10),
      supabase.from('product_variants').select('*').eq('product_id', id).eq('is_active', true).order('sort_order'),
    ]).then(([{data:p}, {data:r}, {data:vv}]) => {
      setVariants(vv || [])
      if (vv?.length) setSelectedVariant(vv[0])
      setProduct(p)
      setReviews(r || [])
      if (p?.vendor_id) {
        supabase.from('vendors').select('*').eq('id', p.vendor_id).single()
          .then(({data:v}) => setVendor(v))
        supabase.from('products').select('*').eq('vendor_id', p.vendor_id).neq('id',id).eq('is_active',true).limit(4)
          .then(({data:rel}) => setRelated(rel || []))
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{padding:20}}>
      <div className="skel" style={{height:300, borderRadius:16, marginBottom:20}}/>
      <div className="skel" style={{height:24, marginBottom:12}}/>
      <div className="skel" style={{height:18, width:'60%'}}/>
    </div>
  )
  if (!product) return <div style={{padding:40,textAlign:'center'}}>Product not found</div>

  const discount = product.compare_price ? Math.round((1 - product.price/product.compare_price)*100) : 0
  const wished = has(product.id)
  const price = selectedVariant ? selectedVariant.price : (isBulk && product.bulk_price ? product.bulk_price : product.price)
  const images = product.images?.length ? product.images : [product.img].filter(Boolean)

  const handleAddToCart = () => {
    const cartItem = selectedVariant
      ? { ...product, id: product.id + '-' + selectedVariant.id, price, name: product.name + ' (' + selectedVariant.label + ')', variant_id: selectedVariant.id }
      : { ...product, price }
    addItem(cartItem, qty)
    toast.success(`${product.name} added to cart!`)
    openCart()
  }

  const handleBuyNow = () => {
    const cartItem = selectedVariant
      ? { ...product, id: product.id + '-' + selectedVariant.id, price, name: product.name + ' (' + selectedVariant.label + ')', variant_id: selectedVariant.id }
      : { ...product, price }
    addItem(cartItem, qty)
    navigate('/checkout')
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating

  return (
    <div className="page-enter" style={{paddingBottom:100}}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display:'flex', alignItems:'center', gap:6, padding:'14px 16px',
        background:'none', border:'none', color:'var(--g3)', fontWeight:600, fontSize:13.5
      }}>
        <ArrowLeft size={18}/> Back
      </button>

      {/* Images */}
      <div style={{padding:'0 14px', marginBottom:16}}>
        <div style={{borderRadius:16, overflow:'hidden', height:280, background:'var(--brl)', marginBottom:10}}>
          <img src={images[activeImg]} alt={product.name}
            style={{width:'100%', height:'100%', objectFit:'cover'}}
          />
        </div>
        {images.length > 1 && (
          <div style={{display:'flex', gap:8}}>
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{
                width:60, height:60, borderRadius:8, overflow:'hidden', flexShrink:0,
                border: `2px solid ${i === activeImg ? 'var(--g3)' : 'var(--br)'}`,
                background:'none', padding:0, cursor:'pointer'
              }}>
                <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card" style={{margin:'0 14px 12px', padding:18, borderRadius:16}}>
        {/* Category + Vendor */}
        <div style={{display:'flex', gap:8, marginBottom:8, flexWrap:'wrap'}}>
          {product.categories?.name && (
            <span className="badge badge-green">{product.categories.name}</span>
          )}
          {vendor?.name && (
            <span className="badge badge-amber">🏪 {vendor.name}</span>
          )}
          {vendor?.is_verified && (
            <span className="badge" style={{background:'var(--gl)',color:'var(--g2)'}}>
              <ShieldCheck size={11}/> Verified
            </span>
          )}
        </div>

        <h1 style={{fontSize:22, marginBottom:8, lineHeight:1.25}}>{product.name}</h1>

        {/* Rating */}
        {avgRating > 0 && (
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={15} fill={s<=Math.round(avgRating)?'var(--am)':'none'}
                color={s<=Math.round(avgRating)?'var(--am)':'var(--br)'}/>
            ))}
            <span style={{fontSize:14, fontWeight:700}}>{avgRating.toFixed(1)}</span>
            <span style={{fontSize:12, color:'var(--lt)'}}>({product.review_count} reviews)</span>
          </div>
        )}

        {/* Price + Bulk toggle */}
        {product.bulk_price && (
          <div style={{
            display:'flex', background:'var(--brl)', borderRadius:10, padding:4,
            marginBottom:12, width:'fit-content'
          }}>
            {[{label:'Retail', bulk:false},{label:`Bulk (min ${product.bulk_min_qty}${product.unit})`, bulk:true}].map(tab => (
              <button key={tab.label} onClick={() => { setIsBulk(tab.bulk); setQty(tab.bulk ? product.bulk_min_qty : 1) }}
                style={{
                  padding:'7px 14px', borderRadius:8, fontSize:12.5, fontWeight:600,
                  background: isBulk===tab.bulk ? 'var(--wh)' : 'transparent',
                  border:'none', color: isBulk===tab.bulk ? 'var(--g2)' : 'var(--mu)',
                  boxShadow: isBulk===tab.bulk ? 'var(--sh1)' : 'none',
                  cursor:'pointer', transition:'all .2s'
                }}
              >{tab.label}</button>
            ))}
          </div>
        )}

        {/* Size variants */}
        {variants.length > 0 && (
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.5, color:'var(--mu)', marginBottom:8}}>
              Select Size
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {variants.map(v => (
                <button key={v.id} onClick={() => setSelectedVariant(v)} style={{
                  padding:'9px 18px', borderRadius:10, fontSize:13.5, fontWeight:700,
                  background: selectedVariant?.id === v.id ? 'var(--g2)' : 'var(--wh)',
                  color: selectedVariant?.id === v.id ? '#fff' : 'var(--tx)',
                  border: '1.5px solid ' + (selectedVariant?.id === v.id ? 'var(--g2)' : 'var(--br)'),
                  cursor:'pointer', transition:'all .15s'
                }}>
                  {v.label}
                  <span style={{display:'block', fontSize:11, fontWeight:600, opacity:.8}}>£{v.price?.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:4}}>
          <span style={{fontFamily:'Fraunces,serif', fontSize:32, fontWeight:700, color:'var(--g2)'}}>
            £{price?.toFixed(2)}
          </span>
          {product.compare_price && !isBulk && (
            <span style={{fontSize:16, color:'var(--lt)', textDecoration:'line-through'}}>
              £{product.compare_price?.toFixed(2)}
            </span>
          )}
          {discount > 0 && !isBulk && (
            <span className="badge badge-red">-{discount}%</span>
          )}
        </div>
        <div style={{fontSize:12, color:'var(--mu)', marginBottom:16}}>per {product.unit}</div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:16}}>
            {product.tags.map(t => (
              <span key={t} style={{
                background:'var(--brl)', border:'1px solid var(--br)',
                fontSize:11, padding:'3px 10px', borderRadius:20, color:'var(--mu)', fontWeight:500
              }}>{t}</span>
            ))}
          </div>
        )}

        <p style={{fontSize:13.5, lineHeight:1.7, color:'var(--mu)', marginBottom:16}}>
          {product.description}
        </p>

        {/* Specs */}
        {product.certifications?.length > 0 && (
          <div style={{
            background:'var(--gll)', border:'1px solid var(--gl)',
            borderRadius:10, padding:12, marginBottom:16
          }}>
            <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.5, color:'var(--g2)', marginBottom:8}}>
              Certifications & Origin
            </div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {product.certifications.map(c => (
                <span key={c} style={{
                  background:'var(--g4)', color:'#fff',
                  fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20
                }}><ShieldCheck size={10} style={{marginRight:3}}/>{c}</span>
              ))}
            </div>
            {product.origin && (
              <div style={{fontSize:12, color:'var(--mu)', marginTop:8}}>
                🇺🇬 Origin: {product.origin}
              </div>
            )}
          </div>
        )}

        {/* Delivery info */}
        <div style={{
          background:'var(--aml)', border:'1px solid #FAC775',
          borderRadius:10, padding:12, display:'flex', gap:10, alignItems:'center'
        }}>
          <Truck size={18} color="var(--amd)"/>
          <div style={{fontSize:12.5}}>
            <strong>Free delivery on orders over £75.</strong> Air-freighted fresh 4× weekly from Entebbe to Gatwick. Estimated 2–4 working days.
          </div>
        </div>
      </div>

      {/* Quantity + Add */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        background:'var(--wh)', borderTop:'1px solid var(--br)',
        padding:'14px 16px', display:'flex', gap:12, alignItems:'center',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
        boxShadow:'0 -4px 16px rgba(0,0,0,.08)', zIndex:600
      }}>
        <button onClick={() => toggle(product)} style={{
          background: wished ? 'var(--rdl)' : 'var(--brl)',
          border:'1px solid var(--br)', borderRadius:10,
          width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0
        }}>
          <Heart size={18} fill={wished?'#E63946':'none'} color={wished?'#E63946':'var(--mu)'}/>
        </button>

        <div style={{
          display:'flex', alignItems:'center', border:'1px solid var(--br)',
          borderRadius:10, overflow:'hidden', flexShrink:0
        }}>
          <button onClick={() => setQty(Math.max(1, qty-1))} style={{
            background:'var(--brl)', border:'none', width:36, height:44,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}><Minus size={14}/></button>
          <span style={{width:40, textAlign:'center', fontSize:15, fontWeight:700}}>{qty}</span>
          <button onClick={() => setQty(qty+1)} style={{
            background:'var(--brl)', border:'none', width:36, height:44,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}><Plus size={14}/></button>
        </div>

        <button onClick={handleAddToCart} className="btn-outline" style={{flex:1, textAlign:'center', justifyContent:'center', height:44}}>
          Add to Cart
        </button>
        <button onClick={handleBuyNow} className="btn-primary" style={{flex:1, justifyContent:'center', height:44}}>
          Buy Now
        </button>
      </div>

      {/* Reviews */}
      <div className="card" style={{margin:'0 14px 12px', padding:18, borderRadius:16}}>
        <h3 style={{fontSize:16, marginBottom:14}}>Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p style={{fontSize:13, color:'var(--lt)'}}>No reviews yet. Be the first!</p>
        ) : reviews.map(r => (
          <div key={r.id} style={{borderBottom:'1px solid var(--brl)', paddingBottom:14, marginBottom:14}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <div style={{
                width:32, height:32, borderRadius:'50%', background:'var(--g4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontSize:13, fontWeight:700, flexShrink:0
              }}>
                {r.profiles?.full_name?.[0] || '?'}
              </div>
              <div>
                <div style={{fontSize:13, fontWeight:600}}>{r.profiles?.full_name || 'Customer'}</div>
                <div style={{display:'flex', gap:2}}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={11} fill={s<=r.rating?'var(--am)':'none'} color={s<=r.rating?'var(--am)':'var(--br)'}/>
                  ))}
                </div>
              </div>
              {r.is_verified && (
                <span className="badge badge-green" style={{marginLeft:'auto', fontSize:10}}>✓ Verified</span>
              )}
            </div>
            {r.title && <div style={{fontSize:13.5, fontWeight:700, marginBottom:4}}>{r.title}</div>}
            <p style={{fontSize:13, color:'var(--mu)', lineHeight:1.6}}>{r.body}</p>
          </div>
        ))}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <div className="sec-hd"><h2>More from this Vendor</h2></div>
          <div className="pgrid">
            {related.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      )}
    </div>
  )
}

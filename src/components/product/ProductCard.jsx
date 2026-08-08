import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, Star } from 'lucide-react'
import { useCartStore, useWishlistStore } from '../../lib/store'
import toast from 'react-hot-toast'
import { img } from '../../lib/img'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const [adding, setAdding] = useState(false)
  const wished = has(product.id)

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0

  const variantPrices = (product.product_variants || []).filter(v => v.is_active !== false).map(v => Number(v.price)).filter(n => !isNaN(n))
  const hasVariants = variantPrices.length > 0
  const displayPrice = hasVariants ? Math.min(...variantPrices) : product.price

  const handleAdd = async (e) => {
    e.stopPropagation()
    if (hasVariants) {
      navigate(`/product/${product.id}`)
      return
    }
    setAdding(true)
    addItem(product)
    toast.success(`${product.name} added to cart`)
    setTimeout(() => setAdding(false), 600)
  }

  const handleWish = (e) => {
    e.stopPropagation()
    toggle(product)
    toast(wished ? 'Removed from wishlist' : '❤️ Added to wishlist')
  }

  return (
    <div onClick={() => navigate(`/product/${product.id}`)}
      className="card"
      style={{cursor:'pointer', transition:'all .18s', position:'relative'}}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--sh2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = 'var(--sh1)'
      }}
    >
      {/* Image */}
      <div style={{height:160, overflow:'hidden', position:'relative', background:'var(--brl)'}}>
        <img
          src={product.images?.[0] || product.img || `https://source.unsplash.com/400x300/?${encodeURIComponent(product.name)}`}
          alt={product.name}
          loading="lazy"
          style={{width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s'}}
          onMouseEnter={e => e.target.style.transform='scale(1.06)'}
          onMouseLeave={e => e.target.style.transform=''}
        />

        {/* Badges */}
        {discount > 0 && (
          <span style={{
            position:'absolute', top:8, left:8,
            background:'var(--rd)', color:'#fff',
            fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:5
          }}>-{discount}%</span>
        )}
        {product.is_flash_deal && (
          <span style={{
            position:'absolute', top:8, left:8,
            background:'var(--rd)', color:'#fff',
            fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:5
          }}>⚡ Flash</span>
        )}
        {product.stock_qty === 0 && (
          <div style={{
            position:'absolute', inset:0, background:'rgba(255,255,255,.75)',
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(2px)'
          }}>
            <span style={{
              background:'var(--rd)', color:'#fff', fontSize:11,
              fontWeight:800, padding:'5px 14px', borderRadius:20,
              letterSpacing:.5
            }}>OUT OF STOCK</span>
          </div>
        )}
        {product.stock_qty > 0 && product.stock_qty <= 10 && (
          <span style={{
            position:'absolute', bottom:8, left:8,
            background:'rgba(230,57,70,.88)', color:'#fff',
            fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:4,
            backdropFilter:'blur(3px)'
          }}>Only {product.stock_qty} left</span>
        )}
        {product.bulk_price && (
          <span style={{
            position:'absolute', top:8, right:36,
            background:'var(--pu)', color:'#fff',
            fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:4
          }}>BULK</span>
        )}

        {/* Wishlist */}
        <button onClick={handleWish} style={{
          position:'absolute', top:6, right:6,
          background:'rgba(255,255,255,.9)', border:'none', borderRadius:50,
          width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(4px)'
        }}>
          <Heart size={15} fill={wished ? '#E63946' : 'none'} color={wished ? '#E63946' : '#6B6960'} />
        </button>
      </div>

      {/* Info */}
      <div style={{padding:'10px 11px 12px'}}>
        {/* Vendor */}
        {product.vendor_name && (
          <div style={{fontSize:10, color:'var(--g3)', fontWeight:700, marginBottom:3, textTransform:'uppercase', letterSpacing:.4}}>
            {product.vendor_name}
          </div>
        )}

        <div style={{fontSize:13, fontWeight:500, color:'var(--tx)', lineHeight:1.35, marginBottom:5, minHeight:34}}>
          {product.name}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}>
            <Star size={11} fill="var(--am)" color="var(--am)" />
            <span style={{fontSize:11, fontWeight:700, color:'var(--tx)'}}>{product.rating?.toFixed(1)}</span>
            <span style={{fontSize:10, color:'var(--lt)'}}>({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:8}}>
          <span style={{fontFamily:'Fraunces, serif', fontSize:17, fontWeight:700, color:'var(--g2)'}}>
            {hasVariants && <span style={{fontSize:11, fontWeight:600, color:'var(--mu)', fontFamily:'Plus Jakarta Sans, sans-serif'}}>From </span>}
            £{displayPrice?.toFixed(2)}
          </span>
          {product.compare_price && (
            <span style={{fontSize:11, color:'var(--lt)', textDecoration:'line-through'}}>
              £{product.compare_price?.toFixed(2)}
            </span>
          )}
          <span style={{fontSize:10, color:'var(--mu)', marginLeft:'auto'}}>{product.unit}</span>
        </div>

        {/* Bulk info */}
        {product.bulk_price && (
          <div style={{
            background:'var(--pul)', borderRadius:6, padding:'4px 8px',
            fontSize:10, color:'var(--pu)', fontWeight:600, marginBottom:8
          }}>
            Bulk: £{product.bulk_price}/{product.unit} (min {product.bulk_min_qty}{product.unit})
          </div>
        )}

        {/* Add to cart */}
        <button onClick={product.stock_qty === 0 ? undefined : handleAdd}
          disabled={product.stock_qty === 0}
          style={{
          width:'100%',
          background: product.stock_qty === 0 ? 'var(--br)' : adding ? 'var(--g4)' : 'var(--g2)',
          color: product.stock_qty === 0 ? 'var(--lt)' : '#fff',
          border:'none', borderRadius:8,
          padding:'9px 0', fontSize:12.5, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
          transition:'all .2s', cursor: product.stock_qty === 0 ? 'not-allowed' : 'pointer'
        }}>
          <Plus size={14} />
          {product.stock_qty === 0 ? 'Out of Stock' : hasVariants ? 'Choose Size' : adding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

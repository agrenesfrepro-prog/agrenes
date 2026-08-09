import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../lib/store'
import { img } from '../lib/img'
import toast from 'react-hot-toast'

export default function BundleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, openCart } = useCartStore()
  const [bundle, setBundle] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bundles')
      .select('*, bundle_items(id,qty,sort_order,products(id,name,unit,price,images))')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setBundle(data)
        setItems((data?.bundle_items || []).sort((a,b) => (a.sort_order||0) - (b.sort_order||0)))
        setLoading(false)
      })
  }, [slug])

  const addBundleToCart = () => {
    if (!bundle) return
    // Add the bundle as a single line item so the customer sees one entry with the bundle price
    addItem({
      id: 'bundle-' + bundle.id,
      name: bundle.name,
      price: Number(bundle.price),
      images: bundle.hero_image ? [bundle.hero_image] : [],
      unit: 'bundle',
      bundle_id: bundle.id,
    }, 1)
    toast.success(`${bundle.name} added to cart!`)
    openCart?.()
  }

  if (loading) return <div style={{ padding: 40 }}><div className="card skel" style={{ height: 200 }} /></div>
  if (!bundle) return <div style={{ padding: 40, textAlign: 'center' }}><p>Bundle not found.</p><button onClick={() => navigate('/bundles')} className="btn-primary" style={{ marginTop: 12 }}>Back to bundles</button></div>

  const savingsPct = bundle.compare_price
    ? Math.max(0, Math.round((1 - Number(bundle.price) / Number(bundle.compare_price)) * 100))
    : 0

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      <div style={{ background: 'linear-gradient(135deg,var(--g1),var(--g2))', padding: '20px 16px 20px', color: '#fff' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', opacity: .85, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>← Back</button>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: 56 }}>{bundle.hero_emoji || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.2, opacity: .8 }}>CURATED BUNDLE</div>
            <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 24, fontWeight: 700 }}>{bundle.name}</h1>
            {bundle.tagline && <p style={{ opacity: .9, fontSize: 13.5, fontStyle: 'italic', marginTop: 4 }}>{bundle.tagline}</p>}
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 14px' }}>
        {bundle.description && <p style={{ fontSize: 14, color: 'var(--tx)', lineHeight: 1.65, marginBottom: 18 }}>{bundle.description}</p>}

        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <span style={{ fontFamily: 'Fraunces,serif', fontSize: 32, fontWeight: 700, color: 'var(--g2)' }}>£{Number(bundle.price).toFixed(2)}</span>
            {bundle.compare_price && Number(bundle.compare_price) > Number(bundle.price) && (
              <>
                <span style={{ fontSize: 15, color: 'var(--mu)', textDecoration: 'line-through' }}>£{Number(bundle.compare_price).toFixed(2)}</span>
                <span className="badge" style={{ background: 'var(--amd)', color: '#fff', fontSize: 11 }}>SAVE {savingsPct}%</span>
              </>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--mu)' }}>All prices in GBP. Free UK delivery on orders over £75.</p>
        </div>

        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--mu)', fontWeight: 800, marginBottom: 10 }}>What's inside</h3>
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--lt)' }}>Contents being curated — great pick regardless!</p>}
          {items.map(bi => (
            <div key={bi.id} className="card" style={{ display: 'flex', gap: 12, padding: 10, alignItems: 'center' }}>
              {bi.products?.images?.[0]
                ? <img src={img(bi.products.images[0], 200)?.replace('resize=cover','resize=contain')} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'contain', background: 'var(--brl)' }} />
                : <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--brl)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{bi.products?.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>Qty {Number(bi.qty) || 1}{bi.products?.unit ? ' · ' + bi.products.unit : ''}</div>
              </div>
              <Check size={18} color="var(--g4)" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--wh)', borderTop: '1px solid var(--br)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', maxWidth: 900, margin: '0 auto', zIndex: 500 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--mu)' }}>Bundle price</div>
          <div style={{ fontFamily: 'Fraunces,serif', fontSize: 22, fontWeight: 700, color: 'var(--g2)' }}>£{Number(bundle.price).toFixed(2)}</div>
        </div>
        <button onClick={addBundleToCart} className="btn-primary" style={{ flex: 2, justifyContent: 'center', height: 48, fontSize: 15 }}>
          <Plus size={16} /> Add Bundle to Cart
        </button>
      </div>
    </div>
  )
}

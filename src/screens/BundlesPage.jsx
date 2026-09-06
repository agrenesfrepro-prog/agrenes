import SEO from '../components/SEO'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { img } from '../lib/img'

export default function BundlesPage() {
  const navigate = useNavigate()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bundles')
      .select('*, bundle_items(id,qty,products(id,name,unit,images))')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { setBundles(data || []); setLoading(false) })
  }, [])

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
<SEO
  title="Curated Ugandan Bundles"
  description="Sunday lunch boxes, care packages and gift sets — curated Ugandan bundles delivered UK-wide."
  url="/bundles"
/>
      <div style={{ background: 'linear-gradient(135deg,var(--g1),var(--g2))', padding: '30px 16px 24px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: 1.4, opacity: .8, marginBottom: 6 }}>CURATED BUNDLES</div>
        <h1 style={{ fontFamily: 'Fraunces,serif', fontSize: 28, marginBottom: 8 }}>Boxes with intention 🎁</h1>
        <p style={{ opacity: .8, maxWidth: 500, margin: '0 auto', fontSize: 14, lineHeight: 1.55 }}>
          Sunday lunch, gifts to loved ones, celebrations — curated Ugandan boxes for every occasion. Save vs buying separately.
        </p>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {loading ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="card skel" style={{ height: 220 }} />)}
          </div>
        ) : bundles.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--lt)', padding: '40px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📦</div>
            <p style={{ fontWeight: 600, color: 'var(--tx)' }}>No bundles yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {bundles.map(b => (
              <div key={b.id} onClick={() => navigate('/bundles/' + b.slug)}
                className="card" style={{
                  cursor: 'pointer', overflow: 'hidden', padding: 0,
                  transition: 'transform .18s, box-shadow .18s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh3)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ height: 130, background: 'linear-gradient(135deg,var(--gll),var(--gl))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                  {b.hero_image
                    ? <img src={img(b.hero_image, 800)?.replace('resize=cover','resize=cover')} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (b.hero_emoji || '📦')}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 17, fontFamily: 'Fraunces,serif', fontWeight: 700, color: 'var(--g1)' }}>{b.name}</h3>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--g2)' }}>£{Number(b.price).toFixed(2)}</div>
                      {b.compare_price && Number(b.compare_price) > Number(b.price) && (
                        <div style={{ fontSize: 11, color: 'var(--mu)', textDecoration: 'line-through' }}>£{Number(b.compare_price).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  {b.tagline && <p style={{ fontSize: 13, color: 'var(--g3)', fontStyle: 'italic', marginBottom: 8 }}>{b.tagline}</p>}
                  {b.description && <p style={{ fontSize: 12.5, color: 'var(--mu)', lineHeight: 1.5, marginBottom: 10 }}>{b.description}</p>}
                  {b.bundle_items?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {b.bundle_items.slice(0,4).map(bi => (
                        <span key={bi.id} className="badge" style={{ background: 'var(--brl)', color: 'var(--tx)', fontSize: 10 }}>{bi.products?.name}</span>
                      ))}
                      {b.bundle_items.length > 4 && <span className="badge" style={{ background: 'var(--gll)', color: 'var(--g2)', fontSize: 10 }}>+{b.bundle_items.length - 4} more</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ShieldCheck, MapPin, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'

function VendorCard({ vendor }) {
  const navigate = useNavigate()
  return (
    <div className="card" onClick={() => navigate(`/shop?vendor=${vendor.id}`)}
      style={{ cursor: 'pointer', transition: 'all .18s', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--sh1)' }}
    >
      {/* Cover */}
      <div style={{
        height: 90, background: 'linear-gradient(135deg, var(--g1), var(--g3))',
        position: 'relative', overflow: 'hidden'
      }}>
        {vendor.cover_url && <img src={vendor.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .6 }} />}
        {vendor.is_verified && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(255,255,255,.9)', color: 'var(--g2)',
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 3
          }}><ShieldCheck size={10} /> Verified</span>
        )}
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: 'var(--gl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0, border: '2px solid var(--wh)',
            marginTop: -22, boxShadow: 'var(--sh1)'
          }}>
            {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.name} style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} /> : '🏪'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{vendor.name}</div>
            {vendor.location && (
              <div style={{ fontSize: 11, color: 'var(--mu)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                <MapPin size={9} /> {vendor.location}
              </div>
            )}
          </div>
        </div>

        {vendor.description && (
          <p style={{ fontSize: 12, color: 'var(--mu)', lineHeight: 1.5, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {vendor.description}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          {vendor.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star size={11} fill="var(--am)" color="var(--am)" />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{vendor.rating?.toFixed(1)}</span>
              <span style={{ fontSize: 10, color: 'var(--lt)' }}>({vendor.review_count})</span>
            </div>
          )}
          {vendor.total_sales > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Package size={10} color="var(--mu)" />
              <span style={{ fontSize: 10, color: 'var(--mu)' }}>{vendor.total_sales} sales</span>
            </div>
          )}
        </div>

        {/* Certifications */}
        {vendor.certifications?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {vendor.certifications.map(c => (
              <span key={c} className="badge badge-green" style={{ fontSize: 9 }}>{c}</span>
            ))}
          </div>
        )}

        <button style={{
          marginTop: 12, width: '100%', background: 'var(--g2)', color: '#fff',
          border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 12.5,
          fontWeight: 700, cursor: 'pointer'
        }}>View Products →</button>
      </div>
    </div>
  )
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('vendors').select('*').eq('is_active', true)
      .order('is_verified', { ascending: false })
      .then(({ data }) => { setVendors(data || []); setLoading(false) })
  }, [])

  const filtered = vendors.filter(v =>
    !search || v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--g1), var(--g3))',
        padding: '28px 20px 24px', textAlign: 'center'
      }}>
        <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 8, fontFamily: 'Fraunces,serif' }}>
          Our Partner Farms & Vendors
        </h1>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5, marginBottom: 18 }}>
          {vendors.length}+ verified Ugandan farms and exporters
        </p>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search vendors or locations…"
          style={{
            width: '100%', maxWidth: 400, padding: '12px 16px',
            borderRadius: 10, border: 'none', outline: 'none',
            fontSize: 14, background: 'rgba(255,255,255,.95)'
          }}
        />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 14, padding: '16px 14px 24px'
      }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ height: 260 }}>
              <div className="skel" style={{ height: 90 }} />
              <div style={{ padding: 14 }}>
                <div className="skel" style={{ height: 14, marginBottom: 8, width: '60%' }} />
                <div className="skel" style={{ height: 12, marginBottom: 6 }} />
                <div className="skel" style={{ height: 12, width: '80%' }} />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--lt)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>No vendors found</p>
          </div>
        ) : filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
      </div>
    </div>
  )
}

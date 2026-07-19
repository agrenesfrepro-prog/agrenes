import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const FALLBACK_CATS = [
  { slug: 'all', name: 'All Produce', emoji: '🥬' },
  { slug: 'fruits', name: 'Fruits', emoji: '🥑' },
  { slug: 'vegetables', name: 'Vegetables', emoji: '🫛' },
  { slug: 'bananas', name: 'Bananas', emoji: '🍌' },
  { slug: 'tubers', name: 'Tubers', emoji: '🍠' },
  { slug: 'herbs', name: 'Herbs & Spices', emoji: '🌶' },
  { slug: 'legumes', name: 'Legumes', emoji: '🫘' },
]

export default function CategoryBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [cats, setCats] = useState(FALLBACK_CATS)
  const params = new URLSearchParams(location.search)
  const active = params.get('cat') || 'all'

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true)
      .order('sort_order').then(({ data }) => {
        if (data?.length) setCats(data)
      })
  }, [])

  const handleCat = (slug) => {
    if (slug === 'all') navigate('/shop')
    else navigate(`/shop?cat=${slug}`)
  }

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid var(--br)',
      position: 'sticky', top: 64, zIndex: 490,
      boxShadow: '0 1px 4px rgba(0,0,0,.05)'
    }}>
      <div className="hide-scroll" style={{
        display: 'flex', overflowX: 'auto', padding: '0 12px'
      }}>
        {cats.map(cat => (
          <button key={cat.slug || cat.id} onClick={() => handleCat(cat.slug)}
            style={{
              padding: '12px 15px', fontSize: 12.5, fontWeight: 600,
              whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
              background: 'none', border: 'none',
              borderBottom: `2.5px solid ${active === cat.slug ? 'var(--g4)' : 'transparent'}`,
              color: active === cat.slug ? 'var(--g2)' : 'var(--mu)',
              transition: 'all .18s'
            }}
          >
            <span style={{marginRight:5}}>{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore, useAuthStore, useWishlistStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'

// Base64 logo (embedded so no external file needed)
const LOGO_URL = '/logo.png' // place your logo in /public/logo.png

export default function Navbar({ onMenuOpen }) {
  const navigate = useNavigate()
  const { items, openCart } = useCartStore()
  const { user, profile, signOut } = useAuthStore()
  const { items: wishlist } = useWishlistStore()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [announceVisible, setAnnounceVisible] = useState(true)
  const searchRef = useRef(null)
  const cartCount = items.reduce((s, i) => s + i.qty, 0)

  // Search autocomplete
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, images, category_id')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(6)
      setSuggestions(data || [])
      setShowSug(true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`)
      setShowSug(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* Announcement bar */}
      {announceVisible && (
        <div style={{
          background: 'var(--g1)', color: 'rgba(255,255,255,.9)',
          fontSize: 11.5, textAlign: 'center', padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          ✈️ Free delivery on orders over <strong style={{color:'var(--am)'}}>£75</strong>
          &nbsp;·&nbsp; 4× weekly flights from Entebbe to Gatwick
          &nbsp;·&nbsp; GAP & UNBS Certified
          <button onClick={() => setAnnounceVisible(false)} style={{
            background:'transparent', border:'none', color:'rgba(255,255,255,.5)',
            fontSize:16, marginLeft:'auto', cursor:'pointer', lineHeight:1
          }}>×</button>
        </div>
      )}

      {/* Main nav */}
      <nav style={{
        background: '#fff', height: 64, padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: announceVisible ? 37 : 0, zIndex: 500,
        boxShadow: '0 2px 12px rgba(0,0,0,.08)', borderBottom: '1px solid var(--br)'
      }}>
        {/* Mobile menu */}
        <button onClick={onMenuOpen} style={{
          background: 'none', border: 'none', color: 'var(--tx)',
          display: 'flex', padding: 4
        }}>
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
          <img src={LOGO_URL} alt="AGRENES" style={{ height: 40, width: 'auto', objectFit:'contain' }} />
        </Link>

        {/* Search */}
        <div ref={searchRef} style={{ flex:1, position:'relative', maxWidth:560 }}>
          <form onSubmit={handleSearch} style={{
            display:'flex', alignItems:'center',
            background:'var(--brl)', border:'1.5px solid var(--br)',
            borderRadius:10, overflow:'hidden', transition:'border-color .2s'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--g3)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--br)'}
          >
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query.length > 1 && setShowSug(true)}
              placeholder="Search for avocados, matoke, ginger…"
              style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                padding:'0 14px', color:'var(--tx)', fontSize:13.5, height:42
              }}
            />
            <button type="submit" style={{
              background:'var(--g2)', border:'none', padding:'0 18px',
              color:'#fff', fontWeight:700, fontSize:13, height:42,
              display:'flex', alignItems:'center', gap:5
            }}>
              <Search size={15} /> <span style={{display:'none'}}>Search</span>
            </button>
          </form>

          {/* Autocomplete */}
          {showSug && suggestions.length > 0 && (
            <div style={{
              position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
              background:'var(--wh)', borderRadius:10, boxShadow:'var(--sh3)',
              zIndex:600, overflow:'hidden'
            }}>
              {suggestions.map(p => (
                <div key={p.id} onClick={() => {
                  navigate(`/product/${p.id}`)
                  setShowSug(false); setQuery('')
                }} style={{
                  padding:'11px 16px', fontSize:13, cursor:'pointer',
                  display:'flex', alignItems:'center', gap:10,
                  borderBottom:'1px solid var(--brl)'
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--gll)'}
                onMouseLeave={e => e.currentTarget.style.background=''}
                >
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} style={{
                      width:36, height:36, borderRadius:6, objectFit:'cover', flexShrink:0
                    }} />
                  )}
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500, color:'var(--tx)'}}>{p.name}</div>
                  </div>
                  <div style={{
                    fontFamily:'Fraunces, serif', fontWeight:700,
                    color:'var(--g3)', fontSize:13
                  }}>£{p.price?.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav actions */}
        <div style={{display:'flex', gap:8, alignItems:'center', marginLeft:'auto'}}>
          {/* Wishlist */}
          <Link to="/wishlist" style={{
            background:'var(--gll)', border:'1px solid var(--gl)',
            borderRadius:10, padding:'8px 12px', color:'var(--g2)',
            display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600,
            position:'relative'
          }}>
            <Heart size={17} />
            <span style={{display:'none', fontSize:12}}>Saved</span>
            {wishlist.length > 0 && (
              <span style={{
                position:'absolute', top:-8, right:-8,
                background:'var(--rd)', color:'#fff', borderRadius:'50%',
                width:18, height:18, fontSize:10, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
                border:'2px solid #fff'
              }}>{wishlist.length}</span>
            )}
          </Link>

          {/* Bulk */}
          <a href="/bulk" style={{
            background:'var(--pul)', border:'1px solid #C8B5F0',
            borderRadius:10, padding:'8px 12px', color:'var(--pu)',
            display:'flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:700,
            whiteSpace:'nowrap', flexShrink:0
          }}>
            📦 Bulk Orders
          </a>

          {/* Cart */}
          <button onClick={openCart} style={{
            background:'var(--g2)', border:'none',
            borderRadius:10, padding:'8px 14px', color:'#fff',
            display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:600,
            position:'relative'
          }}>
            <ShoppingCart size={17} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                background:'var(--am)', color:'var(--amd)', borderRadius:20,
                padding:'1px 7px', fontSize:11, fontWeight:800
              }}>{cartCount}</span>
            )}
          </button>

          {/* User */}
          <div style={{position:'relative'}}>
            <button onClick={() => user ? setUserMenuOpen(!userMenuOpen) : navigate('/login')}
              style={{
                background:'var(--brl)', border:'1px solid var(--br)',
                borderRadius:10, padding:'8px 12px', color:'var(--tx)',
                display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600
              }}>
              <User size={17} />
              <span style={{maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {user ? (profile?.full_name?.split(' ')[0] || 'Account') : 'Sign In'}
              </span>
              {user && <ChevronDown size={13} />}
            </button>

            {/* User dropdown */}
            {userMenuOpen && user && (
              <div style={{
                position:'absolute', right:0, top:'calc(100% + 8px)',
                background:'var(--wh)', borderRadius:12, boxShadow:'var(--sh3)',
                border:'1px solid var(--br)', minWidth:200, zIndex:600, overflow:'hidden'
              }}>
                <div style={{padding:'12px 16px', borderBottom:'1px solid var(--br)'}}>
                  <div style={{fontWeight:700, fontSize:14}}>{profile?.full_name}</div>
                  <div style={{fontSize:12, color:'var(--mu)'}}>{profile?.email}</div>
                </div>
                {[
                  {label:'My Orders', to:'/orders'},
                  {label:'My Account', to:'/account'},
                  {label:'Wishlist', to:'/wishlist'},
                  ...(profile?.role === 'vendor' || profile?.role === 'admin'
                    ? [{label:'Vendor Dashboard', to:'/vendor'}] : []),
                  ...(profile?.role === 'admin'
                    ? [{label:'Admin Panel', to:'/admin'}] : []),
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                    style={{display:'block', padding:'11px 16px', fontSize:13,
                      fontWeight:500, transition:'background .15s'}}
                    onMouseEnter={e => e.currentTarget.style.background='var(--gll)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}
                  >{item.label}</Link>
                ))}
                <button onClick={handleSignOut} style={{
                  width:'100%', textAlign:'left', padding:'11px 16px',
                  fontSize:13, fontWeight:500, background:'none', border:'none',
                  borderTop:'1px solid var(--br)', color:'var(--rd)', cursor:'pointer'
                }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

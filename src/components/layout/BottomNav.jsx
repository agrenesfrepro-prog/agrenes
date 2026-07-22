import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, Package, Heart, User, X, ShieldCheck, Store, LayoutDashboard } from 'lucide-react'
import { useCartStore, useAuthStore, useWishlistStore } from '../../lib/store'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, openCart } = useCartStore()
  const cartCount = items.reduce((s, i) => s + i.qty, 0)
  const path = location.pathname

  const tabs = [
    { icon: <Home size={22} />, label: 'Home', to: '/' },
    { icon: <ShoppingBag size={22} />, label: 'Shop', to: '/shop' },
    { icon: <ShoppingCart size={22} />, label: 'Cart', action: openCart, badge: cartCount },
    { icon: <Package size={22} />, label: 'Orders', to: '/orders' },
    { icon: <User size={22} />, label: 'Account', to: '/account' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button key={tab.label}
          onClick={() => tab.action ? tab.action() : navigate(tab.to)}
          className={`bn-item ${tab.to && path === tab.to ? 'active' : ''}`}>
          {tab.icon}
          {tab.badge > 0 && <span className="bn-badge">{tab.badge}</span>}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export function SideMenu({ open, onClose }) {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const go = (to) => { navigate(to); onClose() }

  return (
    <>
      {open && <div className="overlay" onClick={onClose} style={{ zIndex: 700 }} />}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 'min(300px, 85vw)', background: 'var(--wh)',
        zIndex: 800, boxShadow: 'var(--sh3)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--g1), var(--g3))',
          padding: '24px 18px 20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <img src="/logo.png" alt="AGRENES" style={{ height: 36, filter: 'brightness(0) invert(1)' }} />
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff',
              borderRadius: 8, width: 32, height: 32, display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <X size={18} />
            </button>
          </div>
          {user ? (
            <div style={{ marginTop: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: 'var(--am)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: 'var(--amd)', marginBottom: 8
              }}>
                {profile?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{profile?.full_name}</div>
              <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12 }}>{user.email}</div>
            </div>
          ) : (
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button onClick={() => go('/login')} style={{
                background: 'var(--am)', color: 'var(--amd)', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}>Sign In</button>
              <button onClick={() => go('/login')} style={{
                background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)',
                borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}>Register</button>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {[
            { icon: <Home size={18} />, label: 'Home', to: '/' },
            { icon: <ShoppingBag size={18} />, label: 'Shop All Produce', to: '/shop' },
            { icon: <Package size={18} />, label: 'My Orders', to: '/orders' },
            { icon: <Heart size={18} />, label: 'Wishlist', to: '/wishlist' },
            { icon: <User size={18} />, label: 'My Account', to: '/account' },
            { icon: '🏪', label: 'Our Vendors', to: '/vendors' },
            { icon: '📦', label: 'Bulk / Wholesale', to: '/bulk' },
            { icon: '📖', label: 'About AGRENES', to: '/about' },
            { icon: '✉️', label: 'Contact Us', to: '/contact' },
          ].map(item => (
            <button key={item.to} onClick={() => go(item.to)} style={{
              width: '100%', padding: '13px 18px', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: 'var(--tx)', textAlign: 'left',
              borderBottom: '1px solid var(--brl)', transition: 'background .15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gll)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <span style={{ color: 'var(--g3)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Categories */}
          <div style={{
            padding: '12px 18px 6px',
            fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: 1, color: 'var(--lt)'
          }}>Categories</div>
          {[
            { emoji: '🥑', label: 'Fruits', slug: 'fruits' },
            { emoji: '🫛', label: 'Vegetables', slug: 'vegetables' },
            { emoji: '🍌', label: 'Bananas & Plantain', slug: 'bananas' },
            { emoji: '🍠', label: 'Roots & Tubers', slug: 'tubers' },
            { emoji: '🌶', label: 'Herbs & Spices', slug: 'herbs' },
            { emoji: '🫘', label: 'Legumes', slug: 'legumes' },
          ].map(cat => (
            <button key={cat.slug} onClick={() => go(`/shop?cat=${cat.slug}`)} style={{
              width: '100%', padding: '11px 18px', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              fontSize: 13.5, color: 'var(--tx)', textAlign: 'left',
              transition: 'background .15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gll)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <span style={{ fontSize: 18 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}

          {/* Admin/Vendor */}
          {(profile?.role === 'vendor' || profile?.role === 'admin') && (
            <>
              <div style={{
                padding: '12px 18px 6px',
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: 1, color: 'var(--lt)'
              }}>Management</div>
              {profile?.role === 'admin' && (
                <button onClick={() => go('/admin')} style={{
                  width: '100%', padding: '13px 18px', background: 'var(--gll)',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--g2)'
                }}>
                  <LayoutDashboard size={18} /> Admin Panel
                </button>
              )}
              <button onClick={() => go('/vendor')} style={{
                width: '100%', padding: '13px 18px', background: 'var(--gll)',
                border: 'none', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--g2)'
              }}>
                <Store size={18} /> Vendor Dashboard
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        {user && (
          <div style={{ padding: 16, borderTop: '1px solid var(--br)' }}>
            <button onClick={async () => { await signOut(); onClose(); }} style={{
              width: '100%', background: 'var(--rdl)', border: '1px solid #F4B0B4',
              borderRadius: 10, padding: '11px 0', fontSize: 13, fontWeight: 700,
              color: 'var(--rd)', cursor: 'pointer'
            }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  )
}

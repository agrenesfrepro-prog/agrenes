import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, MapPin, Bell, Shield, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore, useWishlistStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import ProductCard from '../product/ProductCard'
import toast from 'react-hot-toast'

// ── ACCOUNT PAGE ─────────────────────────────────────────────
export function AccountPage() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated!'); setEditMode(false) }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
      <h2 style={{ marginBottom: 8 }}>Sign in to manage your account</h2>
      <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: 12 }}>
        Sign In / Register
      </button>
    </div>
  )

  const menuItems = [
    { icon: <MapPin size={18} />, label: 'Delivery Addresses', to: '/account/addresses' },
    { icon: <Bell size={18} />, label: 'Notifications', to: '/account/notifications' },
    { icon: <Shield size={18} />, label: 'Privacy & Security', to: '/account/security' },
    ...(profile?.role === 'vendor' || profile?.role === 'admin'
      ? [{ icon: '🏪', label: 'Vendor Dashboard', to: '/vendor' }] : []),
    ...(profile?.role === 'admin'
      ? [{ icon: '⚙️', label: 'Admin Panel', to: '/admin' }] : []),
  ]

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--g1), var(--g3))',
        padding: '28px 20px 60px', textAlign: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--am)', margin: '0 auto 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: 'var(--amd)',
          border: '3px solid rgba(255,255,255,.3)'
        }}>
          {profile?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 4 }}>
          {profile?.full_name || 'My Account'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>{user?.email}</p>
        {profile?.role !== 'customer' && (
          <span style={{
            display: 'inline-block', marginTop: 8,
            background: 'rgba(255,255,255,.2)', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
            border: '1px solid rgba(255,255,255,.3)', textTransform: 'uppercase'
          }}>
            {profile?.role}
          </span>
        )}
      </div>

      {/* Profile card */}
      <div className="card" style={{ margin: '-30px 14px 14px', position: 'relative', zIndex: 1, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15 }}>Personal Details</h3>
          <button onClick={() => editMode ? handleSave() : setEditMode(true)}
            className={editMode ? 'btn-primary' : 'btn-outline'}
            style={{ fontSize: 12, padding: '7px 14px', height: 34 }}>
            {saving ? 'Saving…' : editMode ? 'Save' : 'Edit'}
          </button>
        </div>

        {editMode ? (
          <div>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <button onClick={() => setEditMode(false)} className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Full Name', val: profile?.full_name || '—' },
              { label: 'Email', val: user?.email },
              { label: 'Phone', val: profile?.phone || '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--mu)', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{row.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="card" style={{ margin: '0 14px 14px', overflow: 'hidden' }}>
        {menuItems.map((item, i) => (
          <button key={item.label} onClick={() => navigate(item.to)} style={{
            width: '100%', padding: '14px 16px', background: 'none',
            border: 'none', borderBottom: i < menuItems.length - 1 ? '1px solid var(--brl)' : 'none',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            transition: 'background .15s', textAlign: 'left'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gll)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <span style={{ color: 'var(--g3)' }}>{typeof item.icon === 'string' ? <span style={{ fontSize: 18 }}>{item.icon}</span> : item.icon}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            <ChevronRight size={16} color="var(--lt)" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ padding: '0 14px' }}>
        <button onClick={handleSignOut} style={{
          width: '100%', background: 'var(--rdl)', border: '1px solid #F4B0B4',
          borderRadius: 12, padding: '13px 0', fontSize: 14, fontWeight: 700,
          color: 'var(--rd)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, cursor: 'pointer'
        }}>
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )
}

// ── WISHLIST PAGE ────────────────────────────────────────────
export function WishlistPage() {
  const { items, toggle } = useWishlistStore()
  const navigate = useNavigate()

  return (
    <div className="page-enter">
      <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--br)', background: 'var(--wh)' }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>My Wishlist</h1>
        <p style={{ fontSize: 13, color: 'var(--mu)' }}>
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--lt)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Your wishlist is empty</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Save products you love for later</p>
          <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: 20 }}>
            Browse Produce
          </button>
        </div>
      ) : (
        <>
          <div className="pgrid" style={{ paddingTop: 14 }}>
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ padding: '0 14px 20px' }}>
            <button onClick={() => { items.forEach(p => toggle(p)) }}
              style={{
                width: '100%', background: 'none', border: '1px solid var(--br)',
                borderRadius: 10, padding: '11px 0', fontSize: 13,
                fontWeight: 600, color: 'var(--mu)', cursor: 'pointer', marginTop: 6
              }}>
              Clear Wishlist
            </button>
          </div>
        </>
      )}
    </div>
  )
}

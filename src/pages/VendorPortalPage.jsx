import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Package, TrendingUp, Star, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import toast from 'react-hot-toast'

export default function VendorPortalPage() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  useEffect(() => {
    if (!user) return
    if (!['vendor', 'admin'].includes(profile?.role)) { navigate('/'); return }
    loadVendorData()
  }, [user, profile])

  const loadVendorData = async () => {
    setLoading(true)
    const { data: v } = await supabase.from('vendors').select('*').eq('user_id', user.id).single()
    if (!v) { setLoading(false); return }
    setVendor(v)
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from('products').select('*').eq('vendor_id', v.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').eq('vendor_id', v.id).order('created_at', { ascending: false }).limit(50)
    ])
    setProducts(p || [])
    setOrders(o || [])
    setLoading(false)
  }

  const toggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    toast.success(product.is_active ? 'Product hidden' : 'Product visible')
    loadVendorData()
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Product deleted')
    loadVendorData()
  }

  if (!user || !['vendor', 'admin'].includes(profile?.role)) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
      <h2 style={{ marginBottom: 8 }}>Vendor Access Only</h2>
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 20 }}>
        You need a vendor account to access this page. Contact AGRENES to apply.
      </p>
      <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
    </div>
  )

  if (!loading && !vendor) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <h2 style={{ marginBottom: 8 }}>Vendor Profile Pending</h2>
      <p style={{ fontSize: 13, color: 'var(--mu)' }}>
        Your vendor profile is being set up by the AGRENES admin team. You'll receive an email when it's ready.
      </p>
    </div>
  )

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length

  const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'products', label: `🥬 Products (${products.length})` },
    { key: 'orders', label: `📦 Orders (${orders.length})` },
  ]

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))', padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12, background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0
          }}>
            {vendor?.logo_url ? <img src={vendor.logo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} /> : '🏪'}
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 18, marginBottom: 2 }}>{vendor?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{vendor?.location} · Vendor Dashboard</p>
          </div>
          {vendor?.is_verified && (
            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,.3)' }}>
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="hide-scroll" style={{ display: 'flex', background: 'var(--wh)', borderBottom: '1px solid var(--br)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '13px 18px', fontSize: 13, fontWeight: 700, flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: `2.5px solid ${tab === t.key ? 'var(--g4)' : 'transparent'}`,
            color: tab === t.key ? 'var(--g2)' : 'var(--mu)', transition: 'all .18s'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 14px' }}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Total Revenue', value: `£${revenue.toFixed(2)}`, icon: '💷', color: 'var(--g3)' },
                { label: 'Total Orders', value: orders.length, icon: '📦', color: 'var(--pu)' },
                { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'var(--am)' },
                { label: 'Active Products', value: products.filter(p => p.is_active).length, icon: '🥬', color: 'var(--g4)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'Fraunces,serif', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>Recent Orders</h3>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--brl)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g1)', fontFamily: 'Fraunces,serif' }}>{o.reference}</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>{new Date(o.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--g2)' }}>£{o.total?.toFixed(2)}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: o.status === 'delivered' ? 'var(--gl)' : o.status === 'pending' ? 'var(--aml)' : 'var(--pul)',
                    color: o.status === 'delivered' ? 'var(--g2)' : o.status === 'pending' ? 'var(--amd)' : 'var(--pu)'
                  }}>{o.status}</span>
                </div>
              ))}
              {orders.length === 0 && <p style={{ fontSize: 13, color: 'var(--lt)', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 17 }}>My Products</h2>
              <button onClick={() => { setEditProduct(null); setShowProductForm(true) }} className="btn-primary">
                <Plus size={15} /> Add Product
              </button>
            </div>
            {products.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={p.images?.[0]} alt={p.name}
                  style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0, background: 'var(--brl)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>
                    £{p.price}/{p.unit} · Stock: {p.stock_qty} · {p.sales_count || 0} sold
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    {!p.is_active && <span className="badge" style={{ background: 'var(--rdl)', color: 'var(--rd)', fontSize: 9 }}>Hidden</span>}
                    {p.is_featured && <span className="badge badge-amber" style={{ fontSize: 9 }}>⭐ Featured</span>}
                    {p.is_flash_deal && <span className="badge badge-red" style={{ fontSize: 9 }}>⚡ Flash</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(p)} title={p.is_active ? 'Hide' : 'Show'} style={{
                    background: p.is_active ? 'var(--gll)' : 'var(--brl)', border: '1px solid var(--br)',
                    borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: p.is_active ? 'var(--g3)' : 'var(--lt)'
                  }}>{p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button onClick={() => { setEditProduct(p); setShowProductForm(true) }} style={{
                    background: 'var(--gll)', border: '1px solid var(--gl)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--g2)'
                  }}><Edit2 size={14} /></button>
                  <button onClick={() => deleteProduct(p.id)} style={{
                    background: 'var(--rdl)', border: '1px solid #F4B0B4', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: 'var(--rd)'
                  }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--lt)' }}>
                <Package size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
                <p style={{ fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>No products yet</p>
                <p style={{ fontSize: 13 }}>Add your first product to start selling</p>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: 17, marginBottom: 14 }}>My Orders</h2>
            {orders.map(o => (
              <div key={o.id} className="card" style={{ marginBottom: 10, padding: '13px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Fraunces,serif', color: 'var(--g1)' }}>{o.reference}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.order_type}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 4 }}>
                      {o.order_items?.length || 0} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Fraunces,serif', fontWeight: 700, fontSize: 17, color: 'var(--g2)' }}>£{o.total?.toFixed(2)}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, display: 'inline-block', marginTop: 4,
                      background: o.status === 'delivered' ? 'var(--gl)' : o.status === 'pending' ? 'var(--aml)' : 'var(--pul)',
                      color: o.status === 'delivered' ? 'var(--g2)' : o.status === 'pending' ? 'var(--amd)' : 'var(--pu)'
                    }}>{o.status?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--lt)' }}>
                <Package size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
                <p style={{ fontWeight: 600, color: 'var(--tx)' }}>No orders yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

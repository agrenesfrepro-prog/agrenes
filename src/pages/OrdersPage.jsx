import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Truck, Check, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'preparing', label: 'Preparing', icon: '📦' },
  { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
  { key: 'in_transit', label: 'In Transit', icon: '✈️' },
  { key: 'customs', label: 'UK Customs', icon: '🛃' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🏃' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

function statusIndex(status) {
  return STATUS_STEPS.findIndex(s => s.key === status)
}

function StatusBadge({ status }) {
  const colors = {
    pending: ['var(--aml)', 'var(--amd)'],
    confirmed: ['var(--gl)', 'var(--g2)'],
    preparing: ['var(--gl)', 'var(--g2)'],
    dispatched: ['var(--pul)', 'var(--pu)'],
    in_transit: ['var(--pul)', 'var(--pu)'],
    customs: ['var(--aml)', 'var(--amd)'],
    out_for_delivery: ['var(--gl)', 'var(--g2)'],
    delivered: ['var(--gl)', 'var(--g1)'],
    cancelled: ['var(--rdl)', 'var(--rd)'],
    refunded: ['var(--rdl)', 'var(--rd)'],
  }
  const [bg, color] = colors[status] || ['var(--brl)', 'var(--mu)']
  const step = STATUS_STEPS.find(s => s.key === status)
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 20,
      display: 'inline-flex', alignItems: 'center', gap: 4
    }}>
      {step?.icon} {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  )
}

function OrderTracker({ status }) {
  const idx = statusIndex(status)
  return (
    <div style={{ padding: '0 4px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 480, paddingBottom: 4 }}>
        {STATUS_STEPS.map((step, i) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: i <= idx ? 'var(--g4)' : 'var(--br)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: i <= idx ? 14 : 11,
                border: i === idx ? '3px solid var(--g2)' : 'none',
                transition: 'all .3s'
              }}>
                {i < idx ? <Check size={13} color="#fff" /> : <span>{step.icon}</span>}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 600, textAlign: 'center', maxWidth: 54,
                color: i <= idx ? 'var(--g2)' : 'var(--lt)', lineHeight: 1.2
              }}>{step.label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 2px', marginBottom: 18,
                background: i < idx ? 'var(--g4)' : 'var(--br)',
                transition: 'background .3s'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order, onSelect }) {
  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
  return (
    <div className="card" onClick={() => onSelect(order)}
      style={{ marginBottom: 12, cursor: 'pointer', transition: 'all .18s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh1)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--brl)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, background: 'var(--gll)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Package size={20} color="var(--g3)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Fraunces,serif', fontWeight: 700, fontSize: 14, color: 'var(--g1)' }}>
              {order.reference}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 2 }}>
            {date} · {order.order_type === 'bulk' ? '📦 Bulk' : '🛍️ Retail'} · £{order.total?.toFixed(2)}
          </div>
        </div>
        <ChevronRight size={16} color="var(--lt)" />
      </div>
      <div style={{ padding: '10px 16px', overflowX: 'auto' }} className="hide-scroll">
        <OrderTracker status={order.status} />
      </div>
    </div>
  )
}

function OrderDetail({ order, items, onBack }) {
  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  return (
    <div className="page-enter">
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px',
        background: 'none', border: 'none', color: 'var(--g3)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer'
      }}>
        ← Back to Orders
      </button>

      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 22, fontWeight: 700, color: 'var(--g1)' }}>
                {order.reference}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--mu)', marginTop: 2 }}>{date}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <OrderTracker status={order.status} />
          {order.estimated_delivery && (
            <div style={{
              marginTop: 12, background: 'var(--gll)', border: '1px solid var(--gl)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Truck size={16} color="var(--g3)" />
              <span>Estimated delivery: <strong>{new Date(order.estimated_delivery).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>
            Items Ordered
          </h3>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: '1px solid var(--brl)', alignItems: 'center'
            }}>
              {item.image && (
                <img src={item.image} alt={item.name}
                  style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--mu)' }}>
                  {item.qty} {item.unit} × £{item.price?.toFixed(2)}
                </div>
              </div>
              <div style={{ fontFamily: 'Fraunces,serif', fontWeight: 700, color: 'var(--g2)' }}>
                £{item.subtotal?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>
            Payment Summary
          </h3>
          {[
            { label: 'Subtotal', val: `£${order.subtotal?.toFixed(2)}` },
            { label: 'Delivery', val: order.delivery_fee === 0 ? 'FREE 🎉' : `£${order.delivery_fee?.toFixed(2)}` },
            ...(order.discount > 0 ? [{ label: 'Discount', val: `-£${order.discount?.toFixed(2)}` }] : []),
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
              <span style={{ color: 'var(--mu)' }}>{row.label}</span>
              <span style={{ fontWeight: 600 }}>{row.val}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '1px solid var(--br)', paddingTop: 10, marginTop: 4,
            fontFamily: 'Fraunces,serif', fontSize: 18, fontWeight: 700
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--g2)' }}>£{order.total?.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 8 }}>
            Payment: {order.payment_method?.replace(/_/g, ' ')} ·{' '}
            <span style={{ color: order.payment_status === 'paid' ? 'var(--g3)' : 'var(--am)', fontWeight: 600 }}>
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Help */}
        <div style={{
          background: 'var(--gll)', border: '1px solid var(--gl)',
          borderRadius: 14, padding: 16, textAlign: 'center'
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Need help with this order?</div>
          <p style={{ fontSize: 12.5, color: 'var(--mu)', marginBottom: 12 }}>
            Contact us at <strong>support@agrenes.co.uk</strong>
          </p>
          <button className="btn-outline" style={{ fontSize: 13 }}>Contact Support</button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return

    // Initial load
    supabase.from('orders').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })

    // Real-time subscription — status updates appear instantly
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
        if (selected?.id === payload.new.id) setSelected(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const selectOrder = async (order) => {
    setSelected(order)
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id)
    setSelectedItems(data || [])
  }

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
      <h2 style={{ marginBottom: 8 }}>Sign in to view orders</h2>
      <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: 12 }}>
        Sign In
      </button>
    </div>
  )

  if (selected) return <OrderDetail order={selected} items={selectedItems} onBack={() => setSelected(null)} />

  const FILTERS = ['all', 'pending', 'in_transit', 'delivered', 'cancelled']
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter || (filter === 'in_transit' && ['dispatched','in_transit','customs','out_for_delivery'].includes(o.status)))

  return (
    <div className="page-enter">
      <div style={{ padding: '18px 16px 12px' }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>My Orders</h1>
        <p style={{ fontSize: 13, color: 'var(--mu)' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filter tabs */}
      <div className="hide-scroll" style={{
        display: 'flex', gap: 8, padding: '0 14px 14px', overflowX: 'auto'
      }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
            flexShrink: 0, cursor: 'pointer', transition: 'all .18s',
            background: filter === f ? 'var(--g2)' : 'var(--wh)',
            color: filter === f ? '#fff' : 'var(--mu)',
            border: `1px solid ${filter === f ? 'var(--g2)' : 'var(--br)'}`
          }}>
            {f === 'all' ? 'All' : f === 'in_transit' ? '✈️ In Transit' : f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 14px' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card" style={{ marginBottom: 12, padding: 16 }}>
              <div className="skel" style={{ height: 16, marginBottom: 10, width: '50%' }} />
              <div className="skel" style={{ height: 12, marginBottom: 12, width: '30%' }} />
              <div className="skel" style={{ height: 40 }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--lt)' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: .3 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>No orders yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Your orders will appear here</p>
            <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: 20 }}>
              Start Shopping
            </button>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard key={order.id} order={order} onSelect={selectOrder} />
          ))
        )}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../lib/store'
import { amountToFreeUK, isUKCountry } from '../../lib/shipping'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { items, isOpen, closeCart, updateQty, removeItem, total, country } = useCartStore()
  // Pull dynamic delivery from the store — respects weight, country, and free-over threshold
  const deliveryFee = useCartStore.getState().deliveryFee()
  const finalTotal = total + deliveryFee
  const showFreeNudge = isUKCountry(country) && deliveryFee > 0

  const goCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {isOpen && <div className="overlay" onClick={closeCart} />}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} color="var(--g3)" />
            My Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.qty, 0)})`}
          </h2>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', color: 'var(--mu)' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--lt)' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: .3 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Add fresh produce to get started</p>
              <button onClick={closeCart} className="btn-primary" style={{ marginTop: 20 }}>
                Browse Products
              </button>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--brl)' }}>
              <img src={item.images?.[0] || item.img} alt={item.name} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 8 }}>
                  per {item.unit || 'unit'} {item.vendor_name ? '· ' + item.vendor_name : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--br)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: 'var(--brl)', border: 'none', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx)' }}><Minus size={12} /></button>
                    <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: 'var(--brl)', border: 'none', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx)' }}><Plus size={12} /></button>
                  </div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: 'var(--g2)' }}>
                    £{(item.price * item.qty).toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'var(--rdl)', border: 'none', color: 'var(--rd)', borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--br)', background: 'var(--gll)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: 'var(--mu)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>£{total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--mu)' }}>Delivery ({isUKCountry(country) ? '🇬🇧 UK' : '🌍 Intl'})</span>
              {deliveryFee === 0
                ? <span style={{ color: 'var(--g3)', fontWeight: 700 }}>FREE 🎉</span>
                : <span style={{ fontWeight: 600 }}>£{deliveryFee.toFixed(2)}</span>
              }
            </div>
            {showFreeNudge && (
              <div style={{ background: 'var(--aml)', border: '1px solid #FAC775', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--amd)', marginBottom: 12, fontWeight: 500 }}>
                Add £{amountToFreeUK(total).toFixed(2)} more for free UK delivery!
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--g2)' }}>£{finalTotal.toFixed(2)}</span>
            </div>
            <button onClick={goCheckout} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

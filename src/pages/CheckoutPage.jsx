import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ShieldCheck, Lock } from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise, createPaymentIntent } from '../lib/stripe'
import { useCartStore, useAuthStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { validatePromoCode } from './PromoCodeLogic'
import toast from 'react-hot-toast'

const STEPS = ['Delivery', 'Payment', 'Confirmed']

// ── STRIPE PAYMENT FORM ──────────────────────────────────────
function StripePaymentForm({ clientSecret, onSuccess, onBack, grandTotal }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setErrorMsg('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/orders',
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMsg(error.message || 'Payment failed. Please try again.')
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else {
      setErrorMsg('Unexpected payment status. Please contact support.')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePay}>
      <div style={{ marginBottom: 20 }}>
        <PaymentElement options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          fields: { billingDetails: { name: 'auto', email: 'auto' } },
        }} />
      </div>

      {errorMsg && (
        <div style={{
          background: 'var(--rdl)', border: '1px solid #F4B0B4',
          borderRadius: 10, padding: '11px 14px', fontSize: 13,
          color: 'var(--rd)', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{
        background: 'var(--gll)', border: '1px solid var(--gl)',
        borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: 'var(--mu)',
        display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16
      }}>
        <Lock size={14} color="var(--g3)" />
        Secured by Stripe · 256-bit SSL · AGRENES never stores card details
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack} className="btn-outline" style={{ flex: 1, justifyContent: 'center', height: 50 }}>
          ← Back
        </button>
        <button type="submit" disabled={!stripe || processing} className="btn-primary"
          style={{ flex: 2, justifyContent: 'center', height: 50, fontSize: 15, opacity: processing ? .75 : 1 }}>
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              Processing…
            </span>
          ) : (
            <>🔒 Pay £{grandTotal.toFixed(2)}</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}

// ── MAIN CHECKOUT ────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const { user, profile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)

  const deliveryFee = total >= 75 ? 0 : 6.99
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoObj, setPromoObj] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const grandTotal = total + deliveryFee - promoDiscount

  const [orderType, setOrderType] = useState('retail')
  const [delivery, setDelivery] = useState({
    fullName: profile?.full_name || '', phone: profile?.phone || '',
    line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom'
  })
  const setD = (k, v) => setDelivery(f => ({ ...f, [k]: v }))

  // Load saved addresses
  useEffect(() => {
    if (!user) return
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => {
        setSavedAddresses(data || [])
        const def = data?.find(a => a.is_default)
        if (def) {
          setSelectedAddress(def.id)
          setDelivery({
            fullName: def.full_name, phone: def.phone || '',
            line1: def.line1, line2: def.line2 || '',
            city: def.city, postcode: def.postcode, country: def.country
          })
        }
      })
  }, [user])

  const applyPromo = async () => {
    setPromoLoading(true); setPromoError('')
    const result = await validatePromoCode(promoCode, total)
    if (result.error) { setPromoError(result.error); setPromoDiscount(0); setPromoObj(null) }
    else { setPromoDiscount(result.discount); setPromoObj(result.promo); toast.success(`Code applied! -£${result.discount.toFixed(2)}`) }
    setPromoLoading(false)
  }

  const pickSavedAddress = (addr) => {
    setSelectedAddress(addr.id)
    setDelivery({ fullName: addr.full_name, phone: addr.phone || '', line1: addr.line1, line2: addr.line2 || '', city: addr.city, postcode: addr.postcode, country: addr.country })
  }

  // Step 0 → 1: Create order + PaymentIntent
  const proceedToPayment = async () => {
    if (!delivery.fullName || !delivery.line1 || !delivery.city || !delivery.postcode) {
      toast.error('Please fill in all required delivery fields'); return
    }
    setLoading(true)
    try {
      // Create pending order in DB
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'pending',
        order_type: orderType,
        subtotal: total,
        delivery_fee: deliveryFee,
        discount: promoDiscount,
        total: grandTotal,
        currency: 'GBP',
        payment_method: 'card',
        payment_status: 'pending',
        notes: `Delivery: ${delivery.fullName}, ${delivery.line1}${delivery.line2 ? ', ' + delivery.line2 : ''}, ${delivery.city}, ${delivery.postcode}, ${delivery.country}`,
      }).select().single()
      if (orderErr) throw orderErr

      // Insert order items
      await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: order.id,
          product_id: i.id,
          vendor_id: i.vendor_id,
          name: i.name,
          image: i.images?.[0] || i.img,
          price: i.price,
          qty: i.qty,
          unit: i.unit,
          subtotal: i.price * i.qty,
        }))
      )

      // Create Stripe PaymentIntent
      const { clientSecret: cs } = await createPaymentIntent({
        amount: grandTotal,
        currency: 'gbp',
        orderId: order.id,
        customerEmail: user.email,
      })

      setOrderId(order.id)
      setOrderRef(order.reference)
      setClientSecret(cs)
      setStep(1)
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Called after Stripe confirms payment
  const handlePaymentSuccess = async (paymentIntentId) => {
    // Deduct stock
    for (const item of items) {
      if (item.id) {
        const { data: prod } = await supabase.from('products').select('stock_qty,sales_count').eq('id', item.id).single()
        if (prod) {
          await supabase.from('products').update({
            stock_qty: Math.max(0, (prod.stock_qty || 0) - item.qty),
            sales_count: (prod.sales_count || 0) + item.qty
          }).eq('id', item.id)
        }
      }
    }
    clearCart()
    setStep(2)
    toast.success('Payment confirmed! 🎉')
  }

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h2 style={{ marginBottom: 8 }}>Sign in to checkout</h2>
      <button onClick={() => navigate('/login')} className="btn-primary" style={{ marginTop: 12 }}>Sign In / Register</button>
    </div>
  )

  if (items.length === 0 && step < 2) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
      <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
      <button onClick={() => navigate('/shop')} className="btn-primary" style={{ marginTop: 12 }}>Shop Now</button>
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        {step < 2 && (
          <button onClick={() => step > 0 ? setStep(0) : navigate(-1)} style={{
            background: 'none', border: 'none', color: 'var(--g3)',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <h1 style={{ fontSize: 18 }}>Checkout</h1>
      </div>

      {/* Step indicators */}
      {step < 2 && (
        <div style={{ display: 'flex', gap: 0, padding: '16px 16px 0', alignItems: 'center' }}>
          {STEPS.slice(0, 2).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 'none' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: i < step ? 'var(--g4)' : i === step ? 'var(--g2)' : 'var(--br)',
                color: i <= step ? '#fff' : 'var(--lt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, marginLeft: 6, color: i === step ? 'var(--tx)' : 'var(--lt)', whiteSpace: 'nowrap' }}>{s}</span>
              {i < 1 && <div style={{ flex: 1, height: 1, background: 'var(--br)', margin: '0 10px' }} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── STEP 0: DELIVERY ── */}
        {step === 0 && (
          <>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Order Type</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: '🛍️ Retail', val: 'retail' }, { label: '📦 Bulk / Wholesale', val: 'bulk' }].map(t => (
                  <button key={t.val} onClick={() => setOrderType(t.val)} style={{
                    flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: orderType === t.val ? 'var(--g2)' : 'var(--bg)',
                    color: orderType === t.val ? '#fff' : 'var(--mu)',
                    border: `1px solid ${orderType === t.val ? 'var(--g2)' : 'var(--br)'}`,
                    cursor: 'pointer', transition: 'all .2s'
                  }}>{t.label}</button>
                ))}
              </div>
            </div>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15 }}>Saved Addresses</h3>
                  <button onClick={() => navigate('/account/addresses')} style={{ fontSize: 12, color: 'var(--g3)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    + Add New
                  </button>
                </div>
                {savedAddresses.map(addr => (
                  <div key={addr.id} onClick={() => pickSavedAddress(addr)} style={{
                    border: `1.5px solid ${selectedAddress === addr.id ? 'var(--g3)' : 'var(--br)'}`,
                    borderRadius: 10, padding: '11px 14px', marginBottom: 8, cursor: 'pointer',
                    background: selectedAddress === addr.id ? 'var(--gll)' : 'var(--wh)', transition: 'all .15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{addr.label} — {addr.full_name}</div>
                      {selectedAddress === addr.id && <Check size={15} color="var(--g3)" />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
                      {addr.line1}, {addr.city}, {addr.postcode}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual address form */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>
                {savedAddresses.length > 0 ? 'Or Enter a New Address' : 'Delivery Address'}
              </h3>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" placeholder="Jane Smith" value={delivery.fullName} onChange={e => setD('fullName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" placeholder="+44 7700 000000" value={delivery.phone} onChange={e => setD('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address Line 1 *</label>
                <input className="form-input" placeholder="123 High Street" value={delivery.line1} onChange={e => setD('line1', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address Line 2</label>
                <input className="form-input" placeholder="Flat 4B (optional)" value={delivery.line2} onChange={e => setD('line2', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input className="form-input" placeholder="London" value={delivery.city} onChange={e => setD('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Postcode *</label>
                  <input className="form-input" placeholder="SW1A 1AA" value={delivery.postcode} onChange={e => setD('postcode', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <select className="form-input" value={delivery.country} onChange={e => setD('country', e.target.value)}>
                  {['United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Netherlands', 'Uganda', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Promo code */}
            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Promo Code</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Enter code (e.g. AGRENES10)" style={{ flex: 1 }}
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoDiscount(0); setPromoObj(null) }}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                />
                <button onClick={applyPromo} disabled={!promoCode || promoLoading} style={{
                  background: promoObj ? 'var(--g4)' : 'var(--g2)', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '0 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  opacity: !promoCode ? 0.5 : 1, flexShrink: 0, height: 46
                }}>{promoLoading ? '…' : promoObj ? '✓ Applied' : 'Apply'}</button>
              </div>
              {promoError && <p style={{ fontSize: 12, color: 'var(--rd)', marginTop: 6 }}>{promoError}</p>}
              {promoObj && <p style={{ fontSize: 12, color: 'var(--g3)', marginTop: 6, fontWeight: 600 }}>✓ {promoObj.code} — saving £{promoDiscount.toFixed(2)}</p>}
            </div>

            {/* Order summary */}
            <div className="card" style={{ padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>
                Order Summary ({items.reduce((s, i) => s + i.qty, 0)} items)
              </h3>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <img src={item.images?.[0] || item.img} alt={item.name}
                    style={{ width: 40, height: 40, borderRadius: 7, objectFit: 'cover', flexShrink: 0, background: 'var(--brl)' }} />
                  <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--g2)', flexShrink: 0 }}>×{item.qty} · £{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--br)', paddingTop: 10, marginTop: 8 }}>
                <Row label="Subtotal" val={`£${total.toFixed(2)}`} />
                <Row label="Delivery" val={deliveryFee === 0 ? 'FREE 🎉' : `£${deliveryFee.toFixed(2)}`} valColor={deliveryFee === 0 ? 'var(--g3)' : undefined} />
                {promoDiscount > 0 && <Row label={`Promo (${promoObj?.code})`} val={`-£${promoDiscount.toFixed(2)}`} valColor="var(--g3)" />}
                <Row label="Total" val={`£${grandTotal.toFixed(2)}`} bold />
              </div>
            </div>

            <button onClick={proceedToPayment} disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: 50, fontSize: 15, borderRadius: 12 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  Setting up payment…
                </span>
              ) : <>Continue to Payment →</>}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </>
        )}

        {/* ── STEP 1: STRIPE PAYMENT ── */}
        {step === 1 && clientSecret && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16 }}>Secure Payment</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {['VISA', 'MC', 'AMEX'].map(b => (
                  <span key={b} style={{ fontSize: 9, fontWeight: 800, background: 'var(--brl)', border: '1px solid var(--br)', borderRadius: 4, padding: '3px 6px', color: 'var(--mu)' }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Order summary reminder */}
            <div style={{ background: 'var(--gll)', border: '1px solid var(--gl)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--mu)', fontWeight: 600 }}>Order Total</div>
                <div style={{ fontFamily: 'Fraunces,serif', fontSize: 20, fontWeight: 700, color: 'var(--g2)' }}>£{grandTotal.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--mu)', textAlign: 'right' }}>
                <div>Delivering to:</div>
                <div style={{ fontWeight: 600, color: 'var(--tx)' }}>{delivery.city}, {delivery.postcode}</div>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0F7A5E',
                  colorBackground: '#ffffff',
                  colorText: '#1A1A18',
                  colorDanger: '#E63946',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                  borderRadius: '10px',
                  spacingUnit: '4px',
                }
              }
            }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                grandTotal={grandTotal}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep(0)}
              />
            </Elements>
          </div>
        )}

        {step === 1 && !clientSecret && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--br)', borderTopColor: 'var(--g3)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--mu)' }}>Loading secure payment form…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* ── STEP 2: CONFIRMED ── */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 26, marginBottom: 10, color: 'var(--g2)' }}>Payment Confirmed!</h2>
            <p style={{ fontSize: 14, color: 'var(--mu)', lineHeight: 1.7, marginBottom: 24 }}>
              Your order has been paid and confirmed. Our team in Kampala will prepare and dispatch your fresh produce on the next available flight.
            </p>
            <div style={{ background: 'var(--gll)', border: '1px solid var(--gl)', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--g2)', marginBottom: 6 }}>Order Reference</div>
              <div style={{ fontFamily: 'Fraunces,serif', fontSize: 26, fontWeight: 700, color: 'var(--g1)' }}>{orderRef}</div>
              <div style={{ fontSize: 12.5, color: 'var(--mu)', marginTop: 8 }}>
                ✈️ Entebbe → Gatwick · Estimated delivery: 2–4 working days
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--mu)', marginTop: 4 }}>
                📧 Confirmation sent to {user?.email}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('/orders')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 48 }}>
                Track My Order →
              </button>
              <button onClick={() => navigate('/shop')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', height: 48 }}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, val, bold, valColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 500, fontFamily: bold ? 'Fraunces,serif' : undefined }}>
      <span style={{ color: bold ? 'var(--tx)' : 'var(--mu)' }}>{label}</span>
      <span style={{ color: valColor || (bold ? 'var(--g2)' : 'var(--tx)') }}>{val}</span>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Truck, ShieldCheck, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkEnquiryPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '', name: '', email: '', phone: '', country: 'United Kingdom',
    businessType: '', products: [], otherProduct: '', volume: '', frequency: '',
    delivery: '', notes: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const PRODUCTS = ['Hass Avocados','Hot Peppers','Eggplant / Aubergine','Chilli','Tomatoes','Ginger','Matoke / Plantain','Fine Beans','Passion Fruit','Sweet Potato','Cassava','Other']
  const toggleProduct = (p) => set('products', form.products.includes(p) ? form.products.filter(x => x !== p) : [...form.products, p])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company || !form.email || form.products.length === 0) {
      toast.error('Please fill in all required fields and select at least one product')
      return
    }
    // In production: POST to your backend / Supabase Edge Function / EmailJS
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    toast.success('Enquiry submitted! We\'ll respond within 24 hours.')
  }

  if (submitted) return (
    <div className="page-enter" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>📦</div>
      <h2 style={{ fontSize: 24, marginBottom: 10, color: 'var(--g2)' }}>Enquiry Received!</h2>
      <p style={{ fontSize: 14, color: 'var(--mu)', lineHeight: 1.7, marginBottom: 24 }}>
        Thank you, <strong>{form.name}</strong>. Our wholesale team will review your enquiry and respond within 24 hours at <strong>{form.email}</strong>.
      </p>
      <div className="card" style={{ padding: 18, marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)', marginBottom: 10 }}>Your Enquiry Summary</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div><strong>Company:</strong> {form.company}</div>
          <div><strong>Products:</strong> {form.products.join(', ')}</div>
          <div><strong>Volume:</strong> {form.volume}</div>
          <div><strong>Frequency:</strong> {form.frequency}</div>
        </div>
      </div>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 48 }}>Back to Home</button>
    </div>
  )

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2D1B69, #6C3FC5)', padding: '20px 16px 28px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, marginBottom: 14, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontFamily: 'Fraunces,serif', marginBottom: 8 }}>Bulk & Wholesale Enquiry</h1>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13 }}>For restaurants, grocers, distributors and importers</p>
      </div>

      {/* Why bulk */}
      <div className="hide-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '14px 14px 4px' }}>
        {[
          { icon: <Package size={16} color="var(--pu)" />, label: 'Min. 50kg orders', bg: 'var(--pul)' },
          { icon: <Truck size={16} color="var(--g3)" />, label: '4× weekly flights', bg: 'var(--gl)' },
          { icon: <ShieldCheck size={16} color="var(--g3)" />, label: 'GAP & UNBS certified', bg: 'var(--gl)' },
          { icon: <Clock size={16} color="var(--am)" />, label: 'Quote within 24hrs', bg: 'var(--aml)' },
        ].map(item => (
          <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: '10px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600 }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '14px 14px 0' }}>
        <div className="card" style={{ padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Business Details</h3>
          <div className="form-group">
            <label>Company / Organisation Name *</label>
            <input className="form-input" placeholder="e.g. Fresh Market Ltd" value={form.company} onChange={e => set('company', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Type *</label>
            <select className="form-input" value={form.businessType} onChange={e => set('businessType', e.target.value)} required>
              <option value="">Select type</option>
              {['Supermarket / Grocer','Restaurant / Catering','Wholesale Distributor','Food Processor','Importer / Exporter','Online Retailer','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name *</label>
              <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" placeholder="+44 7700 000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select className="form-input" value={form.country} onChange={e => set('country', e.target.value)}>
                {['United Kingdom','United States','Canada','Germany','France','Netherlands','Uganda','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Products Required *</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PRODUCTS.map(p => (
              <label key={p} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                background: form.products.includes(p) ? 'var(--gll)' : 'var(--brl)',
                border: `1.5px solid ${form.products.includes(p) ? 'var(--g4)' : 'var(--br)'}`,
                transition: 'all .15s', fontWeight: form.products.includes(p) ? 600 : 400
              }}>
                <input type="checkbox" checked={form.products.includes(p)} onChange={() => toggleProduct(p)}
                  style={{ accentColor: 'var(--g3)', flexShrink: 0 }} />
                {p}
              </label>
            ))}
          </div>
          {form.products.includes('Other') && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Specify Other Product</label>
              <input className="form-input" placeholder="e.g. Bitter melon, Arrow roots..." value={form.otherProduct} onChange={e => set('otherProduct', e.target.value)} />
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 18, marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Order Requirements</h3>
          <div className="form-group">
            <label>Estimated Volume per Order</label>
            <select className="form-input" value={form.volume} onChange={e => set('volume', e.target.value)}>
              <option value="">Select range</option>
              {['50–100 kg','100–500 kg','500 kg – 1 tonne','1–5 tonnes','5–12 tonnes','12+ tonnes / full consignment'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Order Frequency</label>
            <select className="form-input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              <option value="">Select frequency</option>
              {['One-time order','Weekly','Bi-weekly','Monthly','Quarterly','Flexible / TBD'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Preferred Delivery / Incoterms</label>
            <select className="form-input" value={form.delivery} onChange={e => set('delivery', e.target.value)}>
              <option value="">Select option</option>
              {['DDP (Delivered Duty Paid)','DAP (Delivered at Place)','FOB Entebbe','CIF Gatwick','Ex-Works Packhouse','Discuss with AGRENES'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea className="form-input" rows={3} placeholder="Packaging requirements, certifications needed, target price, etc."
              value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 50, fontSize: 15, borderRadius: 12 }}>
          📦 Submit Bulk Enquiry
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--lt)', marginTop: 10 }}>
          Our wholesale team responds within 24 hours on business days.
        </p>
      </form>
    </div>
  )
}

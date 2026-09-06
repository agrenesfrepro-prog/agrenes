import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import toast from 'react-hot-toast'

export default function AddressesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom', is_default: false })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!user) return
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => { setAddresses(data || []); setLoading(false) })
  }, [user])

  const save = async () => {
    if (!form.full_name || !form.line1 || !form.city || !form.postcode) {
      toast.error('Please fill in all required fields'); return
    }
    if (form.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    }
    const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id })
    if (error) { toast.error(error.message); return }
    toast.success('Address saved!')
    setShowForm(false)
    setForm({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom', is_default: false })
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
    setAddresses(data || [])
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this address?')) return
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
    toast.success('Address removed')
  }

  const setDefault = async (id) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
    setAddresses(data || [])
    toast.success('Default address updated')
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--br)', background: 'var(--wh)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--g3)', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={20} /></button>
        <h1 style={{ fontSize: 18 }}>Delivery Addresses</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginLeft: 'auto', fontSize: 12, padding: '8px 14px', height: 36 }}>
          <Plus size={14} /> Add New
        </button>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        {loading ? (
          [1, 2].map(i => <div key={i} className="card skel" style={{ height: 100, marginBottom: 12 }} />)
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--lt)' }}>
            <MapPin size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>No saved addresses</p>
            <p style={{ fontSize: 13 }}>Add an address to speed up checkout</p>
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 16 }}><Plus size={15} /> Add Address</button>
          </div>
        ) : addresses.map(addr => (
          <div key={addr.id} className="card" style={{ marginBottom: 12, padding: '14px 16px', position: 'relative' }}>
            {addr.is_default && (
              <span style={{ position: 'absolute', top: 10, right: 12, background: 'var(--gl)', color: 'var(--g2)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                ✓ Default
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--gll)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={16} color="var(--g3)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{addr.label} — {addr.full_name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--mu)', lineHeight: 1.6 }}>
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                  {addr.city}, {addr.postcode}, {addr.country}
                </div>
                {addr.phone && <div style={{ fontSize: 12, color: 'var(--lt)', marginTop: 2 }}>{addr.phone}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {!addr.is_default && (
                <button onClick={() => setDefault(addr.id)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--g3)', background: 'var(--gll)', border: '1px solid var(--gl)', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} /> Set as Default
                </button>
              )}
              <button onClick={() => remove(addr.id)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--rd)', background: 'var(--rdl)', border: '1px solid #F4B0B4', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add address modal */}
      {showForm && (
        <div className="modal">
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="modal-box">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--wh)', zIndex: 1 }}>
              <h2 style={{ fontSize: 16 }}>New Address</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--mu)' }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Label</label>
                  <select className="form-input" value={form.label} onChange={e => set('label', e.target.value)}>
                    {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-input" placeholder="Jane Smith" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" placeholder="+44 7700 000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address Line 1 *</label>
                <input className="form-input" placeholder="123 High Street" value={form.line1} onChange={e => set('line1', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address Line 2</label>
                <input className="form-input" placeholder="Flat 4B (optional)" value={form.line2} onChange={e => set('line2', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input className="form-input" placeholder="London" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Postcode *</label>
                  <input className="form-input" placeholder="SW1A 1AA" value={form.postcode} onChange={e => set('postcode', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Country</label>
                <select className="form-input" value={form.country} onChange={e => set('country', e.target.value)}>
                  {['United Kingdom', 'United States', 'Canada', 'Uganda', 'Germany', 'France', 'Netherlands', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 18, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)} style={{ accentColor: 'var(--g3)', width: 16, height: 16 }} />
                Set as default delivery address
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={save} className="btn-primary" style={{ flex: 2, justifyContent: 'center', height: 46 }}>Save Address</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

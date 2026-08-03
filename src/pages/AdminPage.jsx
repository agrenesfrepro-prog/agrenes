import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Package, Users, ShoppingBag, TrendingUp, Upload, X, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import toast from 'react-hot-toast'

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>{label}</div>
      </div>
      <div style={{ fontFamily: 'Fraunces,serif', fontSize: 28, fontWeight: 700, color: 'var(--tx)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ImageUploader({ images, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)

  // Compress image before upload — always resolves with something usable (compressed OR original file)
  const compressImage = (file, maxWidth = 1200, quality = 0.82) => {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            let { width, height } = img
            if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
            canvas.width = width; canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob || file) }, 'image/jpeg', quality)
          } catch { URL.revokeObjectURL(url); resolve(file) }
        }
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
        img.src = url
      } catch { resolve(file) }
    })
  }

  const handleFiles = async (files) => {
    if (!files?.length) return
    setUploading(true)
    const uploaded = []
    for (const file of files) {
      try {
        const compressed = await compressImage(file)
        const blob = compressed || file
        const isJpeg = blob && blob.type && blob.type.includes('jpeg')
        const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const ext = isJpeg ? 'jpg' : rawExt
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const contentType = isJpeg ? 'image/jpeg' : (file.type || 'image/jpeg')
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, blob, { contentType, upsert: true })
        if (error) {
          toast.error('Upload failed: ' + error.message)
        } else {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
          uploaded.push(urlData.publicUrl)
        }
      } catch (err) {
        toast.error('Upload failed: ' + (err?.message || 'unknown error'))
      }
    }
    onChange([...images, ...uploaded])
    setUploading(false)
    if (uploaded.length) toast.success(uploaded.length + ' image(s) uploaded!')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) await handleFiles([file])
      }
    }
  }

  return (
    <div>
      {/* Preview */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--br)' }} />
              <button onClick={() => removeImage(i)} style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--rd)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 20, height: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onPaste={handlePaste}
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        style={{
          border: '2px dashed var(--br)', borderRadius: 10,
          padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
          background: 'var(--brl)', transition: 'all .2s', outline: 'none'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--g3)'; e.currentTarget.style.background = 'var(--gll)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.background = 'var(--brl)' }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--g3)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--br)' }}
      >
        {uploading ? (
          <div style={{ color: 'var(--g3)', fontSize: 13, fontWeight: 600 }}>⏳ Uploading...</div>
        ) : (
          <>
            <Upload size={24} color="var(--g3)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>
              Click to upload, drag & drop, or paste an image
            </div>
            <div style={{ fontSize: 12, color: 'var(--lt)' }}>PNG, JPG, WEBP supported</div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}

function ProductForm({ product, categories, vendors, onSave, onClose }) {
  const isEdit = !!product?.id
  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '', unit: 'kg',
    stock_qty: '', bulk_price: '', bulk_min_qty: '',
    category_id: '', vendor_id: '', origin: 'Uganda',
    is_featured: false, is_flash_deal: false, is_active: true,
    images: [], certifications: [], tags: [],
    ...(product || {})
  })
  const [saving, setSaving] = useState(false)
  const [variants, setVariants] = useState([])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Load existing variants when editing
  useEffect(() => {
    if (product?.id) {
      supabase.from('product_variants').select('*').eq('product_id', product.id).order('sort_order')
        .then(({ data }) => setVariants(data || []))
    }
  }, [product?.id])

  const addVariant = () => setVariants(v => [...v, { label: '', price: '', stock_qty: '', _new: true }])
  const updateVariant = (i, k, val) => setVariants(v => v.map((x, idx) => idx === i ? { ...x, [k]: val } : x))
  const removeVariant = (i) => setVariants(v => v.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        unit: form.unit,
        stock_qty: parseFloat(form.stock_qty) || 0,
        bulk_price: form.bulk_price ? parseFloat(form.bulk_price) : null,
        bulk_min_qty: form.bulk_min_qty ? parseFloat(form.bulk_min_qty) : null,
        category_id: form.category_id || null,
        vendor_id: form.vendor_id || null,
        origin: form.origin,
        is_featured: form.is_featured,
        is_flash_deal: form.is_flash_deal,
        is_active: form.is_active,
        images: form.images || [],
        certifications: form.certifications || [],
        tags: form.tags || [],
        updated_at: new Date().toISOString(),
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      }
      let error
      if (isEdit) {
        ({ error } = await supabase.from('products').update(payload).eq('id', product.id))
      } else {
        ({ error } = await supabase.from('products').insert(payload))
      }
      if (error) throw error

      // Save variants
      let productId = product?.id
      if (!isEdit) {
        const { data: newProd } = await supabase.from('products').select('id').eq('slug', payload.slug).single()
        productId = newProd?.id
      }
      if (productId && variants.length > 0) {
        // Delete removed variants, upsert the rest
        await supabase.from('product_variants').delete().eq('product_id', productId)
        const validVariants = variants.filter(v => v.label && v.price)
        if (validVariants.length > 0) {
          await supabase.from('product_variants').insert(
            validVariants.map((v, i) => ({
              product_id: productId,
              label: v.label,
              price: parseFloat(v.price),
              stock_qty: parseFloat(v.stock_qty) || 0,
              sort_order: i,
              is_active: true,
            }))
          )
        }
      }

      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9998 }} />
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto', position: 'relative', zIndex: 9999,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--br)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1
        }}>
          <h2 style={{ fontSize: 17 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--mu)' }}>×</button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Images */}
          <div className="form-group">
            <label>Product Images</label>
            <ImageUploader
              images={form.images || []}
              onChange={imgs => set('images', imgs)}
            />
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input className="form-input" placeholder="e.g. Ugandan Hass Avocados"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" rows={3} placeholder="Describe the product, origin, flavour profile..."
              value={form.description} onChange={e => set('description', e.target.value)}
              style={{ resize: 'vertical' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Retail Price (£) *</label>
              <input className="form-input" type="number" step="0.01" placeholder="4.99"
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Compare Price (£)</label>
              <input className="form-input" type="number" step="0.01" placeholder="6.99"
                value={form.compare_price} onChange={e => set('compare_price', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unit</label>
              <select className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['kg', 'g', 'bunch', 'piece', 'box', 'crate', 'tray', 'bag'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stock Qty</label>
              <input className="form-input" type="number" placeholder="100"
                value={form.stock_qty} onChange={e => set('stock_qty', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bulk Price (£)</label>
              <input className="form-input" type="number" step="0.01" placeholder="3.50"
                value={form.bulk_price} onChange={e => set('bulk_price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bulk Min Qty</label>
              <input className="form-input" type="number" placeholder="50"
                value={form.bulk_min_qty} onChange={e => set('bulk_min_qty', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Vendor</label>
              <select className="form-input" value={form.vendor_id} onChange={e => set('vendor_id', e.target.value)}>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Certifications (comma separated)</label>
            <input className="form-input" placeholder="GAP, HACCP, UNBS"
              value={(form.certifications || []).join(', ')}
              onChange={e => set('certifications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input className="form-input" placeholder="fresh, organic, seasonal"
              value={(form.tags || []).join(', ')}
              onChange={e => set('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </div>

          <div className="form-group">
            <label>Origin</label>
            <input className="form-input" placeholder="Kampala, Uganda"
              value={form.origin} onChange={e => set('origin', e.target.value)} />
          </div>

          {/* Size variants */}
          <div className="form-group">
            <label>Size Options (e.g. 500g, 1kg, 2kg — optional)</label>
            {variants.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input className="form-input" placeholder="Label e.g. 500g" style={{ flex: 2 }}
                  value={v.label} onChange={e => updateVariant(i, 'label', e.target.value)} />
                <input className="form-input" type="number" step="0.01" placeholder="Price £" style={{ flex: 2 }}
                  value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} />
                <input className="form-input" type="number" placeholder="Stock" style={{ flex: 1 }}
                  value={v.stock_qty} onChange={e => updateVariant(i, 'stock_qty', e.target.value)} />
                <button type="button" onClick={() => removeVariant(i)} style={{
                  background: 'var(--rdl)', border: '1px solid #F4B0B4', borderRadius: 8,
                  width: 34, height: 40, cursor: 'pointer', color: 'var(--rd)', flexShrink: 0, fontSize: 16
                }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addVariant} style={{
              background: 'var(--gll)', border: '1px dashed var(--g4)', borderRadius: 8,
              padding: '9px 16px', fontSize: 12.5, fontWeight: 700, color: 'var(--g2)',
              cursor: 'pointer', width: '100%'
            }}>+ Add Size Option</button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { k: 'is_active', label: '✅ Active' },
              { k: 'is_featured', label: '⭐ Featured' },
              { k: 'is_flash_deal', label: '⚡ Flash Deal' },
            ].map(tog => (
              <label key={tog.k} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: form[tog.k] ? 'var(--gll)' : 'var(--brl)',
                border: '1px solid ' + (form[tog.k] ? 'var(--g4)' : 'var(--br)'),
                borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600
              }}>
                <input type="checkbox" checked={!!form[tog.k]} onChange={e => set(tog.k, e.target.checked)}
                  style={{ accentColor: 'var(--g3)', width: 15, height: 15 }} />
                {tog.label}
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [editProduct, setEditProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadAll()
  }, [profile])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: p }, { data: o }, { data: v }, { data: c }] = await Promise.all([
      supabase.from('products').select('*, vendors(name), categories(name)').order('created_at', { ascending: false }).limit(500),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('vendors').select('*').order('name'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProducts(p || [])
    setOrders(o || [])
    setVendors(v || [])
    setCategories(c || [])
    setStats({
      products: p?.length || 0,
      orders: o?.length || 0,
      revenue: o?.reduce((s, ord) => s + (ord.total || 0), 0) || 0,
      vendors: v?.length || 0,
      pending: o?.filter(ord => ord.status === 'pending').length || 0,
    })
    setLoading(false)
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Product deleted')
    loadAll()
  }

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    toast.success('Order status updated')
    loadAll()
  }

  const ORDER_STATUSES = ['pending','confirmed','preparing','dispatched','in_transit','customs','out_for_delivery','delivered','cancelled']
  const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'products', label: '🥬 Products' },
    { key: 'orders', label: '📦 Orders' },
    { key: 'vendors', label: '🏪 Vendors' },
  ]

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--g1), var(--g2))', padding: '20px 16px 16px' }}>
        <h1 style={{ color: '#fff', fontSize: 20, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>AGRENES Management Console</p>
      </div>

      <div className="hide-scroll" style={{ display: 'flex', background: 'var(--wh)', borderBottom: '1px solid var(--br)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '13px 18px', fontSize: 13, fontWeight: 700, flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: '2.5px solid ' + (tab === t.key ? 'var(--g4)' : 'transparent'),
            color: tab === t.key ? 'var(--g2)' : 'var(--mu)', transition: 'all .18s'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 14px' }}>
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <StatCard icon={<Package size={22} color="var(--g3)" />} label="Products" value={stats.products} color="var(--g3)" />
              <StatCard icon={<ShoppingBag size={22} color="var(--pu)" />} label="Orders" value={stats.orders} sub={(stats.pending || 0) + ' pending'} color="var(--pu)" />
              <StatCard icon={<TrendingUp size={22} color="var(--am)" />} label="Revenue" value={'£' + (stats.revenue || 0).toFixed(0)} color="var(--am)" />
              <StatCard icon={<Users size={22} color="var(--rd)" />} label="Vendors" value={stats.vendors} color="var(--rd)" />
            </div>
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)' }}>Recent Orders</h3>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--brl)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{o.reference}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{new Date(o.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <span style={{ fontFamily: 'Fraunces,serif', fontWeight: 700, color: 'var(--g2)' }}>£{o.total?.toFixed(2)}</span>
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--br)', background: 'var(--bg)', cursor: 'pointer' }}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              ))}
              {orders.length === 0 && <p style={{ fontSize: 13, color: 'var(--lt)', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 17 }}>Products ({products.length})</h2>
              <button onClick={() => { setEditProduct(null); setShowForm(true) }} className="btn-primary">
                <Plus size={16} /> Add Product
              </button>
            </div>
            {loading ? [1,2,3].map(i => <div key={i} className="card skel" style={{ height: 80, marginBottom: 10 }} />) :
            products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--lt)' }}>
                <Package size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
                <p style={{ fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>No products yet</p>
                <p style={{ fontSize: 13 }}>Click "Add Product" to get started</p>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--brl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={20} color="var(--lt)" /></div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>
                    {p.vendors?.name} · £{p.price}/{p.unit} · Stock: {p.stock_qty}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                    {p.is_featured && <span className="badge badge-amber" style={{ fontSize: 9 }}>⭐ Featured</span>}
                    {p.is_flash_deal && <span className="badge badge-red" style={{ fontSize: 9 }}>⚡ Flash</span>}
                    {!p.is_active && <span className="badge" style={{ background: 'var(--brl)', color: 'var(--lt)', fontSize: 9 }}>Hidden</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setEditProduct(p); setShowForm(true) }}
                    style={{ background: 'var(--gll)', border: '1px solid var(--gl)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--g2)' }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)}
                    style={{ background: 'var(--rdl)', border: '1px solid #F4B0B4', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--rd)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: 17, marginBottom: 14 }}>Orders ({orders.length})</h2>
            {orders.map(o => (
              <div key={o.id} className="card" style={{ marginBottom: 10, padding: '13px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Fraunces,serif', color: 'var(--g1)' }}>{o.reference}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{new Date(o.created_at).toLocaleDateString('en-GB')} · {o.order_type}</div>
                  </div>
                  <span style={{ fontFamily: 'Fraunces,serif', fontWeight: 700, fontSize: 17, color: 'var(--g2)' }}>£{o.total?.toFixed(2)}</span>
                </div>
                <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                  style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--br)', background: 'var(--bg)', cursor: 'pointer', width: '100%' }}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            ))}
            {orders.length === 0 && <p style={{ fontSize: 13, color: 'var(--lt)', textAlign: 'center', padding: '40px 0' }}>No orders yet</p>}
          </div>
        )}

        {tab === 'vendors' && (
          <div>
            <h2 style={{ fontSize: 17, marginBottom: 14 }}>Vendors ({vendors.length})</h2>
            {vendors.map(v => (
              <div key={v.id} className="card" style={{ marginBottom: 10, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{v.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{v.location} · {v.total_sales || 0} sales</div>
                </div>
                {v.is_verified
                  ? <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Verified</span>
                  : <button onClick={async () => { await supabase.from('vendors').update({ is_verified: true }).eq('id', v.id); toast.success('Verified!'); loadAll() }}
                    style={{ background: 'var(--aml)', border: '1px solid #FAC775', borderRadius: 8, fontSize: 11, fontWeight: 700, color: 'var(--amd)', padding: '4px 10px', cursor: 'pointer' }}>
                    Verify
                  </button>
                }
              </div>
            ))}
            {vendors.length === 0 && <p style={{ fontSize: 13, color: 'var(--lt)', textAlign: 'center', padding: '40px 0' }}>No vendors yet</p>}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          vendors={vendors}
          onSave={() => { setShowForm(false); loadAll() }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

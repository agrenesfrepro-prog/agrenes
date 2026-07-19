import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ProductCard from '../product/ProductCard'

const SORTS = [
  { label: 'Most Popular', value: 'sales_count.desc' },
  { label: 'Top Rated', value: 'rating.desc' },
  { label: 'Price: Low → High', value: 'price.asc' },
  { label: 'Price: High → Low', value: 'price.desc' },
  { label: 'Newest', value: 'created_at.desc' },
]

const CERTS = ['GAP / UNBS', 'MAAIF', 'Organic', 'HACCP', 'Global G.A.P']

function ProductSkeleton() {
  return (
    <div className="card" style={{overflow:'hidden'}}>
      <div className="skel" style={{height:160}}/>
      <div style={{padding:'10px 11px 12px'}}>
        <div className="skel" style={{height:12, marginBottom:8, width:'60%'}}/>
        <div className="skel" style={{height:14, marginBottom:8}}/>
        <div className="skel" style={{height:14, marginBottom:12, width:'40%'}}/>
        <div className="skel" style={{height:36, borderRadius:8}}/>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const catSlug = params.get('cat') || 'all'
  const searchQ = params.get('q') || ''
  const flashOnly = params.get('flash') === '1'
  const bulkOnly = params.get('bulk') === '1'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('sales_count.desc')
  const [showFilters, setShowFilters] = useState(false)
  const [priceMax, setPriceMax] = useState(50)
  const [selectedCerts, setSelectedCerts] = useState([])
  const [inStock, setInStock] = useState(false)
  const [categories, setCategories] = useState([])
  const [catMap, setCatMap] = useState({})

  // Load categories
  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (data) {
          setCategories(data)
          const map = {}
          data.forEach(c => { map[c.slug] = c.id })
          setCatMap(map)
        }
      })
  }, [])

  // Load products
  useEffect(() => {
    setLoading(true)
    const [sortCol, sortDir] = sort.split('.')

    let query = supabase
      .from('products')
      .select('*, vendors(name, is_verified)')
      .eq('is_active', true)
      .order(sortCol, { ascending: sortDir === 'asc' })
      .lte('price', priceMax)
      .limit(48)

    if (catSlug !== 'all' && catMap[catSlug]) {
      query = query.eq('category_id', catMap[catSlug])
    }
    if (searchQ) query = query.ilike('name', `%${searchQ}%`)
    if (flashOnly) query = query.eq('is_flash_deal', true)
    if (bulkOnly) query = query.not('bulk_price', 'is', null)
    if (inStock) query = query.gt('stock_qty', 0)
    if (selectedCerts.length > 0) query = query.overlaps('certifications', selectedCerts)

    query.then(({ data, error }) => {
      setProducts(data?.map(p => ({
        ...p,
        vendor_name: p.vendors?.name,
      })) || [])
      setLoading(false)
    })
  }, [catSlug, searchQ, sort, priceMax, selectedCerts, inStock, flashOnly, bulkOnly, catMap])

  const toggleCert = (c) =>
    setSelectedCerts(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c])

  const activeFilterCount = [
    priceMax < 50, selectedCerts.length > 0, inStock, flashOnly, bulkOnly
  ].filter(Boolean).length

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{
        padding:'14px 14px 12px', borderBottom:'1px solid var(--br)',
        background:'var(--wh)'
      }}>
        <h1 style={{fontSize:18, marginBottom:4, display:'flex', alignItems:'center', gap:8}}>
          {flashOnly && '⚡ Flash Deals'}
          {bulkOnly && '📦 Bulk / Wholesale'}
          {searchQ && `Results for "${searchQ}"`}
          {!flashOnly && !bulkOnly && !searchQ && (
            catSlug === 'all' ? '🥬 All Fresh Produce' : `${categories.find(c=>c.slug===catSlug)?.emoji} ${categories.find(c=>c.slug===catSlug)?.name}`
          )}
        </h1>
        {!loading && (
          <p style={{fontSize:12, color:'var(--mu)'}}>
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Filter + Sort bar */}
      <div style={{
        background:'var(--wh)', padding:'10px 14px',
        display:'flex', gap:8, alignItems:'center',
        borderBottom:'1px solid var(--br)', flexWrap:'wrap'
      }}>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          background: showFilters ? 'var(--g4)' : 'var(--bg)',
          border:'1px solid var(--br)', color: showFilters ? '#fff' : 'var(--mu)',
          padding:'7px 13px', borderRadius:20, fontSize:12, fontWeight:600,
          display:'flex', alignItems:'center', gap:6, cursor:'pointer'
        }}>
          <SlidersHorizontal size={14}/> Filters
          {activeFilterCount > 0 && (
            <span style={{
              background:'var(--rd)', color:'#fff', borderRadius:'50%',
              width:17, height:17, fontSize:9, fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center'
            }}>{activeFilterCount}</span>
          )}
        </button>

        {/* Active filter chips */}
        {flashOnly && <Chip label="⚡ Flash" onRemove={() => navigate(location.pathname)} />}
        {bulkOnly && <Chip label="📦 Bulk" onRemove={() => navigate(location.pathname)} />}
        {inStock && <Chip label="In Stock" onRemove={() => setInStock(false)} />}
        {selectedCerts.map(c => <Chip key={c} label={c} onRemove={() => toggleCert(c)} />)}

        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          marginLeft:'auto', background:'var(--bg)', border:'1px solid var(--br)',
          color:'var(--tx)', padding:'7px 13px', borderRadius:20, fontSize:12,
          fontWeight:600, outline:'none', cursor:'pointer'
        }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          background:'var(--wh)', borderBottom:'1px solid var(--br)',
          padding:14, display:'flex', gap:16, flexWrap:'wrap'
        }}>
          <div style={{flex:1, minWidth:140}}>
            <label style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:'var(--mu)', display:'block', marginBottom:8}}>
              Max Price: £{priceMax}
            </label>
            <input type="range" min={1} max={50} value={priceMax}
              onChange={e => setPriceMax(+e.target.value)}
              style={{width:'100%', accentColor:'var(--g3)'}}
            />
          </div>
          <div style={{flex:1, minWidth:140}}>
            <label style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:'var(--mu)', display:'block', marginBottom:8}}>
              Certification
            </label>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {CERTS.map(c => (
                <label key={c} style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, cursor:'pointer'}}>
                  <input type="checkbox" checked={selectedCerts.includes(c)}
                    onChange={() => toggleCert(c)}
                    style={{accentColor:'var(--g3)', width:15, height:15}}
                  /> {c}
                </label>
              ))}
            </div>
          </div>
          <div style={{flex:1, minWidth:140}}>
            <label style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:'var(--mu)', display:'block', marginBottom:8}}>
              Availability
            </label>
            <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, cursor:'pointer'}}>
              <input type="checkbox" checked={inStock} onChange={e=>setInStock(e.target.checked)}
                style={{accentColor:'var(--g3)', width:15, height:15}}
              /> In Stock Only
            </label>
            <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12.5, cursor:'pointer', marginTop:6}}>
              <input type="checkbox" checked={bulkOnly}
                onChange={e => navigate(e.target.checked ? `${location.pathname}?bulk=1` : location.pathname)}
                style={{accentColor:'var(--g3)', width:15, height:15}}
              /> Bulk / Wholesale
            </label>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="pgrid" style={{paddingTop:14}}>
          {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{textAlign:'center', padding:'60px 20px', color:'var(--lt)'}}>
          <div style={{fontSize:48, marginBottom:12}}>🔍</div>
          <p style={{fontSize:16, fontWeight:600, color:'var(--tx)'}}>No products found</p>
          <p style={{fontSize:13, marginTop:6}}>Try adjusting your filters or search term</p>
          <button onClick={() => navigate('/shop')} className="btn-primary" style={{marginTop:20}}>
            Browse All Produce
          </button>
        </div>
      ) : (
        <div className="pgrid" style={{paddingTop:14}}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span style={{
      background:'var(--gl)', color:'var(--g2)',
      border:'1px solid var(--g4)', borderRadius:20,
      padding:'4px 10px', fontSize:11.5, fontWeight:600,
      display:'flex', alignItems:'center', gap:4
    }}>
      {label}
      <button onClick={onRemove} style={{background:'none',border:'none',color:'var(--g2)',cursor:'pointer',lineHeight:1}}>
        <X size={11}/>
      </button>
    </span>
  )
}

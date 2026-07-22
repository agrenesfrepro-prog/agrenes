import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Zap, Star, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/product/ProductCard'

// ── HERO CAROUSEL ────────────────────────────────────────────
const SLIDES = [
  {
    bg: 'linear-gradient(135deg, #063D32 0%, #0F7A5E 100%)',
    badge: '🇺🇬 Direct from Uganda',
    title: "Uganda's Farm-Fresh\nProduce — UK Delivered",
    sub: 'GAP & UNBS certified. 4× weekly Entebbe→Gatwick flights. Retail & bulk orders welcome.',
    cta: 'Shop Fresh Now',
    cat: null,
    stats: [
      { n: '26+', l: 'Produce Lines' },
      { n: '4×', l: 'Flights/Week' },
      { n: '1,500+', l: 'Partner Farmers' },
    ]
  },
  {
    bg: 'linear-gradient(135deg, #2D1B69 0%, #6C3FC5 100%)',
    badge: '⚡ Flash Deals',
    title: 'Up to 40% Off\nToday Only',
    sub: 'Limited-time deals on premium Ugandan avocados, passion fruit and fine beans.',
    cta: 'Shop Flash Deals',
    cat: null,
    flash: true,
    stats: [
      { n: '40%', l: 'Max Saving' },
      { n: '12', l: 'Flash Items' },
    ]
  },
  {
    bg: 'linear-gradient(135deg, #8B1D1D 0%, #C53F3F 100%)',
    badge: '📦 Bulk Orders',
    title: 'Wholesale Rates\nFor Businesses',
    sub: 'Restaurants, grocers and distributors — order in bulk directly from certified Ugandan farms.',
    cta: 'View Bulk Deals',
    cat: null,
    bulk: true,
    stats: [
      { n: '48', l: 'Active Vendors' },
      { n: 'UNBS', l: 'Certified' },
    ]
  },
]

function HeroCarousel() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  const go = (i) => setIdx((i + SLIDES.length) % SLIDES.length)
  const reset = () => {
    clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(p => (p + 1) % SLIDES.length), 5000)
  }

  useEffect(() => { reset(); return () => clearInterval(timer.current) }, [])

  const s = SLIDES[idx]

  return (
    <div style={{background: s.bg, transition:'background .5s', position:'relative', overflow:'hidden'}}>
      <div style={{
        position:'absolute', right:-60, top:-60, width:220, height:220,
        borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none'
      }}/>
      <div style={{
        position:'absolute', right:60, bottom:-60, width:160, height:160,
        borderRadius:'50%', background:'rgba(255,255,255,.1)', pointerEvents:'none'
      }}/>

      <div style={{
        padding:'32px 20px 28px', position:'relative', zIndex:1,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        gap:16, flexWrap:'wrap', maxWidth:900, margin:'0 auto'
      }}>
        <div style={{maxWidth:360}}>
          <span style={{
            background:'rgba(255,255,255,.15)', color:'rgba(255,255,255,.9)',
            fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20,
            border:'1px solid rgba(255,255,255,.25)', display:'inline-block', marginBottom:12
          }}>{s.badge}</span>
          <h1 style={{
            fontFamily:'Fraunces, serif', fontSize:28, color:'#fff',
            lineHeight:1.2, marginBottom:10, whiteSpace:'pre-line'
          }}>{s.title}</h1>
          <p style={{
            color:'rgba(255,255,255,.75)', fontSize:13.5, lineHeight:1.65,
            marginBottom:20, maxWidth:300
          }}>{s.sub}</p>
          <button onClick={() => navigate(s.flash ? '/shop?flash=1' : s.bulk ? '/shop?bulk=1' : '/shop')}
            style={{
              background:'var(--am)', color:'var(--amd)', border:'none',
              padding:'12px 26px', borderRadius:10, fontWeight:800, fontSize:14,
              cursor:'pointer', transition:'all .2s'
            }}
            onMouseEnter={e => e.target.style.background='#f9b840'}
            onMouseLeave={e => e.target.style.background='var(--am)'}
          >{s.cta} →</button>
        </div>

        {/* Stats */}
        <div style={{display:'flex', gap:10, flexShrink:0}}>
          {s.stats.map(st => (
            <div key={st.l} style={{
              background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)',
              borderRadius:12, padding:'13px 16px', textAlign:'center', backdropFilter:'blur(6px)'
            }}>
              <div style={{fontFamily:'Fraunces, serif', color:'#fff', fontSize:22, fontWeight:700, lineHeight:1}}>{st.n}</div>
              <div style={{color:'rgba(255,255,255,.6)', fontSize:10, marginTop:3, fontWeight:500}}>{st.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {['‹','›'].map((arrow, ai) => (
        <button key={arrow} onClick={() => { go(idx + (ai ? 1 : -1)); reset() }}
          style={{
            position:'absolute', top:'50%', transform:'translateY(-50%)',
            [ai ? 'right' : 'left']: 10,
            background:'rgba(0,0,0,.3)', border:'none', color:'#fff',
            width:34, height:34, borderRadius:'50%', fontSize:18,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', backdropFilter:'blur(4px)', zIndex:2
          }}
        >{arrow}</button>
      ))}

      {/* Dots */}
      <div style={{display:'flex', gap:5, justifyContent:'center', padding:'10px 0 14px'}}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { go(i); reset() }} style={{
            width: i === idx ? 20 : 7,
            height:7, borderRadius: i === idx ? 4 : '50%',
            background: i === idx ? 'var(--am)' : 'rgba(255,255,255,.3)',
            border:'none', cursor:'pointer', transition:'all .2s'
          }}/>
        ))}
      </div>
    </div>
  )
}

// ── TRUST STRIP ──────────────────────────────────────────────
function TrustStrip() {
  const items = [
    '🇺🇬 Grown in Uganda', '✈️ Flown to Gatwick', '✅ GAP Certified',
    '🏛️ UNBS & MAAIF', '🇬🇧 Prices in GBP', '📦 Free Delivery £75+',
    '🌡️ Cold Chain Maintained', '♻️ Sustainable Farms'
  ]
  return (
    <div className="hide-scroll" style={{
      background:'var(--g3)', padding:'10px 16px',
      display:'flex', alignItems:'center', gap:16, overflowX:'auto'
    }}>
      {items.map((item, i) => (
        <div key={i} style={{display:'flex', alignItems:'center', gap:0, flexShrink:0}}>
          <span style={{color:'rgba(255,255,255,.9)', fontSize:12, whiteSpace:'nowrap', fontWeight:500}}>{item}</span>
          {i < items.length - 1 && <span style={{width:1, height:16, background:'rgba(255,255,255,.25)', margin:'0 16px'}}/>}
        </div>
      ))}
    </div>
  )
}

// ── PROMO GRID ───────────────────────────────────────────────
function PromoGrid() {
  const navigate = useNavigate()
  const cards = [
    {img:'https://ierviwtmdqerdmwtnimn.supabase.co/storage/v1/object/public/product-images/products/1784272182381-usc22b751rp.jpg', bg:'var(--gl)', border:'#9FE1CB', emoji:'📦', title:'Food Boxes', sub:'Avocado, plantain, sweet potato', cat:'all'},
    {img:'https://ierviwtmdqerdmwtnimn.supabase.co/storage/v1/object/public/product-images/products/1784273521387-tkpq9h8jan.jpg', bg:'var(--aml)', border:'#FAC775', emoji:'🥦', title:'Fresh Vegetables', sub:'Peppers, tomatoes, cabbage', cat:'vegetables'},
    {img:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=640&q=60&auto=format&fit=crop', bg:'var(--pul)', border:'#C8B5F0', emoji:'🫘', title:'Beans & Nuts', sub:'Red beans, yellow beans, cashews', cat:'legumes'},
    {img:'https://ierviwtmdqerdmwtnimn.supabase.co/storage/v1/object/public/product-images/products/1784274303524-g5grofoo6w.jpeg', bg:'var(--rdl)', border:'#F4B0B4', emoji:'🌾', title:'Dried Foods', sub:'Cassava, yam, sweet potato', cat:'dried'},
    {img:'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=640&q=60&auto=format&fit=crop', bg:'var(--gll)', border:'#9FE1CB', emoji:'🥤', title:'Beverages', sub:'Bushera, Stoney, Novida', cat:'all'},
    {img:'https://images.unsplash.com/photo-1632171927336-1ca4b53a0b57?w=640&q=60&auto=format&fit=crop', bg:'#FFF3E0', border:'#FFCC80', emoji:'🧺', title:'African Crafts', sub:'Wooden art, clay cups, mats', cat:'all'},
  ]
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:10, padding:'10px 14px'}}>
      {cards.map(c => (
        <div key={c.title} onClick={() => navigate(`/shop?cat=${c.cat}`)}
          style={{
            background:'var(--wh)', border:`.5px solid ${c.border}`, borderRadius:14,
            cursor:'pointer', position:'relative', overflow:'hidden',
            transition:'all .2s', boxShadow:'var(--sh1)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--sh2)' }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--sh1)' }}
        >
          <div style={{height:96, background:c.bg, position:'relative', overflow:'hidden'}}>
            <img src={c.img} alt={c.title} loading="lazy" decoding="async"
              style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
              onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
            <span style={{
              display:'none', position:'absolute', inset:0,
              alignItems:'center', justifyContent:'center', fontSize:40
            }}>{c.emoji}</span>
          </div>
          <div style={{padding:'10px 12px 12px'}}>
            <h4 style={{fontSize:13.5, fontWeight:700, color:'var(--tx)', marginBottom:2}}>{c.title}</h4>
            <p style={{fontSize:11, color:'var(--mu)'}}>{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── FLASH DEALS ROW ──────────────────────────────────────────
function FlashRow({ products }) {
  if (!products.length) return null
  const navigate = useNavigate()
  const { addItem } = require('../lib/store').useCartStore()

  return (
    <div style={{paddingBottom:8}}>
      <div className="sec-hd">
        <h2><Zap size={18} color="var(--rd)" /> Flash Deals</h2>
        <button className="see-all" onClick={() => navigate('/shop?flash=1')}>
          See all <ChevronRight size={13}/>
        </button>
      </div>
      <div className="hide-scroll" style={{display:'flex', gap:10, overflowX:'auto', padding:'0 14px 4px'}}>
        {products.map(p => (
          <div key={p.id} className="card" onClick={() => navigate(`/product/${p.id}`)}
            style={{minWidth:140, cursor:'pointer', flexShrink:0, transition:'all .18s'}}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--sh2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--sh1)' }}
          >
            <div style={{height:105, overflow:'hidden', position:'relative'}}>
              <img src={p.images?.[0]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"/>
              <span style={{
                position:'absolute',top:6,left:6,
                background:'var(--rd)',color:'#fff',
                fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4
              }}>⚡ FLASH</span>
            </div>
            <div style={{padding:'9px 10px'}}>
              <div style={{fontSize:11.5, fontWeight:500, marginBottom:4, lineHeight:1.3}}>{p.name}</div>
              <div style={{display:'flex', alignItems:'baseline', gap:5}}>
                <span style={{fontFamily:'Fraunces,serif',fontSize:15,fontWeight:700,color:'var(--g2)'}}>£{p.price?.toFixed(2)}</span>
                {p.compare_price && <span style={{fontSize:10,color:'var(--lt)',textDecoration:'line-through'}}>£{p.compare_price?.toFixed(2)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FEATURED PRODUCTS ────────────────────────────────────────
function FeaturedSection({ title, icon, products, linkTo }) {
  const navigate = useNavigate()
  if (!products.length) return null
  return (
    <div style={{paddingBottom:8}}>
      <div className="sec-hd">
        <h2>{icon} {title}</h2>
        <button className="see-all" onClick={() => navigate(linkTo)}>
          See all <ChevronRight size={13}/>
        </button>
      </div>
      <div className="pgrid">
        {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

// ── STATS BANNER ─────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { icon: <Users size={22} color="var(--g3)"/>, n: '1,500+', l: 'Partner Farmers' },
    { icon: <Star size={22} color="var(--am)"/>, n: '4.8★', l: 'Average Rating' },
    { icon: <TrendingUp size={22} color="var(--pu)"/>, n: '12 tonnes', l: 'Exported Weekly' },
    { icon: '🌍', n: 'UK, USA,\nCanada, EU', l: 'Markets Served' },
  ]
  return (
    <div style={{
      background:'var(--g1)', margin:'8px 14px', borderRadius:14,
      display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:1,
      overflow:'hidden'
    }}>
      {stats.map((s,i) => (
        <div key={i} style={{
          textAlign:'center', padding:'18px 12px',
          borderRight: i < stats.length-1 ? '1px solid rgba(255,255,255,.08)' : 'none'
        }}>
          <div style={{marginBottom:6}}>{typeof s.icon === 'string' ? <span style={{fontSize:22}}>{s.icon}</span> : s.icon}</div>
          <div style={{fontFamily:'Fraunces,serif',color:'#fff',fontSize:18,fontWeight:700,lineHeight:1.2,whiteSpace:'pre-line'}}>{s.n}</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:10,marginTop:3}}>{s.l}</div>
        </div>
      ))}
    </div>
  )
}

// ── HOME PAGE ────────────────────────────────────────────────
export default function HomePage() {
  const [flashDeals, setFlashDeals] = useState([])
  const [featured, setFeatured] = useState([])
  const [topRated, setTopRated] = useState([])

  useEffect(() => {
    // Flash deals
    supabase.from('products').select('*').eq('is_flash_deal', true).eq('is_active', true).limit(8)
      .then(({ data }) => setFlashDeals(data || []))

    // Featured
    supabase.from('products').select('*').eq('is_featured', true).eq('is_active', true).limit(6)
      .then(({ data }) => setFeatured(data || []))

    // Top rated
    supabase.from('products').select('*').eq('is_active', true).order('rating', { ascending: false }).limit(8)
      .then(({ data }) => setTopRated(data || []))
  }, [])

  return (
    <div className="page-enter">
      <HeroCarousel />
      <TrustStrip />
      <PromoGrid />
      <FlashRow products={flashDeals} />
      <StatsBanner />
      <FeaturedSection title="Featured Produce" icon="⭐" products={featured} linkTo="/shop?featured=1" />
      <FeaturedSection title="Top Rated" icon="🏆" products={topRated} linkTo="/shop?sort=rating" />

      {/* About strip */}
      <div style={{
        background:'linear-gradient(135deg,var(--g1),var(--g3))',
        margin:'8px 14px 20px', borderRadius:16, padding:'22px 20px',
        color:'#fff', textAlign:'center'
      }}>
        <div style={{fontFamily:'Fraunces,serif',fontSize:20,fontWeight:700,marginBottom:8}}>
          About AGRENES
        </div>
        <p style={{fontSize:13, color:'rgba(255,255,255,.8)', lineHeight:1.7, maxWidth:480, margin:'0 auto 16px'}}>
          Agriculture Environment & Ecosystems Ltd — registered in Uganda since 2014.
          We connect over 1,500 smallholder farmers directly to UK, USA, Canada and European markets.
          GAP certified, HACCP compliant, cold-chain maintained.
        </p>
        <div style={{display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap'}}>
          {['Global G.A.P','HACCP','UNBS','MAAIF'].map(c => (
            <span key={c} style={{
              background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
              fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20
            }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--g1)', color: 'rgba(255,255,255,.8)',
      padding: '40px 20px 80px', marginTop: 20
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 28, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <img src="/logo.png" alt="AGRENES" style={{ height: 40, marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,.6)' }}>
              Fresh Ugandan produce air-freighted to the UK. Retail & bulk orders. GAP & UNBS certified.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {['🇺🇬', '🇬🇧', '🇺🇸', '🇨🇦'].map(flag => (
                <span key={flag} style={{ fontSize: 20 }}>{flag}</span>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Shop</div>
            {[
              { label: 'All Produce', to: '/shop' },
              { label: 'Fruits', to: '/shop?cat=fruits' },
              { label: 'Vegetables', to: '/shop?cat=vegetables' },
              { label: 'Bananas & Plantain', to: '/shop?cat=bananas' },
              { label: 'Herbs & Spices', to: '/shop?cat=herbs' },
              { label: 'Bulk / Wholesale', to: '/shop?bulk=1' },
              { label: 'Flash Deals', to: '/shop?flash=1' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 7, transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.7)'}
              >{l.label}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Company</div>
            {[
              { label: 'About AGRENES', to: '/about' },
              { label: 'Our Vendors', to: '/vendors' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'Vendor Application', to: '/contact' },
              { label: 'Bulk Orders', to: '/contact' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 7 }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.7)'}
              >{l.label}</Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Help</div>
            {[
              { label: 'My Orders', to: '/orders' },
              { label: 'Returns & Refunds', to: '/returns' },
              { label: 'Terms & Conditions', to: '/terms' },
              { label: 'Privacy Policy', to: '/privacy' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 7 }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.7)'}
              >{l.label}</Link>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, marginBottom: 5 }}>
                <Mail size={13} color="var(--am)" /> support@agrenes.co.uk
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                <MapPin size={13} color="var(--am)" /> Ndeeba Kabowa, Kampala
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
            © {new Date().getFullYear()} Agriculture Environment & Ecosystems Ltd · Reg. No. 179759 (Uganda)
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Terms', 'Privacy', 'Returns', 'Contact'].map((l, i) => (
              <Link key={l} to={['terms','privacy','returns','contact'][i].startsWith('/') ? ['terms','privacy','returns','contact'][i] : `/${['terms','privacy','returns','contact'][i]}`}
                style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.45)'}
              >{l}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Payments:</span>
            {['💳', '📱', '', '🔵'].map((icon, i) => (
              <span key={i} style={{ fontSize: 16 }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

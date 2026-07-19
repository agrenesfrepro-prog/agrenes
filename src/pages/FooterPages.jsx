import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

function PageShell({ title, children }) {
  const navigate = useNavigate()
  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--g1), var(--g3))', padding: '20px 16px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, marginBottom: 12, cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ color: '#fff', fontSize: 22, fontFamily: 'Fraunces,serif' }}>{title}</h1>
      </div>
      <div style={{ padding: '20px 16px', maxWidth: 700, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}

const prose = { fontSize: 14, lineHeight: 1.8, color: 'var(--mu)', marginBottom: 16 }
const h2style = { fontSize: 16, fontWeight: 700, color: 'var(--tx)', marginBottom: 8, marginTop: 20 }

// ── ABOUT ──────────────────────────────────────────────────
export function AboutPage() {
  return (
    <PageShell title="About AGRENES">
      <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
        <img src="/logo.png" alt="AGRENES" style={{ height: 60, margin: '0 auto 12px' }} />
        <p style={{ fontSize: 15, color: 'var(--mu)', maxWidth: 420, margin: '0 auto' }}>
          Agriculture Environment & Ecosystems Ltd — connecting Uganda's farms to the world.
        </p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={h2style}>Our Story</h2>
        <p style={prose}>Founded in 2014 and registered in Uganda (Company No. 179759), AGRENES was built on a simple belief: Ugandan farmers grow some of the world's finest fresh produce, and the world deserves to taste it.</p>
        <p style={prose}>We work directly with over 1,500 smallholder outgrower farmers across Uganda, providing them with training, fair prices, and access to international markets. Our packhouse in Ndeeba Kabowa processes and prepares fresh fruits and vegetables (FFV) for export 4× per week on air-freight routes from Entebbe International Airport to Gatwick, London.</p>
        <p style={prose}>Our key export products include hot peppers, eggplant, chilli, tomatoes, and ginger, averaging approximately 12 tonnes per week to markets in the UK, USA, Canada, and Europe.</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={h2style}>Certifications</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Global G.A.P', 'HACCP', 'UNBS', 'MAAIF', 'Uganda Export Promotion Board'].map(c => (
            <span key={c} className="badge badge-green" style={{ fontSize: 12, padding: '5px 12px' }}>{c}</span>
          ))}
        </div>
        <p style={{ ...prose, marginTop: 12 }}>All our produce is grown under Good Agricultural Practices (GAP) and certified by the Uganda National Bureau of Standards (UNBS) and the Ministry of Agriculture, Animal Industry and Fisheries (MAAIF). Our packhouse is HACCP compliant and maintains full cold-chain integrity from farm to flight.</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2 style={h2style}>Our Mission</h2>
        <p style={prose}>To sustainably develop Uganda's agricultural value chains by connecting smallholder farmers to premium international markets, improving livelihoods while delivering certified, fresh, traceable produce to consumers around the world.</p>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2 style={h2style}>Past Experience</h2>
        <p style={prose}>AGRENES has delivered agricultural projects in partnership with the EU/FARA AIRTEA project and the FAO in collaboration with the Ministry of Agriculture. We bring institutional expertise and field-level execution together in one organisation.</p>
      </div>
    </PageShell>
  )
}

// ── CONTACT ───────────────────────────────────────────────
export function ContactPage() {
  return (
    <PageShell title="Contact Us">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { icon: <Mail size={20} color="var(--g3)" />, label: 'Email', val: 'info@agrenes.co.uk', href: 'mailto:info@agrenes.co.uk' },
          { icon: <Phone size={20} color="var(--g3)" />, label: 'Phone (UK)', val: '+44 20 0000 0000', href: 'tel:+44200000000' },
          { icon: <Phone size={20} color="var(--g3)" />, label: 'Phone (Uganda)', val: '+256 700 000 000', href: 'tel:+256700000000' },
          { icon: <MapPin size={20} color="var(--g3)" />, label: 'Packhouse', val: 'Ndeeba Kabowa, Kampala, Uganda', href: null },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: 'var(--gll)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--mu)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>{item.label}</div>
              {item.href ? (
                <a href={item.href} style={{ fontSize: 14, fontWeight: 600, color: 'var(--g2)' }}>{item.val}</a>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.val}</div>
              )}
            </div>
          </div>
        ))}

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Send a Message</h3>
          <div className="form-group"><label>Your Name</label><input className="form-input" placeholder="Jane Smith" /></div>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" placeholder="jane@example.com" /></div>
          <div className="form-group"><label>Subject</label>
            <select className="form-input">
              <option>General Enquiry</option>
              <option>Bulk / Wholesale Order</option>
              <option>Order Issue</option>
              <option>Vendor Application</option>
              <option>Media / Press</option>
            </select>
          </div>
          <div className="form-group"><label>Message</label>
            <textarea className="form-input" rows={4} placeholder="How can we help?" style={{ resize: 'vertical' }} />
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 46 }}>
            Send Message
          </button>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Follow AGRENES</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: <Facebook size={18} />, label: 'Facebook', color: '#1877F2' },
              { icon: <Instagram size={18} />, label: 'Instagram', color: '#E1306C' },
              { icon: <Twitter size={18} />, label: 'Twitter / X', color: '#1DA1F2' },
              { icon: <Linkedin size={18} />, label: 'LinkedIn', color: '#0A66C2' },
            ].map(s => (
              <button key={s.label} title={s.label} style={{
                width: 44, height: 44, borderRadius: 10, background: s.color + '18',
                border: `1px solid ${s.color}44`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>{s.icon}</button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}

// ── TERMS & CONDITIONS ─────────────────────────────────────
export function TermsPage() {
  return (
    <PageShell title="Terms & Conditions">
      <p style={{ ...prose, fontSize: 12 }}>Last updated: June 2025</p>
      {[
        { h: '1. Introduction', p: 'These Terms and Conditions govern your use of the AGRENES platform and the purchase of products from Agriculture Environment & Ecosystems Ltd ("AGRENES", "we", "us", "our"), a company registered in Uganda (Company No. 179759). By placing an order you agree to these terms.' },
        { h: '2. Products & Availability', p: 'All products are subject to availability. As fresh produce is perishable and air-freighted, we reserve the right to substitute products of equal or greater value if your selected item is unavailable due to seasonal or logistical reasons. We will notify you before dispatch.' },
        { h: '3. Pricing', p: 'All prices are displayed in British Pounds Sterling (GBP) and include VAT where applicable. Prices are subject to change without notice. The price at the time of your order confirmation is the price you will be charged.' },
        { h: '4. Orders & Payment', p: 'Orders are confirmed upon successful payment. We accept major credit/debit cards and Mobile Money. Payment is processed securely via our payment partners. AGRENES does not store card details.' },
        { h: '5. Delivery', p: 'We air-freight produce from Entebbe to Gatwick 4× per week. UK delivery is estimated 2–4 working days from dispatch. Delivery fees apply to orders under £75; orders of £75 and above qualify for free standard delivery to mainland UK addresses.' },
        { h: '6. Freshness Guarantee', p: 'We guarantee that all produce is packed fresh and dispatched within 24 hours of harvest. If your order arrives in unsatisfactory condition, please contact us within 24 hours of delivery with photographic evidence for a full refund or replacement.' },
        { h: '7. Returns & Refunds', p: 'Due to the perishable nature of fresh produce, we cannot accept returns of items that are not defective. Refunds are issued within 5 business days of approval to the original payment method.' },
        { h: '8. Bulk Orders', p: 'Bulk and wholesale orders are subject to separate quotation and payment terms agreed with the AGRENES sales team. Minimum order quantities apply.' },
        { h: '9. Limitation of Liability', p: 'AGRENES\'s liability is limited to the value of the goods purchased. We are not liable for indirect losses, delays caused by customs authorities, or circumstances beyond our reasonable control.' },
        { h: '10. Governing Law', p: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.' },
      ].map(s => (
        <div key={s.h}>
          <h2 style={h2style}>{s.h}</h2>
          <p style={prose}>{s.p}</p>
        </div>
      ))}
    </PageShell>
  )
}

// ── PRIVACY POLICY ─────────────────────────────────────────
export function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p style={{ ...prose, fontSize: 12 }}>Last updated: June 2025</p>
      {[
        { h: 'What We Collect', p: 'We collect your name, email address, delivery address, phone number, and order history when you create an account or place an order. We also collect anonymised usage data to improve the platform.' },
        { h: 'How We Use Your Data', p: 'Your data is used to process orders, send order confirmations and tracking updates, personalise your shopping experience, and comply with legal obligations. We do not sell your personal data to third parties.' },
        { h: 'Data Storage', p: 'Your data is stored securely using Supabase (hosted on AWS). All data is encrypted at rest and in transit using industry-standard SSL/TLS.' },
        { h: 'Cookies', p: 'We use essential cookies to keep you logged in and remember your cart. We do not use advertising or tracking cookies.' },
        { h: 'Your Rights (UK GDPR)', p: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact privacy@agrenes.co.uk. You also have the right to lodge a complaint with the Information Commissioner\'s Office (ICO).' },
        { h: 'Third Parties', p: 'We share data with payment processors (Stripe, Flutterwave) solely for the purpose of processing payments, and with delivery partners for order fulfillment. These partners have their own privacy policies.' },
        { h: 'Contact', p: 'For any privacy-related queries, contact us at privacy@agrenes.co.uk or write to: AGRENES, Ndeeba Kabowa, Kampala, Uganda.' },
      ].map(s => (
        <div key={s.h}>
          <h2 style={h2style}>{s.h}</h2>
          <p style={prose}>{s.p}</p>
        </div>
      ))}
    </PageShell>
  )
}

// ── RETURNS POLICY ─────────────────────────────────────────
export function ReturnsPage() {
  return (
    <PageShell title="Returns & Refunds">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { icon: '📸', title: 'Report Within 24 Hours', desc: 'If your produce arrives damaged, wilted, or not as described, contact us within 24 hours of delivery with photos and your order reference.' },
          { icon: '✅', title: 'Automatic Approval', desc: 'Valid freshness complaints with photo evidence are approved automatically. We do not ask you to return perishable goods.' },
          { icon: '💷', title: 'Refund in 5 Days', desc: 'Approved refunds are returned to your original payment method within 5 business days.' },
          { icon: '🔄', title: 'Replacement Option', desc: 'Instead of a refund, we can dispatch a replacement on the next available flight at no additional charge.' },
        ].map(item => (
          <div key={item.title} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <p style={{ ...prose, marginBottom: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="card" style={{ padding: 18, background: 'var(--gll)', border: '1px solid var(--gl)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Contact for Returns</h3>
          <p style={{ ...prose, marginBottom: 8 }}>Email: <a href="mailto:support@agrenes.co.uk" style={{ color: 'var(--g3)', fontWeight: 600 }}>support@agrenes.co.uk</a></p>
          <p style={{ ...prose, marginBottom: 0 }}>Include your order reference number and clear photos of the issue in your email.</p>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>What We Cannot Refund</h3>
          <ul style={{ ...prose, paddingLeft: 18, marginBottom: 0 }}>
            <li>Produce reported more than 24 hours after delivery</li>
            <li>Items damaged after delivery due to improper storage</li>
            <li>Personal preferences (e.g. ripeness level) where produce meets description</li>
            <li>Bulk/wholesale orders beyond the agreed terms</li>
          </ul>
        </div>
      </div>
    </PageShell>
  )
}

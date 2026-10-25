export const metadata = { title: 'Privacy Policy - AGRENES Market', description: 'How AGRENES Market collects, uses and protects your personal data under UK GDPR.' }
export default function PrivacyPage() {
  return (
    <main style={{maxWidth:800, margin:'40px auto', padding:'0 20px', lineHeight:1.7, color:'#1e1e1e'}}>
      <h1 style={{fontFamily:'Fraunces,serif', fontSize:32, marginBottom:8}}>Privacy Policy</h1>
      <p style={{color:'#666', marginBottom:24}}>Last updated: 12 October 2026</p>
      <h2>1. Who we are</h2>
      <p><strong>UK Data Controller:</strong> FRE PRO LIMITED (Companies House 12671150), registered in England and Wales, with registered office at 5 Pembury Road, London N17 6SR. FRE PRO LIMITED is the UK trading entity operating both agrenesmarket.com and agrenesfrepro.com, and is the data controller responsible for your personal data under UK GDPR.</p><p><strong>Sourcing partner:</strong> Produce is grown and packed by Agriculture Environment & Ecosystems Ltd (Company No. 179759), a Ugandan farming and export company established in 2014, with packhouse at Ndeeba Kabowa, Uganda.</p>
      <p>We operate two trading sites on one corporate and operational system:</p>
      <ul>
        <li><strong>AGRENES Market</strong> (agrenesmarket.com) — UK direct-to-consumer retail</li>
        <li><strong>AGRENES Fresh Produce</strong> (<a href="https://agrenesfrepro.com">agrenesfrepro.com</a>) — wholesale export</li>
      </ul>
      <p>Both sites share one data controller and one privacy regime. Contact for data protection matters: <a href="mailto:support@agrenes.co.uk">support@agrenes.co.uk</a></p>
      <h2>2. Data we collect</h2>
      <ul><li>Account: name, email, delivery address, phone number</li><li>Orders: items purchased, order history, delivery preferences</li><li>Payment: handled by Stripe — we do NOT store full card details</li><li>Browsing: pages viewed and products searched (only with analytics consent)</li><li>Communications: emails and messages you send us</li></ul>
      <h2>3. How we use your data</h2>
      <ul><li>Fulfil and deliver orders (contract)</li><li>Send order confirmations (contract)</li><li>Respond to enquiries (legitimate interest)</li><li>Marketing emails only with explicit consent (consent)</li><li>Anonymous analytics (consent via cookie banner)</li><li>Comply with tax and accounting law (legal obligation)</li></ul>
      <h2>4. Who we share with</h2>
      <p>Stripe (payments), Evri (UK delivery), Supabase (hosting), Resend (email), Google Analytics (anonymous usage, only if you accept cookies). We do NOT sell your data.</p>
      <h2>5. How long we keep data</h2>
      <p>Orders: 7 years (UK tax law). Marketing: until you unsubscribe. Analytics: 14 months.</p>
      <h2>6. Your rights under UK GDPR</h2>
      <p>You have the right to access, correct, delete and port your data; to object to marketing; to withdraw cookie consent; and to complain to the UK ICO (ico.org.uk). Email support@agrenes.co.uk — we respond within 30 days.</p>
      <h2>7. Cookies</h2>
      <p>See our <a href="/cookies" style={{color:'#063D32', textDecoration:'underline'}}>Cookies Policy</a>.</p>
      <h2>8. Changes</h2>
      <p>We will post updates here and update the date above. Material changes will be emailed to active customers.</p>
    </main>
  )
}
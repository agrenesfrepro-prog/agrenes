export const metadata = { title: 'Cookies Policy - AGRENES Market', description: 'Which cookies AGRENES Market uses and how to control them.' }
export default function CookiesPage() {
  return (
    <main style={{maxWidth:800, margin:'40px auto', padding:'0 20px', lineHeight:1.7, color:'#1e1e1e'}}>
      <h1 style={{fontFamily:'Fraunces,serif', fontSize:32, marginBottom:8}}>Cookies Policy</h1>
      <p style={{color:'#666', marginBottom:24}}>Last updated: 12 October 2026</p>
      <h2>What are cookies?</h2>
      <p>Small text files placed on your device when you visit a website. They remember your preferences, keep you signed in, and (with your consent) measure how the site is used.</p>
      <h2>Essential cookies (always on)</h2>
      <p>Necessary for the site to work; do not require consent under UK law.</p>
      <ul><li>Session: keeps your cart and sign-in active</li><li>Authentication: keeps you signed in</li><li>Cart state: remembers items in your cart</li><li>Wishlist: remembers items you saved</li><li>Cookie choice: remembers your consent</li></ul>
      <h2>Analytics cookies (opt-in only)</h2>
      <p>We use Google Analytics 4 to understand which pages are popular and improve the site. These cookies load ONLY if you click "Accept all" in the cookie banner.</p>
      <ul><li>_ga, _ga_*: Google Analytics, 2-year expiry, anonymous usage data</li></ul>
      <p>You can withdraw consent by clearing cookies for agrenesmarket.com in your browser.</p>
      <h2>Third-party cookies</h2>
      <p>Payment pages served by Stripe may set their own cookies for security and fraud detection. These are essential to processing payments.</p>
      <h2>Managing cookies</h2>
      <p>Block or delete cookies via your browser settings. If you block essential cookies some features (cart, login) will stop working.</p>
      <h2>Contact</h2>
      <p>Questions about cookies: support@agrenes.co.uk</p>
    </main>
  )
}
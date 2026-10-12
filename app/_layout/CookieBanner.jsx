'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem('agrenes.cookieConsent')) setVisible(true) } catch {}
  }, [])
  const choose = (v) => {
    try { localStorage.setItem('agrenes.cookieConsent', v); window.dispatchEvent(new Event('agrenes.cookieConsent')) } catch {}
    setVisible(false)
  }
  if (!visible) return null
  return (
    <div style={{position:'fixed', left:0, right:0, bottom:0, zIndex:9999, background:'#063D32', color:'#fff', padding:'16px 20px', boxShadow:'0 -4px 20px rgba(0,0,0,.2)'}}>
      <div style={{maxWidth:1100, margin:'0 auto', display:'flex', flexDirection:'column', gap:12}}>
        <div style={{fontSize:13.5, lineHeight:1.6}}>
          We use cookies to run the site and, with your consent, to measure how it is used. Essential cookies (cart, login) are always on. Click <strong>Accept all</strong> to allow analytics too, or <strong>Essential only</strong> to decline. See our <Link href="/cookies" style={{color:'#9FE1CB', textDecoration:'underline'}}>Cookies Policy</Link>.
        </div>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          <button onClick={() => choose('all')} style={{background:'#FFA726', color:'#063D32', border:'none', padding:'10px 20px', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer'}}>Accept all</button>
          <button onClick={() => choose('essential')} style={{background:'transparent', color:'#fff', border:'1px solid #fff', padding:'10px 20px', borderRadius:6, fontWeight:700, fontSize:13, cursor:'pointer'}}>Essential only</button>
        </div>
      </div>
    </div>
  )
}
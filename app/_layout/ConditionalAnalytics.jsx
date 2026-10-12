'use client'
import { useState, useEffect } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
export default function ConditionalAnalytics({ gaId }) {
  const [consent, setConsent] = useState(false)
  useEffect(() => {
    const check = () => { try { setConsent(localStorage.getItem('agrenes.cookieConsent') === 'all') } catch {} }
    check()
    window.addEventListener('agrenes.cookieConsent', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('agrenes.cookieConsent', check)
      window.removeEventListener('storage', check)
    }
  }, [])
  if (!consent) return null
  return <GoogleAnalytics gaId={gaId} />
}
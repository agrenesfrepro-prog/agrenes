'use client'
import { useEffect, useState } from 'react'

// The older part of the site (src/App) has its own router that reads the
// browser's address once, when it starts. When Next.js moves to a page it has
// already loaded before, it can start that router a moment BEFORE the address
// bar has changed, so the router shows the page for the PREVIOUS address
// (this is how /checkout ended up showing "Product not found").
//
// This hook returns true only once the browser's address really matches the
// page Next.js is showing, so the router always starts on the right address.
export function useUrlReady(pathname) {
  const [readyFor, setReadyFor] = useState(null)

  useEffect(() => {
    let cancelled = false
    let tries = 0
    const norm = (p) => (p || '/').replace(/\/+$/, '') || '/'
    const check = () => {
      if (cancelled) return
      if (norm(window.location.pathname) === norm(pathname) || tries >= 40) {
        setReadyFor(pathname)
        return
      }
      tries += 1
      setTimeout(check, 25)
    }
    check()
    return () => { cancelled = true }
  }, [pathname])

  return readyFor === pathname
}

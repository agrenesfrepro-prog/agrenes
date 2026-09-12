'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const App = dynamic(() => import('../../src/App'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#063D32',
      fontSize: 16,
    }}>
      Loading AGRENES...
    </div>
  ),
})

export default function CatchAll() {
  const pathname = usePathname()
  // key={pathname} forces the CRA bridge to re-mount when URL changes,
  // so react-router-dom inside always syncs with the current URL.
  return <App key={pathname} />
}
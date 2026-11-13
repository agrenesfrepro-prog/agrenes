'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useUrlReady } from '../../src/lib/useUrlReady'

function Loading() {
  return (
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
  )
}

const App = dynamic(() => import('../../src/App'), { ssr: false, loading: Loading })

export default function CatchAll() {
  const pathname = usePathname()
  // Wait until the address bar matches this page before starting the inner
  // router, then key it by path so it restarts cleanly on every change.
  const ready = useUrlReady(pathname)
  if (!ready) return <Loading />
  return <App key={pathname} />
}

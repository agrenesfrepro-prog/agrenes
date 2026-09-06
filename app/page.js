'use client'

import dynamic from 'next/dynamic'

const App = dynamic(() => import('../src/App'), {
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

export default function Home() {
  return <App />
}
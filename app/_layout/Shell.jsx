'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import { BottomNav, SideMenu } from './BottomNav'
import WhatsAppButton from './WhatsAppButton'
import HydrationTrigger from '../../src/components/HydrationTrigger'
import { useAuthStore } from '../../src/lib/store'

export default function Shell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { init } = useAuthStore()

  useEffect(() => { init() }, [])

  return (
    <>
      <HydrationTrigger />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--tx)', color: '#fff',
            borderRadius: 10, fontSize: 13.5, fontWeight: 500,
            padding: '12px 16px', maxWidth: 340,
          },
          success: { iconTheme: { primary: 'var(--g4)', secondary: '#fff' } }
        }}
      />
      <div style={{ minHeight: '100vh', paddingBottom: 68 }}>
        <Navbar onMenuOpen={() => setMenuOpen(true)} />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <CartDrawer />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <WhatsAppButton />
      </div>
    </>
  )
}
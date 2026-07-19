import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles/global.css'
import { useAuthStore } from './lib/store'
import Navbar from './components/layout/Navbar'
import CategoryBar from './components/layout/CategoryBar'
import { BottomNav, SideMenu } from './components/layout/BottomNav'
import CartDrawer from './components/cart/CartDrawer'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import { AccountPage, WishlistPage } from './pages/AccountPage'
import AuthPage from './pages/AuthPage'
import AdminPage from './pages/AdminPage'
import VendorsPage from './pages/VendorsPage'
import VendorPortalPage from './pages/VendorPortalPage'
import AddressesPage from './pages/AddressesPage'
import BulkEnquiryPage from './pages/BulkEnquiryPage'
import WhatsAppButton from './components/shared/WhatsAppButton'
import { AboutPage, ContactPage, TermsPage, PrivacyPage, ReturnsPage } from './pages/FooterPages'

// ── SEO: dynamic page titles ──────────────────────────────
const PAGE_TITLES = {
  '/': 'AGRENES — Fresh Ugandan Produce Delivered to the UK',
  '/shop': 'Shop Fresh Produce — AGRENES',
  '/orders': 'My Orders — AGRENES',
  '/account': 'My Account — AGRENES',
  '/wishlist': 'Wishlist — AGRENES',
  '/checkout': 'Checkout — AGRENES',
  '/vendors': 'Our Vendors & Partner Farms — AGRENES',
  '/vendor': 'Vendor Dashboard — AGRENES',
  '/admin': 'Admin Panel — AGRENES',
  '/about': 'About AGRENES',
  '/contact': 'Contact Us — AGRENES',
  '/terms': 'Terms & Conditions — AGRENES',
  '/privacy': 'Privacy Policy — AGRENES',
  '/returns': 'Returns & Refunds — AGRENES',
  '/bulk': 'Bulk & Wholesale Enquiry — AGRENES',
  '/account/addresses': 'Delivery Addresses — AGRENES',
}

function TitleManager() {
  const location = useLocation()
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'AGRENES — Fresh from Uganda'
    document.title = title
    // Update meta description
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      if (location.pathname === '/') {
        meta.setAttribute('content', 'Direct from Uganda\'s farms to your door. GAP & UNBS certified fresh fruits, vegetables, bananas and more. Free UK delivery on orders over £75.')
      } else if (location.pathname === '/shop') {
        meta.setAttribute('content', 'Browse 26+ lines of fresh Ugandan produce. Avocados, plantain, fine beans, chilli, ginger and more. Retail and bulk orders.')
      }
    }
  }, [location.pathname])
  return null
}

function Layout({ children, showCatBar = false, showFooter = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 68 }}>
      <Navbar onMenuOpen={() => setMenuOpen(true)} />
      {showCatBar && <CategoryBar />}
      <main>{children}</main>
      {showFooter && <Footer />}
      <BottomNav />
      <CartDrawer />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />\n      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  const { init } = useAuthStore()
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <TitleManager />
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
      <Routes>
        {/* Auth — no layout */}
        <Route path="/login" element={<AuthPage />} />

        {/* Main pages */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/shop" element={<Layout showCatBar><ShopPage /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
        <Route path="/checkout" element={<Layout showFooter={false}><CheckoutPage /></Layout>} />
        <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
        <Route path="/account" element={<Layout><AccountPage /></Layout>} />
        <Route path="/account/addresses" element={<Layout showFooter={false}><AddressesPage /></Layout>} />
        <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
        <Route path="/vendors" element={<Layout><VendorsPage /></Layout>} />
        <Route path="/vendor" element={<Layout showFooter={false}><VendorPortalPage /></Layout>} />
        <Route path="/admin" element={<Layout showFooter={false}><AdminPage /></Layout>} />
        <Route path="/bulk" element={<Layout><BulkEnquiryPage /></Layout>} />

        {/* Info pages */}
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/returns" element={<Layout><ReturnsPage /></Layout>} />

        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🥬</div>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>Page not found</h2>
              <p style={{ color: 'var(--mu)', marginBottom: 24 }}>That page doesn't exist. Let's get you back to the fresh produce.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './styles/global.css'

import HomePage from './screens/HomePage'
import ShopPage from './screens/ShopPage'
import ProductPage from './screens/ProductPage'
import CheckoutPage from './screens/CheckoutPage'
import OrdersPage from './screens/OrdersPage'
import { AccountPage, WishlistPage } from './screens/AccountPage'
import AuthPage from './screens/AuthPage'
import AdminPage from './screens/AdminPage'
import ResetPasswordPage from './screens/ResetPasswordPage'
import BundlesPage from './screens/BundlesPage'
import BundleDetailPage from './screens/BundleDetailPage'
import VendorsPage from './screens/VendorsPage'
import VendorPortalPage from './screens/VendorPortalPage'
import AddressesPage from './screens/AddressesPage'
import BulkEnquiryPage from './screens/BulkEnquiryPage'
import { AboutPage, ContactPage, TermsPage, PrivacyPage, ReturnsPage } from './screens/FooterPages'

// ─ SEO: dynamic page titles ─────────────────────────────────────────────
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
  }, [location.pathname])
  return null
}

/**
 * Legacy CRA app. Shared shell (Navbar/Footer/Cart/BottomNav/WhatsApp)
 * is now provided by Next.js app/layout.js -> Shell.jsx. This component only
 * handles route -> screen mapping for pages not yet converted to Next.js.
 */
export default function App() {
  return (
    <BrowserRouter>
      <TitleManager />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/bundles" element={<BundlesPage />} />
        <Route path="/bundles/:slug" element={<BundleDetailPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/addresses" element={<AddressesPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendor" element={<VendorPortalPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/bulk" element={<BulkEnquiryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🥺</div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>Page not found</h2>
            <p style={{ color: 'var(--mu)', marginBottom: 24 }}>That page doesn't exist. Let's get you back to the fresh produce.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { computeDeliveryFee } from './shipping'

// Compute derived totals whenever items change. Delivery is left at 0 here — the
// checkout page recomputes it once the destination country is chosen. The cart
// drawer shows the UK estimate.
const computeTotals = (items) => ({
  total: items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
  count: items.reduce((sum, i) => sum + (Number(i.qty) || 1), 0),
})

// ── CART STORE ──────────────────────────────────────────────
export const useCartStore = create(persist(
  (set, get) => ({
    items: [],
    total: 0,
    count: 0,
    isOpen: false,
    // Country for delivery quoting. Defaults to UK; checkout page updates it.
    country: 'UK',

    addItem: (product, qty = 1) => {
      const items = get().items
      const existing = items.find(i => i.id === product.id)
      const nextItems = existing
        ? items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
        : [...items, { ...product, qty }]
      set({ items: nextItems, ...computeTotals(nextItems) })
    },
    removeItem: (id) => {
      const nextItems = get().items.filter(i => i.id !== id)
      set({ items: nextItems, ...computeTotals(nextItems) })
    },
    updateQty: (id, qty) => {
      if (qty <= 0) return get().removeItem(id)
      const nextItems = get().items.map(i => i.id === id ? { ...i, qty } : i)
      set({ items: nextItems, ...computeTotals(nextItems) })
    },
    clearCart: () => set({ items: [], total: 0, count: 0 }),
    setCountry: (country) => set({ country }),

    // Derived delivery fee based on current items + country
    deliveryFee: () => {
      const { items, total, country } = get()
      return computeDeliveryFee(items, total, country)
    },
    // Grand total including delivery
    grandTotal: () => {
      const { items, total, country } = get()
      return total + computeDeliveryFee(items, total, country)
    },

    toggleCart: () => set({ isOpen: !get().isOpen }),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
  }),
  {
    name: 'agrenes-cart',
    partialize: (state) => ({ items: state.items, country: state.country }),
    onRehydrateStorage: () => (state) => {
      if (state && Array.isArray(state.items)) {
        const t = computeTotals(state.items)
        state.total = t.total
        state.count = t.count
      }
    },
  }
))

// ── AUTH STORE ──────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get().loadProfile(session.user)
    }
    set({ loading: false })
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().loadProfile(session.user)
      } else {
        set({ user: null, profile: null })
      }
    })
  },
  loadProfile: async (user) => {
    set({ user })
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    set({ profile: data })
  },
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    return { data, error }
  },
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
  isAdmin: () => get().profile?.role === 'admin',
  isVendor: () => ['vendor', 'admin'].includes(get().profile?.role),
}))

// ── WISHLIST STORE ───────────────────────────────────────────
export const useWishlistStore = create(persist(
  (set, get) => ({
    items: [],
    toggle: (product) => {
      const has = get().items.find(i => i.id === product.id)
      if (has) {
        set({ items: get().items.filter(i => i.id !== product.id) })
      } else {
        set({ items: [...get().items, product] })
      }
    },
    has: (id) => !!get().items.find(i => i.id === id),
  }),
  { name: 'agrenes-wishlist' }
))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { computeDeliveryFee } from './shipping'

const computeTotals = (items) => ({
  total: items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
  count: items.reduce((sum, i) => sum + (Number(i.qty) || 1), 0),
})

export const useCartStore = create(persist(
  (set, get) => ({
    items: [], total: 0, count: 0, isOpen: false, country: 'UK',
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
    deliveryFee: () => {
      const { items, total, country } = get()
      return computeDeliveryFee(items, total, country)
    },
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

export const useAuthStore = create((set, get) => ({
  user: null, profile: null, loading: true,
  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await get().loadProfile(session.user)
    set({ loading: false })
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) await get().loadProfile(session.user)
      else set({ user: null, profile: null })
    })
  },
  loadProfile: async (user) => {
    set({ user })
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    set({ profile: data })
  },
  signUp: async (email, password, fullName) => await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
  signIn: async (email, password) => await supabase.auth.signInWithPassword({ email, password }),
  signOut: async () => { await supabase.auth.signOut(); set({ user: null, profile: null }) },
  isAdmin: () => get().profile?.role === 'admin',
  isVendor: () => ['vendor', 'admin'].includes(get().profile?.role),
}))

export const useWishlistStore = create(persist(
  (set, get) => ({
    items: [],
    toggle: (product) => {
      const has = get().items.find(i => i.id === product.id)
      set({ items: has ? get().items.filter(i => i.id !== product.id) : [...get().items, product] })
    },
    has: (id) => !!get().items.find(i => i.id === id),
  }),
  { name: 'agrenes-wishlist' }
))

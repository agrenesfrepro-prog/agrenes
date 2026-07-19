import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// ── CART STORE ──────────────────────────────────────────────
export const useCartStore = create(persist(
  (set, get) => ({
    items: [],
    isOpen: false,

    addItem: (product, qty = 1) => {
      const items = get().items
      const existing = items.find(i => i.id === product.id)
      if (existing) {
        set({ items: items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i) })
      } else {
        set({ items: [...items, { ...product, qty }] })
      }
    },

    removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

    updateQty: (id, qty) => {
      if (qty <= 0) return get().removeItem(id)
      set({ items: get().items.map(i => i.id === id ? { ...i, qty } : i) })
    },

    clearCart: () => set({ items: [] }),

    toggleCart: () => set({ isOpen: !get().isOpen }),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),

    get total() {
      return get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
    },
    get count() {
      return get().items.reduce((sum, i) => sum + i.qty, 0)
    },
  }),
  { name: 'agrenes-cart' }
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

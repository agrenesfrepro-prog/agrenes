'use client'

import { useEffect } from 'react'
import { useCartStore, useWishlistStore } from '../lib/store'

/**
 * HydrationTrigger — mounts once in the browser, rehydrates persist stores.
 * Because we set skipHydration:true in the stores, they wait for this signal
 * before pulling data from localStorage. This prevents SSR hydration mismatches.
 * Renders nothing visible.
 */
export default function HydrationTrigger() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useCartStore.setState({ hasHydrated: true })

    useWishlistStore.persist.rehydrate()
    useWishlistStore.setState({ hasHydrated: true })
  }, [])

  return null
}
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hydrated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set({ user: { ...get().user, ...data } }),
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'agrolink-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Called after localStorage data is loaded into the store
        state?.setHydrated()
      },
    }
  )
)

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (crop, qty = 1) => {
        const items = get().items
        const existing = items.find(i => i.crop_id === crop.crop_id)
        if (existing) {
          set({ items: items.map(i => i.crop_id === crop.crop_id ? { ...i, qty: i.qty + qty } : i) })
        } else {
          set({ items: [...items, { ...crop, qty }] })
        }
      },
      removeItem: (crop_id) => set({ items: get().items.filter(i => i.crop_id !== crop_id) }),
      updateQty: (crop_id, qty) => {
        if (qty <= 0) { get().removeItem(crop_id); return }
        set({ items: get().items.map(i => i.crop_id === crop_id ? { ...i, qty } : i) })
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price_per_kg * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'agrolink-cart' }
  )
)

// Hook that returns true only after the store has hydrated from localStorage
// Use this to prevent flash of wrong auth state on first load
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Check if already hydrated (fast path for subsequent renders)
    const unsub = useAuthStore.subscribe(
      (state) => state._hydrated,
      (isHydrated) => { if (isHydrated) setHydrated(true) }
    )
    // Also check current state immediately
    if (useAuthStore.getState()._hydrated) setHydrated(true)
    return unsub
  }, [])

  return hydrated
}

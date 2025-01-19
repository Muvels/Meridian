import { create } from 'zustand'

interface SidebarStoreType {
  isPinned: boolean
  isOpen: boolean
  setPinned: (value: boolean) => void
  setOpen: (value: boolean) => void
}

export const useSidebarStore = create<SidebarStoreType>((set) => ({
  isPinned: false, // Tracks if the sidebar is pinned
  isOpen: false, // Tracks if the sidebar is open
  setPinned: (value) => set({ isPinned: value }),
  setOpen: (value) => set({ isOpen: value })
}))

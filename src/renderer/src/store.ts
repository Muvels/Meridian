import { create } from 'zustand'

export interface Tab {
  id: string
  url: string
  title?: string
  icon?: string
}

interface TabStore {
  tabs: Tab[]
  activeTab: string | null
  addTab: () => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTabUrl: (id: string, url: string) => void
  updateTabTitle: (id: string, title: string) => void
  updateTabFavicon: (id: string, icon: string) => void
}

const useTabStore = create<TabStore>((set) => ({
  tabs: [], // Initialize tabs as an empty array
  activeTab: null, // Correct initialization
  addTab: () =>
    set((state) => {
      const newTab = {
        id: String(Date.now()),
        url: 'https://google.com'
      }
      return {
        tabs: [...state.tabs, newTab],
        activeTab: newTab.id
      }
    }),
  closeTab: (id: string) =>
    set((state) => {
      const remainingTabs = state.tabs.filter((tab) => tab.id !== id)
      return {
        tabs: remainingTabs,
        activeTab: remainingTabs.length > 0 ? remainingTabs[0].id : null
      }
    }),
  setActiveTab: (id: string) => set({ activeTab: id }),
  updateTabUrl: (id: string, url: string) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, url } : tab))
    })),
  updateTabTitle: (id: string, title: string) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, title } : tab))
    })),
  updateTabFavicon: (id: string, icon: string) =>
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, icon } : tab))
    }))
}))

if (typeof window !== 'undefined') {
  ;(window as any).useTabStore = useTabStore
}

export default useTabStore

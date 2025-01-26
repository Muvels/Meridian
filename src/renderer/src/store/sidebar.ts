import { create } from 'zustand';

import useTabGroupStore from './tabs';

interface SidebarStoreType {
  isPinned: boolean;
  isOpen: boolean;
  isSettings: boolean;
  isCmdOpen: boolean;
  isTopBarOpen: boolean;
  setPinned: (value: boolean) => void;
  setOpen: (value: boolean) => void;
  setSettings: (value: boolean) => void;
  setCmdOpen: (value: boolean) => void;
  setTopBarOpen: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarStoreType>((set) => ({
  isPinned: true, // Tracks if the sidebar is pinned
  isOpen: false, // Tracks if the sidebar is open
  isSettings: false,
  isCmdOpen: false,
  isTopBarOpen: false,
  setPinned: (value): void => set({ isPinned: value }),
  setOpen: (value): void => set({ isOpen: value }),
  setSettings: (value): void => {
    useTabGroupStore.getState().removeActiveTab();
    set({ isSettings: value });
  },
  setCmdOpen: (value): void => set({ isCmdOpen: value }),
  setTopBarOpen: (value): void => set({ isTopBarOpen: value })
}));

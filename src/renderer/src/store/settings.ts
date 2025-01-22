import { create, StoreApi, UseBoundStore } from 'zustand';

import { defaults } from 'shared/defaults/settings';
import { Hotkeys } from 'shared/types/hotkeys';

export interface Settings {
  backgroundColor: string;
  adBlocker: boolean;
  hotkeys: Hotkeys;
}

interface SettingsStore extends Settings {
  setBackgroundColor: (color: string) => void;
  setAdBlocker: (value: boolean) => void;
  setHotkey: (category: string, action: string, newHotkey: string) => void;
  initialize: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  backgroundColor: defaults.settings.backgroundColor,
  adBlocker: defaults.settings.adBlocker,
  hotkeys: defaults.settings.hotkeys,
  setBackgroundColor: (color): void => {
    // Update the Electron Store asynchronously
    window.nativeApi.store.set('settings.backgroundColor', color);
    set({ backgroundColor: color });
  },
  setAdBlocker: (value): void => {
    window.nativeApi.store.set('settings.adBlocker', value);
    set({ adBlocker: value });
  },
  setHotkey: (category: string, action: string, newHotkey: string): void => {
    window.nativeApi.store.set(`settings.hotkeys.${category}.${action}`, newHotkey);
    set((state) => ({
      hotkeys: {
        ...state.hotkeys,
        [category]: {
          ...state.hotkeys[category],
          [action]: newHotkey
        }
      }
    }));
  },
  initialize: (settings): void => {
    set({ ...settings });
  }
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useSettingsStore: UseBoundStore<StoreApi<SettingsStore>> }
  ).useSettingsStore = useSettingsStore;
}

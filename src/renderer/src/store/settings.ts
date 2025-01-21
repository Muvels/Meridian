import { defaults } from 'shared/defaults/settings';
import { Hotkeys } from 'shared/types/hotkeys';
import { create, StoreApi, UseBoundStore } from 'zustand';

export interface Settings {
    backgroundColor: string;
    adBlocker: boolean;
    hotkeys: Hotkeys;
}

interface SettingsStore extends Settings {
  setBackgroundColor: (color: string) => void;
  setAdBlocker: (value: boolean) => void;
  initialize: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  backgroundColor: defaults.settings.backgroundColor,
  adBlocker: defaults.settings.adBlocker,
  hotkeys: defaults.settings.hotkeys,
  setBackgroundColor: (color) => {
    // Update the Electron Store asynchronously
    window.nativeApi.store.set('settings.backgroundColor', color);
    set({ backgroundColor: color });
  },
  setAdBlocker: (value) => {
    window.nativeApi.store.set('settings.adBlocker', value);
    set({ adBlocker: value });
  },
  initialize: (settings) => {
    set({ ...settings });
  }
}));

if (typeof window !== 'undefined') {
  (
    window as unknown as { useSettingsStore: UseBoundStore<StoreApi<SettingsStore>> }
  ).useSettingsStore = useSettingsStore;
}

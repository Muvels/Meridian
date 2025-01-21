import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Hotkeys } from 'shared/types/hotkeys';

import { useSettingsStore } from '@renderer/store/settings';

// Define the context type
interface HotkeysContextType {
  activateHotkeys: (keys: Partial<Hotkeys>, handlers: Record<string, () => void>) => void;
  deactivateHotkeys: () => void;
}

// Create the context
const HotkeysContext = createContext<HotkeysContextType | undefined>(undefined);

// Hotkeys Provider
export const HotkeysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeHotkeys, setActiveHotkeys] = useState<Record<string, () => void>>({});
  const { hotkeys } = useSettingsStore();

  // Register hotkeys dynamically
  useHotkeys(
    Object.keys(activeHotkeys).join(','),
    (_event, handler) => {
      activeHotkeys[handler.key]?.();
    },
    { enabled: Object.keys(activeHotkeys).length > 0 },
    [activeHotkeys]
  );

  // Activate hotkeys for the current page/component
  const activateHotkeys = (keys: Partial<Hotkeys>, handlers: Record<string, () => void>) => {
    const resolvedHotkeys = Object.entries(keys).reduce((acc, [group, actions]) => {
      if (typeof actions === 'object') {
        Object.entries(actions).forEach(([action, shortcut]) => {
          if (typeof shortcut === 'string' && handlers[shortcut]) {
            acc[shortcut] = handlers[shortcut];
          }
        });
      }
      return acc;
    }, {} as Record<string, () => void>);

    setActiveHotkeys(resolvedHotkeys);
  };

  // Deactivate hotkeys for the current page/component
  const deactivateHotkeys = () => {
    setActiveHotkeys({});
  };

  const value = useMemo(() => ({ activateHotkeys, deactivateHotkeys }), [activeHotkeys]);

  return <HotkeysContext.Provider value={value}>{children}</HotkeysContext.Provider>;
};

// Custom hook to use the Hotkeys Context
export const useHotkeysContext = (): HotkeysContextType => {
  const context = useContext(HotkeysContext);
  if (!context) {
    throw new Error('useHotkeysContext must be used within a HotkeysProvider');
  }
  return context;
};

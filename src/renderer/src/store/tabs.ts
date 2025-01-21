import { create, StoreApi, UseBoundStore } from 'zustand';
import { v4 as uuid } from 'uuid';
import { MosaicNode } from 'react-mosaic-component/lib/types';
import { useWebview } from '@renderer/contexts/WebviewContext';

export interface Tab {
  id: string;
  url: string;
  title?: string;
  icon?: string;
}

export interface TabGroup {
  id: string;
  tabs: Tab[];
  active: Tab;
  layout: MosaicNode<string>;
}

function splitNode(
  type: 'row' | 'column',
  layout: MosaicNode<string>,
  nodeIdToSplit: string,
  newFirstNode: string
): MosaicNode<string> {
  if (typeof layout === 'string') {
    // If the layout is a leaf node and matches the nodeIdToSplit, replace it
    if (layout === nodeIdToSplit) {
      return {
        direction: type,
        first: newFirstNode,
        second: nodeIdToSplit,
        splitPercentage: 50
      };
    }
    return layout; // No change if it doesn't match
  }
  return {
    // If the layout is a parent node, recursively traverse the children
    ...layout,
    first: splitNode(type, layout.first, nodeIdToSplit, newFirstNode),
    second: splitNode(type, layout.second, nodeIdToSplit, newFirstNode)
  };
}

function removeNode(
  layout: MosaicNode<string> | null,
  nodeIdToRemove: string
): MosaicNode<string> | null {
  if (!layout) return null;

  // If the layout is a leaf node
  if (typeof layout === 'string') {
    return layout === nodeIdToRemove ? null : layout;
  }

  // Recursively process child nodes
  const updatedFirst = removeNode(layout.first, nodeIdToRemove);
  const updatedSecond = removeNode(layout.second, nodeIdToRemove);

  // Handle the case where one child becomes null
  if (!updatedFirst) return updatedSecond; // Promote second child
  if (!updatedSecond) return updatedFirst; // Promote first child

  // If both children remain valid, return the updated parent
  return {
    ...layout,
    first: updatedFirst,
    second: updatedSecond
  };
}

interface TabGroupStore {
  tabGroups: TabGroup[];
  activeTabGroup: string | null;
  addTabGroup: (url?: string) => void;
  setActiveTabGroup: (tabGroup: TabGroup) => void;
  getTabGroupById: (tabGroupId: string | null) => TabGroup | null;
  updateTabUrl: (tabGroup: TabGroup, tab: Tab, url: string) => void;
  updateTabTitle: (tabGroup: TabGroup, tab: Tab, title: string) => void;
  updatedLayout: (newLayout: MosaicNode<string>, pActiveTabGroup?: TabGroup) => void;
  updateTabGroupOrder: (newTabGroups: TabGroup[]) => void;
  setActiveTab: (newActiveTabId: string, pActiveTabGroup?: TabGroup) => void;
  removeActiveTab: () => void;
  removeTab: (
    tabId: string,
    unregisterWebviewRef: (tabId: string) => void,
    tabGroup?: TabGroup
  ) => void;
  removeTabGroup: (tabGroupId: string) => void;
  layout: {
    split: {
      vertical: () => void;
      horizontal: () => void;
    };
  };
}

export const createTab = (url?: string): Tab => ({
  id: uuid(),
  url: url ?? 'https://google.com',
  title: undefined,
  icon: undefined
});

export const useTabGroupStore = create<TabGroupStore>((set, get) => ({
  tabGroups: [], // Initialize tabs as an empty array
  activeTabGroup: null, // Correct initialization
  addTabGroup: (url?): void =>
    set((state) => {
      const actualTab = createTab(url);

      const id = uuid();
      const newTabGroup: TabGroup = {
        id,
        active: actualTab,
        tabs: [actualTab],
        layout: actualTab.id
      };
      return {
        tabGroups: [...state.tabGroups, newTabGroup],
        activeTabGroup: newTabGroup.id
      };
    }),
  setActiveTabGroup: (tabGroup): void => {
    set({ activeTabGroup: tabGroup.id });
  },
  setActiveTab: (newActiveTabId: string, pActiveTabGroup?: TabGroup): void => {
    if (newActiveTabId === useTabGroupStore.getState().activeTabGroup) return;
    // if (!useSidebarStore.getState().isSettings)
    //   return useSidebarStore.getState().setSettings(false);
    set((state) => {
      const activeTabGroup = pActiveTabGroup ?? state.getTabGroupById(state.activeTabGroup ?? '');
      return {
        //...state
        tabGroups: state.tabGroups.map((group) =>
          group.id === activeTabGroup?.id
            ? {
                ...group,
                active: group.tabs.find((t) => t.id === newActiveTabId) ?? group.active
              }
            : group
        )
      };
    });
  },
  updateTabUrl: (tabGroup: TabGroup, tab: Tab, url: string): void =>
    set((state) => ({
      tabGroups: state.tabGroups.map((group) =>
        group.id === tabGroup.id
          ? {
              ...group,
              tabs: group.tabs.map((t) => (t.id === tab.id ? { ...t, url } : t)),
              active: group.active.id === tab.id ? { ...group.active, url } : group.active
            }
          : group
      )
    })),
  updateTabTitle: (tabGroup: TabGroup, tab: Tab, title: string): void =>
    set((state) => ({
      tabGroups: state.tabGroups.map((group) =>
        group.id === tabGroup.id
          ? {
              ...group,
              tabs: group.tabs.map((t) => (t.id === tab.id ? { ...t, title } : t)),
              active: group.active.id === tab.id ? { ...group.active, title } : group.active
            }
          : group
      )
    })),
  removeActiveTab: (): void => set({ activeTabGroup: undefined }),
  removeTab: (
    tabId: string,
    unregisterWebviewRef: (tabId: string) => void,
    tabGroup?: TabGroup
  ): void => {
    set((state) => {
      const activeTabGroup = tabGroup ?? state.getTabGroupById(state.activeTabGroup ?? '');

      if (!activeTabGroup) {
        console.warn('No active tab group found.');
        return state;
      }

      const updatedTabs = activeTabGroup.tabs.filter((tab) => tab.id !== tabId);

      // Determine the new active tab
      const newActiveTab =
        activeTabGroup.active.id === tabId
          ? updatedTabs.length > 0
            ? updatedTabs[0] // Set the first tab as active if available
            : null // No tabs left
          : activeTabGroup.active;

      if (newActiveTab === null) {
        return {
          tabGroups: state.tabGroups.filter((group) => group.id !== activeTabGroup.id),
          activeTabGroup: state.activeTabGroup === activeTabGroup.id ? null : state.activeTabGroup
        };
      }

      // We remove the tab from the dom so we dont have webview garbage
      document.getElementById(`webview-portal-root${tabId}`)?.remove();
      unregisterWebviewRef(tabId);
      const newLayout = removeNode(activeTabGroup.layout, tabId);

      return {
        tabGroups: state.tabGroups.map((group) =>
          group.id === activeTabGroup.id
            ? {
                ...group,
                layout: newLayout,
                tabs: updatedTabs,
                active: newActiveTab
              }
            : group
        ),
        activeTabGroup: newActiveTab ? state.activeTabGroup : null // Clear active group if no tabs left
      };
    });
  },
  removeTabGroup: (tabGroupId: string): void => {
    set((state) => ({
      tabGroups: state.tabGroups.filter((group) => group.id !== tabGroupId),
      activeTabGroup: state.activeTabGroup === tabGroupId ? null : state.activeTabGroup
    }));
  },
  updatedLayout: (newLayout: MosaicNode<string>, pActiveTabGroup?: TabGroup): void => {
    set((state) => {
      const activeTabGroup = pActiveTabGroup ?? state.getTabGroupById(state.activeTabGroup ?? '');
      return {
        tabGroups: state.tabGroups.map((group) =>
          group.id === activeTabGroup?.id
            ? {
                ...group,
                layout: newLayout
              }
            : group
        )
      };
    });
  },
  updateTabGroupOrder: (newTabGroups: TabGroup[]): void =>
    set(() => ({
      tabGroups: newTabGroups // Replace the array with a reordered one
    })),
  getTabGroupById: (tabGroupId): TabGroup | null => {
    if (!tabGroupId) return null;
    const { tabGroups } = get(); // Access the current state
    return tabGroups.find((group) => group.id === tabGroupId) || null;
  },
  layout: {
    split: {
      vertical: (): void => {
        set((state) => {
          const activeTabGroupId = state.activeTabGroup;

          if (!activeTabGroupId) {
            console.warn('No active tab group to split.');
            return state;
          }

          const activeTabGroup = state.tabGroups.find((group) => group.id === activeTabGroupId);

          if (!activeTabGroup) {
            console.warn('Active tab group not found.');
            return state;
          }

          const newTab = createTab(); // Create a new tab
          const updatedLayout = splitNode(
            'column',
            activeTabGroup.layout,
            activeTabGroup.active.id,
            newTab.id
          );

          return {
            tabGroups: state.tabGroups.map((group) =>
              group.id === activeTabGroupId
                ? {
                    ...group,
                    tabs: [...group.tabs, newTab], // Add the new tab
                    layout: updatedLayout, // Update the layout
                    active: newTab // Set the new tab as active
                  }
                : group
            )
          };
        });
      },
      horizontal: (): void => {
        set((state) => {
          const activeTabGroupId = state.activeTabGroup;

          if (!activeTabGroupId) {
            console.warn('No active tab group to split.');
            return state;
          }

          const activeTabGroup = state.tabGroups.find((group) => group.id === activeTabGroupId);

          if (!activeTabGroup) {
            console.warn('Active tab group not found.');
            return state;
          }

          const newTab = createTab();
          const updatedLayout = splitNode(
            'row',
            activeTabGroup.layout,
            activeTabGroup.active.id,
            newTab.id
          );

          return {
            tabGroups: state.tabGroups.map((group) =>
              group.id === activeTabGroupId
                ? {
                    ...group,
                    tabs: [...group.tabs, newTab], // Add the new tab
                    layout: updatedLayout, // Update the layout
                    active: newTab // Set the new tab as active
                  }
                : group
            )
          };
        });
      }
    }
  }
}));

export default useTabGroupStore;
if (typeof window !== 'undefined') {
  (
    window as unknown as { useTabGroupStore: UseBoundStore<StoreApi<TabGroupStore>> }
  ).useTabGroupStore = useTabGroupStore;
}

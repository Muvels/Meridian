import { create, StoreApi, UseBoundStore } from 'zustand';
import { v4 as uuid } from 'uuid';
import { MosaicNode } from 'react-mosaic-component/lib/types';

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

interface TabGroupStore {
  tabGroups: TabGroup[];
  activeTabGroup: string | null;
  addTabGroup: () => void;
  setActiveTabGroup: (tabGroup: TabGroup) => void;
  getTabGroupById: (tabGroupId: string | null) => TabGroup | null;
  updateTabUrl: (tabGroup: TabGroup, tab: Tab, url: string) => void;
  updateTabTitle: (tabGroup: TabGroup, tab: Tab, title: string) => void;
  updatedLayout: (newLayout: MosaicNode<string>, pActiveTabGroup?: TabGroup) => void;
  updateTabGroupOrder: (newTabGroups: TabGroup[]) => void;
  setActiveTab: (newActiveTabId: string, pActiveTabGroup?: TabGroup) => void;
  layout: {
    split: {
      vertical: () => void;
      horizontal: () => void;
    };
  };
}

export const createTab = (): Tab => ({
  id: uuid(),
  url: 'https://google.com',
  title: undefined,
  icon: undefined
});

export const useTabGroupStore = create<TabGroupStore>((set, get) => ({
  tabGroups: [], // Initialize tabs as an empty array
  activeTabGroup: null, // Correct initialization
  addTabGroup: (): void =>
    set((state) => {
      const actualTab = createTab();
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

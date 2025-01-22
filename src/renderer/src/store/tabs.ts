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

// A small interface for bounding boxes
interface LayoutBox {
  id: string; // tabId
  x: number; // left
  y: number; // top
  width: number; // width
  height: number; // height
}

// A helper to flatten your Mosaic layout into an array of bounding boxes.
// We'll do a DFS and split the parent region by 'splitPercentage' for row vs column.
//
// This uses normalized dimensions from 0..1 for x/y/width/height.
// So the entire mosaic is (0,0)-(1,1).
function generateLayoutBoxes(
  node: MosaicNode<string>,
  x = 0,
  y = 0,
  width = 1,
  height = 1
): LayoutBox[] {
  if (typeof node === 'string') {
    // It's a leaf. Return one bounding box for this leaf node.
    return [
      {
        id: node,
        x,
        y,
        width,
        height
      }
    ];
  }

  // It's an internal node
  const { direction, first, second, splitPercentage = 50 } = node;
  const splitRatio = splitPercentage / 100;

  if (direction === 'row') {
    // row => left/right split
    const firstWidth = width * splitRatio;
    const secondWidth = width - firstWidth;

    // Flatten first child
    const boxesFirst = generateLayoutBoxes(first, x, y, firstWidth, height);
    // Flatten second child
    const boxesSecond = generateLayoutBoxes(second, x + firstWidth, y, secondWidth, height);

    return [...boxesFirst, ...boxesSecond];
  } else {
    // column => top/bottom split
    const firstHeight = height * splitRatio;
    const secondHeight = height - firstHeight;

    // Flatten first child
    const boxesFirst = generateLayoutBoxes(first, x, y, width, firstHeight);
    // Flatten second child
    const boxesSecond = generateLayoutBoxes(second, x, y + firstHeight, width, secondHeight);

    return [...boxesFirst, ...boxesSecond];
  }
}

function getCenter(box: LayoutBox): { cx: number; cy: number } {
  return {
    cx: box.x + box.width / 2,
    cy: box.y + box.height / 2
  };
}

function isOverlappingVertically(a: LayoutBox, b: LayoutBox): boolean {
  // They overlap vertically if they have a positive intersection area, i.e.:
  // a.top < b.bottom AND a.bottom > b.top
  // with no “=” => they must actually overlap, not just touch.
  return b.y < a.y + a.height && b.y + b.height > a.y;
}

function isOverlappingHorizontally(a: LayoutBox, b: LayoutBox): boolean {
  // Similarly for x:
  return b.x < a.x + a.width && b.x + b.width > a.x;
}

// Attempts to find the best neighbor in a particular direction
// from the "activeBox". If none exist, returns null.
function findNeighborInDirection(
  boxes: LayoutBox[],
  activeBox: LayoutBox,
  direction: 'left' | 'right' | 'up' | 'down'
): LayoutBox | null {
  const { cx, cy } = getCenter(activeBox);

  let candidates: LayoutBox[] = [];

  if (direction === 'left') {
    // We want boxes whose center is to the left
    candidates = boxes.filter((b) => {
      const { cx: bx } = getCenter(b);
      // candidate must be to the left and have at least partial vertical overlap
      return bx < cx && isOverlappingVertically(activeBox, b);
    });
    // Choose the one closest in the X direction
    candidates.sort((a, b) => {
      const distA = Math.abs(getCenter(a).cx - cx);
      const distB = Math.abs(getCenter(b).cx - cx);
      return distA - distB;
    });
  }

  if (direction === 'right') {
    candidates = boxes.filter((b) => {
      const { cx: bx } = getCenter(b);
      return bx > cx && isOverlappingVertically(activeBox, b);
    });
    candidates.sort((a, b) => {
      const distA = Math.abs(getCenter(a).cx - cx);
      const distB = Math.abs(getCenter(b).cx - cx);
      return distA - distB;
    });
  }

  if (direction === 'up') {
    candidates = boxes.filter((b) => {
      const { cy: by } = getCenter(b);
      return by < cy && isOverlappingHorizontally(activeBox, b);
    });
    candidates.sort((a, b) => {
      const distA = Math.abs(getCenter(a).cy - cy);
      const distB = Math.abs(getCenter(b).cy - cy);
      return distA - distB;
    });
  }

  if (direction === 'down') {
    candidates = boxes.filter((b) => {
      const { cy: by } = getCenter(b);
      return by > cy && isOverlappingHorizontally(activeBox, b);
    });
    candidates.sort((a, b) => {
      const distA = Math.abs(getCenter(a).cy - cy);
      const distB = Math.abs(getCenter(b).cy - cy);
      return distA - distB;
    });
  }

  // Return the first candidate if it exists
  return candidates.length > 0 ? candidates[0] : null;
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
  handleNavigation: (direction: 'left' | 'right' | 'up' | 'down') => void;
  layout: {
    split: {
      vertical: (tabId?: string) => void;
      horizontal: (tabId?: string) => void;
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
      // Here we cast to MosaicNode<string>, because the new layout can not be null
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const newLayout = removeNode(activeTabGroup.layout, tabId) as MosaicNode<string>;

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
      vertical: (tabId?: string): void => {
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

          console.log(tabId ?? activeTabGroup.active.id);
          const updatedLayout = splitNode(
            'column',
            activeTabGroup.layout,
            tabId ?? activeTabGroup.active.id,
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
      horizontal: (tabId?: string): void => {
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
            tabId ?? activeTabGroup.active.id,
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
  },
  handleNavigation: (direction: 'left' | 'right' | 'up' | 'down'): void => {
    const state = get();
    if (!state.activeTabGroup) return;

    const activeTabGroup = state.getTabGroupById(state.activeTabGroup);
    if (!activeTabGroup) return;

    const layout = activeTabGroup.layout;
    if (!layout) return;

    // Flatten the entire layout into bounding boxes
    const boxes = generateLayoutBoxes(layout);

    // Find the active tab's bounding box
    const activeTabId = activeTabGroup.active.id;
    const activeBox = boxes.find((b) => b.id === activeTabId);
    if (!activeBox) return;

    // Find the neighbor in the specified direction
    const neighbor = findNeighborInDirection(boxes, activeBox, direction);
    if (!neighbor) {
      // Edge condition - no neighbor in that direction
      return;
    }

    // If found, set that neighbor's tab as active
    set(() => {
      state.setActiveTab(neighbor.id, activeTabGroup);
      return {};
    });
  }
}));

export default useTabGroupStore;
if (typeof window !== 'undefined') {
  (
    window as unknown as { useTabGroupStore: UseBoundStore<StoreApi<TabGroupStore>> }
  ).useTabGroupStore = useTabGroupStore;
}

import { useTabGroupStore } from '@renderer/store/tabs';
import { useCallback } from 'react';
import { useWebview } from 'src/contexts/WebviewContext';

interface useTabs {
  getTab(currentTabId?: string): Electron.WebviewTag | null;
}

export const useTabs = (): useTabs => {
  const { getWebviewRef } = useWebview();
  const { activeTabGroup: activeTabGroupId, getTabGroupById, tabGroups } = useTabGroupStore();
  const activeTabGroup = getTabGroupById(activeTabGroupId);

  const getTab = useCallback(
    (currentTabId?: string): Electron.WebviewTag | null => {
      console.log('activeTabGroup in useTabs ===', activeTabGroup);
      const webviewRef = getWebviewRef(currentTabId ?? activeTabGroup?.active.id);
      console.log('Retrieved WebviewRef:', webviewRef);
      return webviewRef;
    },
    [activeTabGroupId, tabGroups]
  );

  return { getTab };
};

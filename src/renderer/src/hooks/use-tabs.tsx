import { useCallback } from 'react';

import { useTabGroupStore } from '@renderer/store/tabs';
import { useWebview } from 'src/contexts/WebviewContext';

interface useTabs {
  getTab(this: void, currentTabId?: string): Electron.WebviewTag | null;
}

export const useTabs = (): useTabs => {
  const { getWebviewRef } = useWebview();
  const { activeTabGroup: activeTabGroupId, getTabGroupById, tabGroups } = useTabGroupStore();
  const activeTabGroup = getTabGroupById(activeTabGroupId);

  const getTab = useCallback(
    function (this: void, currentTabId?: string): Electron.WebviewTag | null {
      const webviewRef = getWebviewRef(currentTabId ?? activeTabGroup?.active.id ?? '');
      return webviewRef;
    },
    // We need the tabGroups dependency here...
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTabGroupId, tabGroups]
  );

  return { getTab };
};

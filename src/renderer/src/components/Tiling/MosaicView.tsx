// MosaicView.tsx
import { memo } from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import clsx from 'clsx';

import { TabGroup } from '@renderer/store/tabs';

import { Toolbar } from '../../components/Toolbar';
import { WebViewPortal } from '../../components/Webview/portal';

interface MosaicViewProps {
  tabGroups: TabGroup[];
  activeTabGroupId: string | null;
  isClickable: boolean;
  updatedLayout: (newNode: MosaicNode<string>) => void;
  setIsClickable: (val: boolean) => void;
}

export const MosaicViewComponent = (props: MosaicViewProps): JSX.Element => {
  const { tabGroups, activeTabGroupId, isClickable, updatedLayout, setIsClickable } = props;

  return (
    <>
      {tabGroups.map((tabGroup) => (
        <Mosaic
          key={tabGroup.id}
          className={clsx(
            activeTabGroupId === tabGroup.id ? '' : 'hidden',
            typeof tabGroup.layout === 'string' && 'hide-toolbar'
          )}
          // Uncontrolled approach with "initialValue" for smooth resizing
          initialValue={tabGroup.layout}
          // We only store final layout changes on "onRelease"
          onChange={() => {
            // Optionally disable pointer events while resizing
            setIsClickable(false);
          }}
          onRelease={(newNode) => {
            newNode && updatedLayout(newNode);
            setIsClickable(true);
          }}
          renderTile={(id: string, path) => {
            const tab = tabGroup.tabs.find((t) => t.id === id);
            return (
              <MosaicWindow
                path={path}
                title={(<Toolbar id={id} title={tab?.title ?? tab?.url} />) as unknown as string}
                toolbarControls={<></>}
                onDragStart={() => {
                  setIsClickable(false);
                }}
                onDragEnd={() => {
                  setIsClickable(true);
                }}
              >
                <div
                  id={`webview-portal-root${id}`}
                  style={{ width: '100%', height: '100%', position: 'relative' }}
                >
                  <WebViewPortal isVisible={true} id={id} isClickable={isClickable} />
                </div>
              </MosaicWindow>
            );
          }}
        />
      ))}
    </>
  );
};

// Wrap in memo to prevent unnecessary re-renders
export const MosaicView = memo(MosaicViewComponent);

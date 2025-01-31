import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { FC, useEffect } from 'react';
import { ChevronsUpDown, Folders } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import clsx from 'clsx';

import { Tab, TabGroup } from '@renderer/store/tabs';
import { useSettingsStore } from '@renderer/store/settings';
import { useWebview } from '@renderer/contexts/WebviewContext';

interface TabGroupItemProps {
  deleteTab: (
    tabId: string,
    unregisterWebviewRef: (tabId: string) => void,
    TabGroup: TabGroup
  ) => void;
  setActiveTabGroup: (tabGroup: TabGroup) => void;
  activeTabGroup: TabGroup | null;
  tabGroup: TabGroup;
  tab: Tab;
}

let clickTimeout: NodeJS.Timeout | null = null;

const TabGroupItem: FC<TabGroupItemProps> = ({
  setActiveTabGroup,
  tabGroup,
  activeTabGroup,
  deleteTab
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { backgroundColor, darkTheme } = useSettingsStore();
  const { unregisterWebviewRef } = useWebview();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tabGroup.id
  });

  const handleMouseDown = (): void => {
    clickTimeout = setTimeout(() => {
      // eslint-disable-next-line react-compiler/react-compiler
      clickTimeout = null;
    }, 200); // Define a threshold for drag vs click
  };

  const handleMouseUp = (executeFunction: () => void): void => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      console.log('Function executed', executeFunction);
      executeFunction();
    }
  };

  useEffect(() => {
    if (!activeTabGroup) return;
    activeTabGroup.id !== tabGroup.id && setIsOpen(false);
  }, [activeTabGroup, tabGroup.id]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
        outline: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => {
        handleMouseUp(() => activeTabGroup !== tabGroup && setActiveTabGroup(tabGroup));
      }}
    >
      {tabGroup.tabs.length > 1 ? (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          key={tabGroup.id}
          className={`px-2 py-1 cursor-pointer rounded-xl ${
            activeTabGroup?.id === tabGroup.id ? 'bg-gray-100 text-black bg-opacity-40' : ''
          }`}
        >
          <div className={clsx(``, isOpen && 'pb-2')}>
            <div className="flex justify-center items-center gap-2 ">
              <div className="bg-gray-700 bg-opacity-20 p-0.5 rounded-md px-1">
                <Folders width={17} style={{ color: darkTheme ? 'white' : 'black' }} />
              </div>
              <span style={{ color: darkTheme ? 'white' : 'black' }}>/</span>
              <span
                className="truncate w-full text-left font-semibold"
                style={{ color: darkTheme ? 'white' : 'black' }}
              >{`${tabGroup.active.title} - Gruppe`}</span>
              <CollapsibleTrigger
                asChild
                onMouseDown={handleMouseDown}
                onMouseUp={() => handleMouseUp(() => setIsOpen(!isOpen) as void)}
              >
                <button className="z-30">
                  <ChevronsUpDown
                    className="h-4 w-4"
                    style={{ color: darkTheme ? 'white' : 'black' }}
                  />
                  <span className="sr-only">Toggle</span>
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent style={{ backgroundColor }} className="space-y-1 p-1 rounded-lg">
            {tabGroup.tabs.map((tab) => (
              <div
                key={tab.id}
                className={` flex justify-between items-center p-2 cursor-pointer rounded-md ${
                  activeTabGroup?.id === tabGroup.id ? 'bg-white text-black' : ''
                }`}
              >
                <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
                <span className="truncate">{tab.title ?? tab.url}</span>
                <button
                  className="text-red-500 ml-2 z-30"
                  onMouseDown={handleMouseDown}
                  onMouseUp={() =>
                    handleMouseUp(() => deleteTab(tab.id, unregisterWebviewRef, tabGroup))
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        tabGroup.tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex justify-between items-center py-2 px-2 cursor-pointer rounded-xl ${
              activeTabGroup?.id === tabGroup.id ? 'bg-gray-100 text-black bg-opacity-40' : ''
            }`}
          >
            <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
            <div className="flex gap-2 items-center justify-start truncate">
              <div
                className="bg-gray-700 bg-opacity-20 px-1.5 rounded-full font-semibold"
                style={{ color: darkTheme ? 'white' : 'black' }}
              >
                {tab.title?.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: darkTheme ? 'white' : 'black' }}>/</span>
              <span
                className="truncate font-semibold"
                style={{ color: darkTheme ? 'white' : 'black' }}
              >
                {tab.title ?? tab.url}
              </span>
            </div>
            <button
              className="text-red-500 ml-2 z-30"
              style={{ color: darkTheme ? 'white' : 'black' }}
              onMouseDown={handleMouseDown}
              onMouseUp={() =>
                handleMouseUp(() => deleteTab(tab.id, unregisterWebviewRef, tabGroup))
              }
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TabGroupItem;

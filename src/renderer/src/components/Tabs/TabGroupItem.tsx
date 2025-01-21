import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { FC, useEffect } from 'react';
import { ChevronsUpDown, Folders } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import clsx from 'clsx';

import { Tab, TabGroup } from '@renderer/store/tabs';
import { useSettingsStore } from '@renderer/store/settings';

interface TabGroupItemProps {
  setActiveTabGroup: (tabGroup: TabGroup) => void;
  activeTabGroup: TabGroup | null;
  tabGroup: TabGroup;
  tab: Tab;
}

let clickTimeout: NodeJS.Timeout | null = null;

const TabGroupItem: FC<TabGroupItemProps> = ({ setActiveTabGroup, tabGroup, activeTabGroup }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { backgroundColor } = useSettingsStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tabGroup.id
  });

  const handleMouseDown = (): void => {
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
    }, 200); // Define a threshold for drag vs click
  };

  const handleMouseUp = (executeFunction: () => void): void => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
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
          className={`p-2 cursor-pointer rounded-md ${
            activeTabGroup?.id === tabGroup.id ? 'bg-white text-black' : ''
          }`}
        >
          <div className={clsx(``, isOpen && 'pb-2')}>
            <div className="flex justify-center items-center gap-2 ">
              <Folders width={45} />
              <span className="truncate w-full text-left">{`${tabGroup.active.title} - Gruppe`}</span>
              <CollapsibleTrigger
                asChild
                onMouseDown={handleMouseDown}
                onMouseUp={() => handleMouseUp(() => setIsOpen(!isOpen))}
              >
                <button className="z-30">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent style={{ backgroundColor }}className="space-y-1 p-1 rounded-lg">
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
                  className="text-red-500 ml-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent tab switching when closing
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
            className={`flex justify-between items-center p-2 cursor-pointer rounded-md ${
              activeTabGroup?.id === tabGroup.id ? 'bg-white text-black' : ''
            }`}
          >
            <img src={'/default-favicon.png'} alt="Favicon" className="w-4 h-4 mr-2 hidden" />
            <span className="truncate">{tab.title ?? tab.url}</span>
            <button
              className="text-red-500 ml-2"
              onClick={(e) => {
                e.stopPropagation(); // Prevent tab switching when closing
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

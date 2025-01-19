import { useSidebarStore } from '@renderer/store/sidebar';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface NativeControlsProps {
  children?: ReactNode; // `children` can be any valid React node
}

const NativeControls: React.FC<NativeControlsProps> = ({ children }) => {
  const { isPinned } = useSidebarStore();
  const handleAction = (action: 'close' | 'minimize' | 'fullscreen'): void => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('window-control', action);
  };

  return (
    <div
      className={clsx('h-9 p-3 flex items-center justify-between w-full', isPinned ? 'mt-3' : '')}
    >
      <div
        className="flex items-center gap-2 rounded-full 
                    hover:scale-105 transition-transform duration-300 ease-in-out"
      >
        <button
          className="w-3 h-3 bg-red-500 rounded-full hover:scale-125 hover:bg-red-600 active:scale-90 transition-all duration-200"
          onClick={() => handleAction('close')}
          title="Close"
        />
        <button
          className="w-3 h-3 bg-yellow-500 rounded-full hover:scale-125 hover:bg-yellow-600 active:scale-90 transition-all duration-200"
          onClick={() => handleAction('minimize')}
          title="Minimize"
        />
        <button
          className="w-3 h-3 bg-green-500 rounded-full hover:scale-125 hover:bg-green-600 active:scale-90 transition-all duration-200"
          onClick={() => handleAction('fullscreen')}
          title="Fullscreen"
        />
      </div>

      {/* Render children */}
      <div className="">{children}</div>
    </div>
  );
};

export default NativeControls;

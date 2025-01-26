import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { Maximize2, Minus, X } from 'lucide-react';

import { useSidebarStore } from '@renderer/store/sidebar';

interface NativeControlsProps {
  children?: ReactNode; // `children` can be any valid React node
}

export const NativeSidebarControls: React.FC<NativeControlsProps> = ({ children }) => {
  const { isPinned } = useSidebarStore();
  const handleAction = (action: 'close' | 'minimize' | 'fullscreen'): void => {
    if (action === 'close') return window.nativeApi.close() as void;
    if (action === 'fullscreen') return window.nativeApi.maximize() as void;
    if (action === 'minimize') return window.nativeApi.minimize() as void;
  };

  return (
    <div
      className={clsx('h-9 p-3 flex items-center justify-between w-full', isPinned ? 'mt-3' : '')}
    >
      {window.nativeApi.platform === 'darwin' && (
        <div
          className="flex items-center gap-2 rounded-full 
                    hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <button
            className="w-3 h-3 bg-red-500 rounded-xl hover:scale-125 hover:bg-red-600 active:scale-90 transition-all duration-200 flex justify-center items-center"
            onClick={() => handleAction('close')}
            title="Close"
          >
            <X className="w-2 h-2 text-black" />
          </button>
          <button
            className="w-3 h-3 bg-yellow-500 rounded-xl hover:scale-125 hover:bg-yellow-600 active:scale-90 transition-all duration-200 flex justify-center items-center"
            onClick={() => handleAction('minimize')}
            title="Minimize"
          >
            <Minus className="w-2 h-2 text-black" />
          </button>
          <button
            className="w-3 h-3 bg-green-500 rounded-xl hover:scale-125 hover:bg-green-600 active:scale-90 transition-all duration-200 flex justify-center items-center"
            onClick={() => handleAction('fullscreen')}
            title="Fullscreen"
          >
            <Maximize2 className="w-1 h-1 text-black" />
          </button>
        </div>
      )}

      {/* Render children */}
      <div className="flex gap-2">{children}</div>
    </div>
  );
};

import React, { ReactNode } from 'react';
import { Minus, X } from 'lucide-react';

interface NativeWindowsControlsProps {
  children?: ReactNode; // `children` can be any valid React node
}

export const NativeWindowsControls: React.FC<NativeWindowsControlsProps> = () => {
  const handleAction = (action: 'close' | 'minimize' | 'fullscreen'): void => {
    if (action === 'close') return window.nativeApi.close() as void;
    if (action === 'fullscreen') return window.nativeApi.maximize() as void;
    if (action === 'minimize') return window.nativeApi.minimize() as void;
  };

  return (
    window.nativeApi.platform === 'win32' && (
      <header id="" className="text-white mr-2 absolute right-1 top-0 z-50 h-full">
        <div id="drag-region">
          <div id="window-controls" className="">
            <button
              className="button w-[26px]"
              id="min-button"
              onClick={() => handleAction('minimize')}
            >
              <Minus width={22} />
            </button>

            <button
              className="button w-[26px]"
              id="max-button"
              onClick={() => handleAction('fullscreen')}
            >
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAQklEQVR4nO2WQQ4AIAzC+P+jqZ9Qp0mb7E6yDUhEXoSWE/OfgGxCAbiCeoT1DdGI0IprGNU45r9CwnQlY0qASC6yAADFfF/1mZVJAAAAAElFTkSuQmCC"
                alt="maximize-button"
                width={20}
              />
            </button>

            <button
              className="button w-[26px]"
              id="close-button"
              onClick={() => handleAction('close')}
            >
              <X width={22} />
            </button>
          </div>
        </div>
      </header>
    )
  );
};

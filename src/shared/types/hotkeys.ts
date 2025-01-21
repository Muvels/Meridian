export type Hotkeys = {
  Split: {
    vertically: string;
    horizontally: string;
  };
  Close: {
    current: string;
    all: string;
  };
  Navigate: {
    left: string;
    right: string;
    up: string;
    down: string;
    nextTab: string;
    previousTab: string;
    back: string;
    forward: string;
  };
  Resize: {
    left: string;
    right: string;
    up: string;
    down: string;
  };
  Maximize: {
    current: string;
  };
  Equalize: {
    sizes: string;
  };
  Browser: {
    openNewTab: string;
    closeTab: string;
    reload: string;
    undo: string;
    redo: string;
    reloadWithoutCache: string;
    find: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    toggleFullscreen: string;
    toggleDevTools: string;
  };
  Controls: {
    selectAll: string;
    print: string;
    toggleSidebar: string
    loseFocus: string
  };
};

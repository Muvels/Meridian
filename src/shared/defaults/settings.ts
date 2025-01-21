export const defaults = {
  settings: {
    backgroundColor: '#b7a153',
    adBlocker: false,
    hotkeys: {
      Split: {
        vertically: 'w s v',
        horizontally: 'w s h'
      },
      Close: {
        current: 'w c c',
        all: 'w c a'
      },
      Navigate: {
        left: 'w s l',
        right: 'w s r',
        up: 'w s t',
        down: 'w s b',
        nextTab: 'g, t',
        previousTab: 'g, T'
      },
      Resize: {
        left: 'ctrl+w, <',
        right: 'ctrl+w, >',
        up: 'ctrl+w, +',
        down: 'ctrl+w, -'
      },
      Maximize: {
        current: 'w m'
      },
      Equalize: {
        sizes: 'w e'
      },
      Browser: {
        openNewTab: 'w n t',
        closeTab: 'd',
        reload: 'F5',
        undo: 'F4',
        redo: 'F6',
        reloadWithoutCache: 'ctrl+r',
        find: '/',
        zoomIn: 'ctrl+plus',
        zoomOut: 'ctrl+-',
        resetZoom: 'ctrl+0',
        toggleFullscreen: 'F11',
        toggleDevTools: 'F12'
      },
      Controls: {
        print: 'ctrl+p',
        toggleUrlbar: 'meta+u',
        toggleSidebar: 'meta+s',
        sidebarVisible: 's t',
        loseFocus: 'meta+esc',
        getFocus: 'a t'
      }
    }
  }
};

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
        current: 'ctrl+w, c',
        all: 'ctrl+w, o'
      },
      Navigate: {
        left: 'ctrl+w, h',
        right: 'ctrl+w, l',
        up: 'ctrl+w, k',
        down: 'ctrl+w, j',
        nextTab: 'g, t',
        previousTab: 'g, T',
        back: 'ctrl+o',
        forward: 'ctrl+i'
      },
      Resize: {
        left: 'ctrl+w, <',
        right: 'ctrl+w, >',
        up: 'ctrl+w, +',
        down: 'ctrl+w, -'
      },
      Maximize: {
        current: 'ctrl+w, |'
      },
      Equalize: {
        sizes: 'ctrl+w, ='
      },
      Browser: {
        openNewTab: 't',
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
        selectAll: 'ctrl+a',
        print: 'ctrl+p',
        toggleSidebar: 'meta+s',
        loseFocus: 'meta+esc'
      }
    }
  }
};

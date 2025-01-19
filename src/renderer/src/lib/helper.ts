export const webviewDebugger = (
  window: Window & typeof globalThis,
  webviewRef: React.MutableRefObject<Electron.WebviewTag | null>
): void => {
  if (!window.electron) {
    // eslint-disable-next-line no-console
    console.error('❌ Electron is not available');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ Electron is available');
  }

  if (!webviewRef) {
    // eslint-disable-next-line no-console
    console.error('❌ webviewRef is not defined');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ webviewRef is defined:', webviewRef);
  }

  if (!webviewRef?.current) {
    // eslint-disable-next-line no-console
    console.error('❌ webviewRef.current is not set');
  } else {
    // eslint-disable-next-line no-console
    console.log('✅ webviewRef.current is set:', webviewRef.current);
  }
};

export interface PageFaviconUpdatedEvent extends Event {
  favicons: string[];
}

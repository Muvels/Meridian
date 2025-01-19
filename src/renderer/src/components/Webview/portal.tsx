// WebViewPortal.tsx
import { useWebview } from '@renderer/contexts/WebviewContext'
import { useRef, useEffect } from 'react'
import useTabGroupStore from '@renderer/store/tabs'

/**
 * A React component that controls a single <webview> node
 * mounted on an external DOM element (the "portal root").
 */
export function WebViewPortal({
  isVisible,
  id,
  isClickable
}: {
  isVisible: boolean
  id: string
  isClickable : boolean
}): JSX.Element | null {
  const { registerWebviewRef } = useWebview()
  const { activeTabGroup: activeTabGroupId, getTabGroupById, setActiveTab } = useTabGroupStore()
  const activeTabGroup = getTabGroupById(activeTabGroupId!)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  console.log('ID', id)

  useEffect(() => {
    // If we haven't created the container yet, do it once.
    if (!containerRef.current) {
      const portalRoot = document.getElementById(`webview-portal-root${id}`)
      if (!portalRoot) {
        console.error('No portal root found for <webview>')
        return
      }

      const handleFocus = (): void => {
        console.log('Webview gained focus:', id)
        setActiveTab(id, activeTabGroup) // Update active tab in store
      }

      // Create a DIV to hold the <webview> inside the portal root
      const container = document.createElement('div')
      container.style.width = '100%'
      container.style.height = '100%'
      // We'll hide/show this container dynamically
      container.style.display = isVisible ? 'block' : 'none'
      portalRoot.appendChild(container)
      containerRef.current = container

      // Create the <webview> element
      const webviewEl = document.createElement('webview')
      webviewRef.current = webviewEl
      registerWebviewRef(id, webviewRef.current)
      webviewEl.src = 'https://google.com'
      // Adjust any attributes you need, e.g.:
      // webviewEl.setAttribute('allowpopups', 'true');
      webviewEl.style.width = '100%'
      webviewEl.style.height = '100%'
      webviewEl.allowpopups = true
      webviewEl.webpreferences = 'sandbox'

      webviewEl.addEventListener('focus', handleFocus)

      // Append <webview> to the container
      container.appendChild(webviewEl)
    } else {
      // Just toggle visibility if the container already exists
      containerRef.current.style.display = isVisible ? 'block' : 'none'
    }

    // Cleanup logic if you ever want to remove it from DOM when unmounting
    // (Often you won't want to remove it, to keep state alive)
    return () => {
      // If you *do* want to remove it from the DOM upon unmount:
      // if (containerRef.current) {
      //   containerRef.current.remove();
      //   containerRef.current = null;
      // }
    }
  }, [isVisible, activeTabGroup, id, setActiveTab])

  useEffect(() => {
    console.log("Disable clickable?", !!webviewRef.current, isClickable)
    if (webviewRef.current) {
      webviewRef.current.style.pointerEvents = isClickable ? 'auto' : 'none'
    }
  }, [isClickable])

  // We return nothing here because the actual DOM is *outside* React's hierarchy
  return null
}

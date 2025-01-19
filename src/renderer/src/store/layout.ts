import { create } from 'zustand'
import { getNodeAtPath, updateTree } from 'react-mosaic-component'

export interface LayoutNode {
  direction: 'row' | 'column' // Defines the layout direction
  first: LayoutNode | string // First child or view ID
  second: LayoutNode | string // Second child or view ID
  splitPercentage?: number
}

interface SidebarStoreType {
  tree?: LayoutNode | string
  trees: (LayoutNode | string)[]
  setDefaulTree: (id: string) => void
  switchTree: (id: string) => void
  splitHorizontally: (activeTabId: string, newTabId: string) => void
  splitVertically: (activeTabId: string, newTabId: string) => void
  isTabVisible: (id: string) => boolean
  countColumnsInBranch: (tree: LayoutNode, id: string) => number
}

function findNodeById(root: LayoutNode | string, targetId: string): LayoutNode | string | null {
  if (typeof root === 'string') {
    return root === targetId ? root : null
  }

  // Use a stack for iteration
  const stack: LayoutNode[] = [root]

  while (stack.length > 0) {
    const currentNode = stack.pop() as LayoutNode

    if (currentNode.first === targetId || currentNode.second === targetId) {
      return currentNode
    }

    if (typeof currentNode.first !== 'string') {
      stack.push(currentNode.first)
    }

    if (typeof currentNode.second !== 'string') {
      stack.push(currentNode.second)
    }
  }

  return null
}

function findIndexById(nodes: (LayoutNode | string)[], targetId: string): number | null {
  for (let i = 0; i < nodes.length; i++) {
    if (findNodeById(nodes[i], targetId)) {
      return i
    }
  }
  return null // Not found
}

export const useLayoutStore = create<SidebarStoreType>((set) => ({
  tree: undefined,
  trees: [],

  setDefaulTree: (id): void => {
    const tree = id

    if (!useLayoutStore.getState().tree) {
      set({ tree: tree })
      return
    }

    useLayoutStore.getState().trees.push(useLayoutStore.getState().tree!)
    set({ tree })
  },

  switchTree: (id): void => {
    const tree = useLayoutStore.getState().tree
    if (typeof tree === 'string' && tree === id) return
    if (id === tree!.first || id === tree!.second) return

    const position = findIndexById(useLayoutStore.getState().trees, id)
    if (position === null) return

    useLayoutStore.getState().trees.push(useLayoutStore.getState().tree!)
    set({ tree: useLayoutStore.getState().trees.splice(position, 1)[0] })
  },

  splitHorizontally: (activeTabId, newTabId): void => {
    const currentTree = useLayoutStore.getState().tree
    if (!currentTree) return

    const targetNode = findNodeById(currentTree, activeTabId)
    console.log('targetNode', targetNode)
    if (!targetNode) return

    const newSplitNode: LayoutNode = {
      direction: 'row',
      first: activeTabId,
      second: newTabId,
      splitPercentage: 50
    }

    if (targetNode.first !== '' && targetNode.second !== '' && targetNode.first === activeTabId) {
      targetNode.first = newSplitNode
    } else if (
      targetNode.first !== '' &&
      targetNode.second !== '' &&
      targetNode.second === activeTabId
    ) {
      targetNode.second = newSplitNode
    }

    if (targetNode.first === '' || targetNode.second === '') {
      if (targetNode.second === '') {
        ;(targetNode.direction = newSplitNode.direction), (targetNode.second = newSplitNode.second)
      } else {
        ;(targetNode.direction = newSplitNode.direction), (targetNode.first = newSplitNode.second)
      }
    }

    const position = findIndexById(useLayoutStore.getState().trees, newTabId)
    if (position !== null) useLayoutStore.getState().trees.splice(position, 1)[0]

    set({ tree: { ...currentTree } })
  },

  splitVertically: (activeTabId, newTabId): void => {
    const currentTree = useLayoutStore.getState().tree
    if (!currentTree) return

    const targetNode = findNodeById(currentTree, activeTabId)
    if (!targetNode) return

    const newSplitNode: LayoutNode = {
      direction: 'column',
      first: activeTabId,
      second: newTabId,
      splitPercentage: 50
    }

    if (targetNode.first !== '' && targetNode.second !== '' && targetNode.first === activeTabId) {
      targetNode.first = newSplitNode
    } else if (
      targetNode.first !== '' &&
      targetNode.second !== '' &&
      targetNode.second === activeTabId
    ) {
      targetNode.second = newSplitNode
    }

    if (targetNode.first === '' || targetNode.second === '') {
      if (targetNode.second === '') {
        ;(targetNode.direction = newSplitNode.direction), (targetNode.second = newSplitNode.second)
      } else {
        ;(targetNode.direction = newSplitNode.direction), (targetNode.first = newSplitNode.second)
      }
    }

    const position = findIndexById(useLayoutStore.getState().trees, newTabId)
    if (position !== null) useLayoutStore.getState().trees.splice(position, 1)[0]

    set({ tree: { ...currentTree } })
  },

  isTabVisible: (id): boolean => {
    const currentTree = useLayoutStore.getState().tree
    if (!currentTree) return false
    return !!findNodeById(currentTree, id)
  },

  countColumnsInBranch: (tree, id): number => {
    let count = 1
    const current = tree

    function traverse(node, targetId): boolean {
      if (!node || typeof node === 'string') {
        return false
      }

      const { direction, first, second } = node

      if (first === targetId || second === targetId) {
        if (direction === 'column') count++
        return true
      }

      // Traverse first and second branches
      if (traverse(first, targetId)) {
        if (direction === 'column') count++
        return true
      }

      if (traverse(second, targetId)) {
        if (direction === 'column') count++
        return true
      }

      return false
    }

    traverse(current, id)
    return count
  }
}))

if (typeof window !== 'undefined') {
  ;(window as any).useLayoutStore = useLayoutStore
}

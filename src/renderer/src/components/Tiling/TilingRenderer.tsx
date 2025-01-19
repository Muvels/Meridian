import React, { useEffect } from 'react'
import clsx from 'clsx'
import { LayoutNode } from '@renderer/store/layout'
import { Tab } from '@renderer/store/tabs'
import Webview from '../Webview'

type TilingRendererProps = {
  node: LayoutNode
  children?: React.ReactNode
  counterRef?: React.MutableRefObject<number>
}

const TilingRenderer: React.FC<TilingRendererProps> = ({ node, children }) => {
  return <>{children}</>
}

export default TilingRenderer

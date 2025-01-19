import React from 'react';
import { LayoutNode } from '@renderer/store/layout';

type TilingRendererProps = {
  node: LayoutNode;
  children?: React.ReactNode;
  counterRef?: React.MutableRefObject<number>;
};

const TilingRenderer: React.FC<TilingRendererProps> = ({ node, children }) => <>{children}</>;

export default TilingRenderer;

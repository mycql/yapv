import { ReactNode } from 'react';
import { H } from './core';
import { VectorMap as VectorMapBase, ViewDisplayConfig } from '../core/models/types';

import { resolveChildNodes } from './common';

export const PlasmidMapRenderer = (h: H) => {
  return (params: ViewDisplayConfig, children: ReactNode[]) => {
    const { width, height } = params;
    const { width: viewWidth, height: viewHeight } = params.viewBox;
    const transform: string = `translate(${viewWidth / 2}, ${viewHeight / 2})`;
    const attrs = {
      height,
      width,
      'viewBox': `0 0 ${viewWidth} ${viewHeight}`,
      'preserveAspectRatio': 'xMidYMid meet',
      'shape-rendering': 'geometricPrecision ',
      'text-rendering': 'optimizeLegibility',
      'version': '1.1',
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    };
    return (
      <svg {...attrs}>
        <g transform={transform}>
          {children}
        </g>
      </svg>
    );
  };
};

export type VectorMap = {
  children?: ReactNode | ReactNode[];
} & VectorMapBase;
export type PlasmidMapComponentMaker = (h: H) => (props: VectorMap, children: ReactNode[]) => JSX.Element;
export const PlasmidMapComponent = (h: H) => {
  const render = PlasmidMapRenderer(h);
  return (props: VectorMap, children: ReactNode[]) => {
    const { displayConfig } = props;
    const actualChildren: ReactNode[] = resolveChildNodes(props.children || children);
    return render(displayConfig, actualChildren);
  };
};

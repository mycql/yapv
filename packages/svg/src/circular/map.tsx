import { ReactNode } from 'react';
import core from './core';
import { ViewDisplayConfig } from '../core/models';

const { h } = core;

export const PlasmidMap = (params: ViewDisplayConfig, children: ReactNode[]) => {
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

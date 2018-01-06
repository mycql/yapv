import { ReactNode } from 'react';
import core from './core';
import { SizedDisplayConfig } from '../../../models';

const { h } = core;

export const PlasmidMap = (params: SizedDisplayConfig, children: ReactNode[]) => {
  const transform: string = `translate(${params.width / 2}, ${params.height / 2})`;
  const { width, height } = params;
  const attrs = {
    height,
    width,
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

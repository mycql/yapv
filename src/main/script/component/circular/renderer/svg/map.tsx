import core from './core';
import { ReactNode } from 'react';

import { SizedDisplayConfig } from '../../../models';

const { h } = core;

export const PlasmidMap = (params: SizedDisplayConfig, children: ReactNode[]) => {
  const transform: string = `translate(${params.width / 2}, ${params.height / 2})`;
  return (
    <svg width={params.width} height={params.height}>
      <g transform={transform}>
        {children}
      </g>
    </svg>
  );
};

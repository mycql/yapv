import { CSSProperties, ReactNode } from 'react';
import core from './core';
import { arcAsDonutPaths } from './common';
import { TrackRenderModel } from '../../../core/src/transformer/circular/types';
import { toCamelCaseKeys } from '../../../core/src/util';

const { h } = core;

export const Track = (params: TrackRenderModel, children: ReactNode[]) => {
  const trackStyle = {...params.style, ...{ 'fill-rule': 'evenodd' }};
  const cssProps: CSSProperties = toCamelCaseKeys(trackStyle);
  const path = arcAsDonutPaths(params.annulus).join(' ');
  return (
    <g>
      <g>
        <path d={path} style={cssProps}></path>
      </g>
      <g>
        {children}
      </g>
    </g>
  );
};

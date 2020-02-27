import { CSSProperties, ReactNode } from 'react';
import { H } from './core';
import { arcAsDonutPaths } from './common';
import { TrackRenderModel } from '../core/transformer/circular/types';
import { toCamelCaseKeys } from '../core/util';

export const TrackRenderer = (h: H) => {
  return (params: TrackRenderModel, children: ReactNode[]) => {
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
};

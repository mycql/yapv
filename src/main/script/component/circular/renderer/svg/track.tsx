import core from './core';
import { CSSProperties, ReactNode } from 'react';

import { arcAsDonutPath } from './common';
import { TrackRenderModel } from '../../mapper/track';
import { toCamelCaseKeys } from '../../../util';

const { h } = core;

export const Track = (params: TrackRenderModel, children: ReactNode[]) => {
  const trackStyle = { ...{ 'fill-rule': 'evenodd' }, ...params.style };
  const cssProps: CSSProperties = toCamelCaseKeys(trackStyle);
  const path = arcAsDonutPath(params.annulus);
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

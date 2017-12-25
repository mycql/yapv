import core from './core';
import { CSSProperties, ReactNode } from 'react';

import { arcAsDonutPath } from './common';
import { AxisRenderModel } from '../../mapper/axis';
import { toCamelCaseKeys } from '../../../util';

const { h } = core;

export const Axis = (params: AxisRenderModel, children: ReactNode[]) => {
  const { axis, scales } = params;
  const axisStyle = {...{ 'fill-rule' : 'evenodd' }, ...axis.style};
  const cssProps: CSSProperties = toCamelCaseKeys(axisStyle);
  const path = arcAsDonutPath(axis.annulus);
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

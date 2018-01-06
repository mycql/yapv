import { CSSProperties, ReactNode } from 'react';
import core from './core';
import { arcAsDonutPath } from './common';
import { AxisRenderModel, ScaleRenderModel } from '../../mapper/axis';
import { toCamelCaseKeys } from '../../../util';
import { DefaultArcObject } from '../../../models';

const { h } = core;

function scalesAsPaths(scale: ScaleRenderModel): JSX.Element {
  const scaleStyle = {...scale.style, ...{ 'fill-rule' : 'evenodd' }};
  const cssProps: CSSProperties = toCamelCaseKeys(scaleStyle);
  const scalePaths = scale.ticks.map((arc: DefaultArcObject) => {
    const path = arcAsDonutPath(arc);
    return (
      <path d={path} style={cssProps}></path>
    );
  });
  return (
    <g>{scalePaths}</g>
  );
}

export const Axis = (params: AxisRenderModel, children: ReactNode[]) => {
  const { axis, scales } = params;
  const axisStyle = {...axis.style, ...{ 'fill-rule' : 'evenodd' }};
  const cssProps: CSSProperties = toCamelCaseKeys(axisStyle);
  const path = arcAsDonutPath(axis.annulus);
  const scalePaths = scales.map(scalesAsPaths);
  return (
    <g>
      <g>
        <path d={path} style={cssProps}></path>
      </g>
      <g>
        {scalePaths}
      </g>
      <g>
        {children}
      </g>
    </g>
  );
};

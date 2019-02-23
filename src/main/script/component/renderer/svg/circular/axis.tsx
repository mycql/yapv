import { CSSProperties, ReactNode } from 'react';
import core from './core';
import { arcAsDonutPaths } from './common';
import { AxisRenderModel, ScaleRenderModel, TickRenderModel } from '../../../transformer/circular/axis';
import { toCamelCaseKeys } from '../../../util';
import { Coord } from '../../../models';

const { h } = core;

function scalesAsPaths(scale: ScaleRenderModel): JSX.Element {
  const scaleStyle = {...scale.style, ...{ 'fill-rule' : 'evenodd' }};
  const cssProps: CSSProperties = toCamelCaseKeys(scaleStyle);
  const scalePaths = scale.ticks.map((coords: TickRenderModel) => {
    const from: Coord = coords[0];
    const to: Coord = coords[1];
    const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
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
  const path = arcAsDonutPaths(axis.annulus).join(' ');
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

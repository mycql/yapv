import { CSSProperties } from 'react';
import core from './core';
import { generateId } from './common';
import {
  ConnectorRenderModel,
  LabelRenderModel,
  TextRenderModel,
} from '../../mapper/label';
import { Coord, LabelTypes, Location } from '../../../models';
import { toCamelCaseKeys, toCartesianCoords } from '../../../util';

const { h } = core;

function textAlongPath(label: TextRenderModel, labelStyle: CSSProperties): JSX.Element {
  const { anglesInRadians, content, distance } = label;
  const pathStyle: CSSProperties = {
    fill: 'none',
    stroke: 'none',
  };
  let path: string = '';
  if (anglesInRadians) {
    const centerX: number = 0;
    const centerY: number = 0;
    const pathLocation: Location = anglesInRadians.path;
    const startAngle: number = pathLocation.start;
    const endAngle: number = pathLocation.end;
    const start: Coord = toCartesianCoords(centerX, centerY, distance, startAngle);
    const end: Coord = toCartesianCoords(centerX, centerY, distance, endAngle);
    let arcSweep;
    if (startAngle < endAngle) {
      arcSweep = endAngle - startAngle <= Math.PI ? '0' : '1';
    } else {
      arcSweep = endAngle - startAngle <= Math.PI ? '1' : '0';
    }
    path = [
      `M ${start.x} ${start.y}`,
      `A ${distance} ${distance} 0 ${arcSweep} 1 ${end.x} ${end.y}`,
    ].join(' ');
  }
  const pathId: string = `tpath${generateId()}`;
  const pathRef: string = `#${pathId}`;
  const attrs = {
    'xlink:href': pathRef,
    'href': pathRef,
  };
  return (
    <g>
      <path id={pathId} style={pathStyle} d={path}></path>
      <text dy='0.5ex' style={labelStyle}>
        <textPath {...attrs}>{content}</textPath>
      </text>
    </g>
  );
}

function textAlongAxis(label: TextRenderModel, labelStyle: CSSProperties): JSX.Element {
  const { content, position } = label;
  return (
    <text dy='0.5ex' x={position.x} y={position.y} style={labelStyle}>{content}</text>
  );
}

export const Label = (params: LabelRenderModel) => {
  const { connector, label, type } = params;
  const { style } = label;
  const labelStyle = style || {};
  const textAnchor: string = type === LabelTypes.TEXT ? 'middle' : 'start';
  const normLabelStyle = { ...labelStyle, ...{ 'text-anchor': textAnchor } };
  const cssProps: CSSProperties = toCamelCaseKeys(normLabelStyle);
  return type === LabelTypes.TEXT ? textAlongAxis(label, cssProps) : textAlongPath(label, cssProps);
};
